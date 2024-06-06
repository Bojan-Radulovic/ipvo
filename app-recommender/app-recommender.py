from faststream import FastStream
from faststream.rabbit import RabbitBroker
import pandas as pd
from txtai.embeddings import Embeddings

# TODO: Doesn't work yet. Data should be read from mongo.

broker = RabbitBroker(host="rabbitmq")
app = FastStream(broker)

print("Loading embeddings")
embeddings_path = 'embeddings'
embeddings = Embeddings()
embeddings.load(embeddings_path)
print("Embeddings loaded")

@broker.subscriber("to_recommender")
async def handle(msg):
    print("I received: ", msg)
    print("Types: ", type(msg["query"]), " ", type(msg["amount"]))
    result = embeddings.search(msg["query"], msg["amount"])
    print("Sending: ", result)
    return result
