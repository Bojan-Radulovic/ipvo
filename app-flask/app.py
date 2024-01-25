from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import json
import asyncio
from faststream.rabbit import RabbitBroker

application = Flask(__name__)

mongo_client = MongoClient('mongodb://mongodb:27017/')

db = mongo_client['calendar_app_database']

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
        print("Retrived: ", item)

        if item:
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

        db['items'].insert_one(document)

        print(f"Event data written to MongoDB: {document}")

        return f"Item {name} added successfully"
    except Exception as e:
        print(f"Error writing data: {e}")
        return "Error writing data"

@application.route('/app-flask/populate')
def populate_database():
    try:
        with open('example_items.json', 'r') as file:
            example_items = json.load(file)

        for item in example_items:
            db['items'].insert_one(item)
            print(f"Item added to MongoDB: {item}")

        return "All items added successfully"
    except Exception as e:
        print(f"Error populating database: {e}")
        return "Error populating database"
    
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
