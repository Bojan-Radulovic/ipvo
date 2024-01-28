from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import json
import asyncio
from faststream.rabbit import RabbitBroker

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
    return jsonify(items_with_string_ids)

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
                                                            'Key': str(item_id) + '.jpg'},
                                                    ExpiresIn=3600)
        item['imageUrl'] = 'http://localhost' + item['imageUrl'][12:]
        print("Retrived: ", item)

        if item:
            print(item)
            return jsonify(item)
        else:
            return "Item not found", 404
    except Exception as e:
        print(f"Error retrieving item: {e}")
        return "Error retrieving item"

@application.route('/app-flask/write')
def write_database_page():
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
            bucket_name = 'photos'

            available_buckets = [bucket.name for bucket in s3.buckets.all()]
            if bucket_name not in available_buckets:
                s3.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={
                        'LocationConstraint': 'eu-west-1'}
                )
            source_name = 'test.jpg'
            destination_name = item['name'] + '.jpg'
            s3.Bucket(bucket_name).upload_file(source_name, destination_name)

            db['items'].insert_one(item)
            print(f"Item added to MongoDB: {item}")

        return "All items added successfully"
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

if __name__ == '__main__':
    application.run()
