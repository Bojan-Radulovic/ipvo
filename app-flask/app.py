from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import json
import asyncio
from faststream.rabbit import RabbitBroker
import pandas as pd
import os

import boto3
from botocore.client import Config

application = Flask(__name__)

mongo_client = MongoClient('mongodb://mongodb:27017/')

db = mongo_client['calendar_app_database']

s3 = boto3.resource('s3',
                    endpoint_url='http://minio:9000',
                    aws_access_key_id='minio_user',
                    aws_secret_access_key='minio_password',
                    config=Config(signature_version='s3v4'))

@application.route('/app-flask/items')
def get_items():
    items = list(db['items'].find())
    items_with_string_ids = [
        {**item, '_id': str(item['_id'])} for item in items
    ]
    for item in items_with_string_ids:
        s3 = boto3.client('s3',
                    endpoint_url='http://minio:9000',
                    aws_access_key_id='minio_user',
                    aws_secret_access_key='minio_password')

        item['imageUrl'] = s3.generate_presigned_url('get_object',
                                                    Params={'Bucket': 'photos',
                                                            'Key': str(item["_id"]) + '.jpg'},
                                                    ExpiresIn=3600)
        item['imageUrl'] = 'http://localhost' + item['imageUrl'][12:]
    return jsonify(items_with_string_ids)

@application.route('/app-flask/items-pagination')
def get_items_pagination():
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 9))
    total_items = db['items'].count_documents({})
    total_pages = (total_items + page_size - 1) // page_size

    print("Recived:")
    print("Page: ", page)
    print("Page_size: ", page_size)
    print("Total_pages: ", total_pages)

    page = max(min(max(1, page), total_pages), 1)

    print("Changed to:")
    print("Page: ", page)
    print("Page_size: ", page_size)
    
    skip = (page - 1) * page_size
    limit = page_size

    print("Skip: ", skip)
    print("Limit: ", limit)

    s3 = boto3.client('s3',
                    endpoint_url='http://minio:9000',
                    aws_access_key_id='minio_user',
                    aws_secret_access_key='minio_password')
    items = list(db['items'].find().skip(skip).limit(limit))
    # retrieve image urls for all items
    for item in items:
        try:
            if item['extension']:
                item['imageUrl'] = s3.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'photos',
                                                                'Key': str(item['_id']) + item['extension']},
                                                        ExpiresIn=3600)
                item['imageUrl'] = 'http://localhost' + item['imageUrl'][12:]
        except Exception as e:
            print(e)

    items_with_string_ids = [
        {**item, '_id': str(item['_id'])} for item in items
    ]

    
    response = {
        'items': items_with_string_ids,
        'total_pages': total_pages,
        'page': page,
    }
    
    return jsonify(response)

@application.route('/app-flask/item/<itemId>')
def get_item_by_id(itemId):
    try:
        print("Getting object ", itemId)
        item_id = ObjectId(itemId)
        item = db['items'].find_one({'_id': item_id}, {'_id': 0})

        s3 = boto3.client('s3',
                    endpoint_url='http://minio:9000',
                    aws_access_key_id='minio_user',
                    aws_secret_access_key='minio_password')

        item['imageUrl'] = s3.generate_presigned_url('get_object',
                                                    Params={'Bucket': 'photos',
                                                            'Key': str(item_id) + "." + item['extension']},
                                                    ExpiresIn=3600)
        item['imageUrl'] = 'http://localhost' + item['imageUrl'][12:]
        print("Retrived: ", item)
        item['_id'] = str(item_id)

        if item:
            print(item)
            return jsonify(item)
        else:
            return "Item not found", 404
    except Exception as e:
        print(f"Error retrieving item: {e}")
        return "Error retrieving item"
    
@application.route('/app-flask/item-new/<itemId>')
def get_item_by_id_new(itemId):
    try:
        print("Getting object ", itemId)
        item_id = ObjectId(itemId)
        item = db['items'].find_one({'_id': item_id}, {'_id': 0})
        print("Retrived: ", item)
        item['_id'] = str(item_id)

        s3 = boto3.client('s3',
                    endpoint_url='http://minio:9000',
                    aws_access_key_id='minio_user',
                    aws_secret_access_key='minio_password')
        
        item['imageUrl'] = s3.generate_presigned_url('get_object',
                                                    Params={'Bucket': 'photos',
                                                            'Key': str(item_id) + item['extension']},
                                                    ExpiresIn=3600)
        item['imageUrl'] = 'http://localhost' + item['imageUrl'][12:]

        if item:
            print(item)
            return jsonify(item)
        else:
            return "Item not found", 404
    except Exception as e:
        print(f"Error retrieving item: {e}")
        return "Error retrieving item"

@application.route('/app-flask/item-by-name/<itemName>')
def get_item_by_name(itemName, raw=False):
    try:
        print("Getting object by name: ", itemName)
        item = db['items'].find_one({'name': itemName})
        print("Retrieved: ", item)
        if item:
            item['_id'] = str(item['_id'])
            if raw:
                return item
            return jsonify(item)
        else:
            return "Item not found", 404
    except Exception as e:
        print(f"Error retrieving item: {e}")
        return "Error retrieving item"

@application.route('/app-flask/write', methods=['POST'])
async def write_database_page():
    try:
        name = request.args.get('name')
        price = float(request.args.get('price'))
        available = bool(request.args.get('available'))
        category = request.args.get('category')
        description = request.args.get('description')

        document = {
            'name': name,
            'price': price,
            'available': available,
            'category': category,
            'description': description
        }

        item = db['items'].insert_one(document)
        print("New item's ID: ", item.inserted_id)
    
        print(f"Event data written to MongoDB: {document}")

        bucket_name = 'photos'

        available_buckets = [bucket.name for bucket in s3.buckets.all()]
        if bucket_name not in available_buckets:
            s3.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={
                    'LocationConstraint': 'eu-west-1'}
            )
        image = request.files['file']
        source_name = image.filename
        image.save(source_name)

        
        db['items'].update_one(
            {'_id': item.inserted_id},
            {'$set': {'extension': os.path.splitext(source_name)[-1]}}
        )


        destination_name = str(item.inserted_id) + os.path.splitext(source_name)[-1]
        s3.Bucket(bucket_name).upload_file(source_name, destination_name)

        msg_data = {
            '_id': str(item.inserted_id),
            'description': description,
            'name': name,
        }

        async with RabbitBroker(host="rabbitmq") as broker:
            msg = await broker.publish(
                msg_data,
                queue="index_upsert",
                rpc=True,
            )
        print("I received response from recommender: ", msg)

        os.remove(source_name)
        return {
            "message": f"Item {name} added successfully",
            "_id": str(item.inserted_id)
        }
    except Exception as e:
        print(f"Error writing data: {e}")
        return "Error writing data"

@application.route('/app-flask/placeorder', methods=['POST'])
async def place_order():
    try:
        order = request.get_json()
        email_body = "Thank you for your business!: \n \nYour order:\n \n"
        print(order["items"])

        total = 0
        for item in order["items"]:
            print(item["item_id"])
            db_item = db['items'].find_one({'_id': ObjectId(item["item_id"])}, {'_id': 0})
            print(db_item)
            email_body += db_item["name"] + ": " + str(db_item["price"]) + " EUR  x" + str(item["quantity"]) + "\n"
            total += db_item["price"] * int(item["quantity"])

        email_body += "Total: " + str(total) + " EUR\n"
        #print(order["items"])

        new_order = {
            'items': order["items"],
            'email': order["email"]
        }

        item = db['orders'].insert_one(new_order)
        print("New item's ID: ", item.inserted_id)
    
        print(f"Event data written to MongoDB: {new_order}")
        
        email_data = {
            'to': order["email"],
            'subject': 'Your order has been placed!',
            'body': email_body,
        }

        async with RabbitBroker(host="rabbitmq") as broker:
            msg = await broker.publish(
                email_data,
                queue="to_email",
                rpc=True,
            )

        return {
            "message": f"Order added successfully",
            "_id": str(item.inserted_id)
        }
    except Exception as e:
        print(f"Error writing data: {e}")
        return "Error writing data"

@application.route('/app-flask/orders')
def get_orders():
    items = list(db['orders'].find())
    items_with_string_ids = [
        {**item, '_id': str(item['_id'])} for item in items
    ]
    return jsonify(items_with_string_ids)

@application.route('/app-flask/order/<orderId>')
def get_order_by_id(orderId):
    try:
        print("Getting object ", orderId)
        order_id = ObjectId(orderId)
        order = db['orders'].find_one({'_id': order_id}, {'_id': 0})

        if order:
            print(order)
            return jsonify(order)
        else:
            return "Order not found", 404
    except Exception as e:
        print(f"Error retrieving order: {e}")
        return "Error retrieving order"

@application.route('/app-flask/populate')
def populate_database():
    try:
        with open('example_items.json', 'r') as file:
            example_items = json.load(file)

        for item in example_items:
            example_item_name = item["name"]
            item = db['items'].insert_one(item)
            print("New item's ID: ", item.inserted_id)
            
            bucket_name = 'photos'

            available_buckets = [bucket.name for bucket in s3.buckets.all()]
            if bucket_name not in available_buckets:
                s3.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={
                        'LocationConstraint': 'eu-west-1'}
                )
            source_name = example_item_name + '.jpg'
            destination_name = str(item.inserted_id) + '.jpg'
            s3.Bucket(bucket_name).upload_file(source_name, destination_name)

        return "All items added successfully"
    except Exception as e:
        print(f"Error populating database: {e}")
        return "Error populating database"
    
@application.route('/app-flask/populate_new')
def populate_database_new():
    try:
        print("Populate database process started")
        file_path = 'meta_Video_Games.jsonl'

        fields_to_check = ['title', 'main_category', 'description', 'images', 'price']
        chunk_size = 1000
        inserted_count = 0

        def process_chunk(chunk):
            print("Processing chunk")
            filtered_df = chunk.dropna(subset=fields_to_check, how='any')

            def create_document(row):
                description = row['description'][0] if row['description'] else ''
                img = row['images'][0].get('large', '') if row['images'] else ''
                document = {
                    'name': row['title'],
                    'price': row['price'],
                    'available': row['price'] is not None,
                    'category': row['main_category'],
                    'description': description,
                    'imageUrl': img,
                    'rating': row['average_rating']
                }
                inserted_document = db['items'].insert_one(document)
                return inserted_document.inserted_id

            items = filtered_df.apply(create_document, axis=1)
            return len(items)

        with pd.read_json(file_path, lines=True, chunksize=chunk_size) as reader:
            for chunk in reader:
                inserted_count += process_chunk(chunk)

        print(f"Successfully inserted {inserted_count} items")
        return f"Successfully inserted {inserted_count} items"
    except Exception as e:
        print(f"Error populating database: {e}")
        return "Error populating database"

@application.route('/app-flask/testminio')
def test_minio():
    bucket_name = 'test'

    available_buckets = [bucket.name for bucket in s3.buckets.all()]
    #print(available_buckets)
    if bucket_name not in available_buckets:
        s3.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration={
                'LocationConstraint': 'eu-west-1'}
        )

    source_name = 'requirements.txt'
    destination_name = 'requirements.txt'
    s3.Bucket(bucket_name).upload_file(source_name, destination_name)

    objects = []
    for obj in s3.Bucket(bucket_name).objects.all():
        objects.append(obj.key)
    
    if destination_name in objects:
        return "Sucess saving!"
    else:
        return "Failure saving!"

@application.route('/app-flask/getminiourl')
def test_minio_url():
    s3 = boto3.client('s3',
                    endpoint_url='http://minio:9000',
                    aws_access_key_id='minio_user',
                    aws_secret_access_key='minio_password')
    bucket_name = 'photos'
    filename = request.args.get('filename') + '.jpg'

    upload_data = s3.generate_presigned_post(bucket_name, # (3)
                                                    filename,
                                                    ExpiresIn=3600)
    return jsonify(upload_data)
    
@application.route('/app-flask/send-email', methods=['POST'])
async def send_email():
    print("Sending email data: ")
    try:
        data = request.json
        to = data.get('to')
        subject = data.get('subject')
        body = data.get('body')
        print("To: ", to, "\n\n\nSubject: ", subject, "\n\n\nBody: ", body)

        email_data = {
            'to': to,
            'subject': subject,
            'body': body,
        }

        async with RabbitBroker(host="rabbitmq") as broker:
            msg = await broker.publish(
                email_data,
                queue="to_email",
                rpc=True,
            )
        
        print("I received: ", msg)
        return msg
    except Exception as e:
        print(f"Error sending email: {e}")
        return "Error sending email"

@application.route('/app-flask/export')
def export_database_jsonl():
    print("Exporting...")
    try:
        items = list(db['items'].find())

        with open('exported_data.jsonl', 'w') as jsonl_file:
            for item in items:
                item['_id'] = str(item['_id'])
                jsonl_file.write(json.dumps(item) + '\n')

        print("Successfully inserted exported database")
        return "Successfully inserted exported database"
    except Exception as e:
        print(f"Error exporting database: {e}")
        return "Error exporting database"

@application.route('/app-flask/recommender', methods=['GET'])
async def recommender():
    try:
        print("Getting recommendations")
        query = request.args.get('query', None)
        amount = int(request.args.get('amount', None))
        name = request.args.get('name', None)
        description_factor = request.args.get('description_factor')
        name_factor = request.args.get('name_factor')
        rating_factor = request.args.get('rating_factor')
        if description_factor:
            description_factor = float(description_factor)
        else:
            description_factor = 1
        if name_factor:
            name_factor = float(name_factor)
        else:
            name_factor = 1.25
        if rating_factor:
            rating_factor = float(rating_factor)
        else:
            rating_factor = 1.25
        print("I received:")
        print("Query: ", query)
        print("Amount: ", amount)
        print("Name: ", amount)
        print("description_factor: ", description_factor)
        print("name_factor: ", name_factor)
        print("rating_factor: ", rating_factor)
        
        msg_data = {
            'query': query,
            'amount': amount,
            'name': name,
            "description_factor": description_factor,
            "name_factor": name_factor,
            "rating_factor": rating_factor,
        }

        async with RabbitBroker(host="rabbitmq") as broker:
            msg = await broker.publish(
                msg_data,
                queue="to_recommender",
                rpc=True,
            )
        print("I received response from recommender: ", msg)

        items = []
        for name_result, score in msg:
            if name_result != name:
                items.append(get_item_by_name(name_result, raw=True))

        response = {
            'items': items[:amount],
        }

        print("Sending items: ", response)
        return jsonify(response)
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        return "Error getting recommendations"

if __name__ == '__main__':
    application.run()
