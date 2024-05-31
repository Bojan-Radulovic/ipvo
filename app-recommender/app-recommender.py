from faststream import FastStream
from faststream.rabbit import RabbitBroker
import pandas as pd
from pymongo import MongoClient
from txtai.embeddings import Embeddings

# TODO: Doesn't work yet. Data should be read from mongo.

broker = RabbitBroker(host="rabbitmq")
app = FastStream(broker)

file_path = 'meta_Video_Games.jsonl'

df = pd.read_json(file_path, lines=True)

mongo_client = MongoClient('mongodb://mongodb:27017/')
db = mongo_client['calendar_app_database']

fields_to_check = ['title', 'main_category', 'description', 'images', 'price']

filtered_df = df.dropna(subset=fields_to_check, how='any')

def create_document(row):
    description = row['description'][0] if row['description'] else ''
    img = row['images'][0].get('large', '') if row['images'] else ''
    document = {
        'name': row['title'],
        'price': row['price'],
        'available': row['price'] is not None,
        'category': row['main_category'],
        'description': description,
        'img': img,
    }
    inserted_document = db['items'].insert_one(document)
    return inserted_document.inserted_id

items = filtered_df.apply(create_document, axis=1)
print(type(items))
print(len(items))

embeddings = Embeddings({"path": "sentence-transformers/nli-mpnet-base-v2"})

embeddings_data = [(uid, row['description'], None) for uid, row in zip(items, filtered_df.itertuples())]
embeddings.index(embeddings_data)

@broker.subscriber("to_email")
async def handle(msg):
    print("I received: ", msg)
