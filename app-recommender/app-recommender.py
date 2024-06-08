from faststream import FastStream
from faststream.rabbit import RabbitBroker
import pandas as pd
from txtai.embeddings import Embeddings
import requests

# TODO: Doesn't work yet. Data should be read from mongo.

broker = RabbitBroker(host="rabbitmq")
app = FastStream(broker)

print("Loading embeddings")
description_embeddings_path = 'embeddings-description'
description_embeddings = Embeddings()
description_embeddings.load(description_embeddings_path)
print("Description embeddings loaded")
name_embeddings_path = 'embeddings-name'
name_embeddings = Embeddings()
name_embeddings.load(name_embeddings_path)
print("Name embeddings loaded")

def get_item_by_name_from_flask(item_name):
    try:
        url = f'http://app-flask:5000/app-flask/item-by-name/{item_name}'
        response = requests.get(url)
        if response.status_code == 200:
            item = response.json()
            return item
        else:
            print(f"Error: Received status code {response.status_code}")
            return None
    except Exception as e:
        print(f"Error making request: {e}")
        return None

def merge_results(result_description, result_name):
    desc_dict = dict(result_description)
    name_dict = dict(result_name)

    all_names = set(desc_dict.keys()).union(set(name_dict.keys()))

    result = []
    for name in all_names:
        desc_value = desc_dict.get(name, 0)
        name_value = name_dict.get(name, 0)
        total = desc_value + name_value
        result.append({
            "name": name,
            "result_description": desc_value,
            "result_name": name_value,
            "total": total
        })

    return result

def calculate_total(merged_results, description_factor=1, name_factor=1.5, rating_factor=2):
    calculated_results = []
    for obj in merged_results:
        item = get_item_by_name_from_flask(obj["name"])
        if item:
            if 'rating' in item:
                rating = item["rating"]
            else:
                rating = 0
            total_value = (
                obj['result_name'] * name_factor +
                obj['result_description'] * description_factor +
                rating/5 * rating_factor
            )
            calculated_results.append((obj['name'], total_value))
    
    calculated_results.sort(key=lambda x: x[1], reverse=True)
    
    return calculated_results

def save_embeddings():
    description_embeddings.save(description_embeddings_path)
    name_embeddings.save(name_embeddings_path)
    print("Embeddings saved!")

@broker.subscriber("to_recommender")
async def handle(msg):
    print("I received: ", msg)
    result = []
    if msg["name"] and msg["query"]:
        print("Getting recommendations based on both name and description")
        result_description = description_embeddings.search(msg["query"], msg["amount"]+3)
        result_name = name_embeddings.search(msg["name"], msg["amount"]+3)
        merged_results = merge_results(result_description, result_name)
        result = calculate_total(merged_results, msg["description_factor"], msg["name_factor"], msg["rating_factor"])
    elif msg["query"]:
        print("Getting recommendations based on description")
        result = description_embeddings.search(msg["query"], msg["amount"]+3)
    elif msg["name"]:
        print("Getting recommendations based on name")
        result = name_embeddings.search(msg["name"], msg["amount"]+3)

    print("Sending: ", result)
    return result

@broker.subscriber("index_upsert")
async def handle(msg):
    print("I received: ", msg)
    try:
        description_embeddings.upsert([(msg["name"], msg["description"], None)])
        name_embeddings.upsert([(msg["name"], msg["name"], None)])

        save_embeddings()

        return "Upserted to embeddings successfully"
    except Exception as e:
        result = "Error upserting to embeddings: " + str(e)
        print(result)
        return result