import os
from groq import Groq
import base64
from pymongo import MongoClient
from gridfs import GridFS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Connect to MongoDB (same connection as main.py)
client = MongoClient(os.environ.get('MONGO_CONN'))
db = client["test"]
fs = GridFS(db)  # Initialize GridFS

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# Step 2: Convert the Image to required Format
def encode_image(image_id):
    # Retrieve image content from GridFS using the ObjectId
    image_file = fs.get(image_id)
    image_content = image_file.read()
    return base64.b64encode(image_content).decode('utf-8')

# Step 3: SetUp MultiModel LLM
def analyze_image_with_query(query, encoded_image, model="meta-llama/llama-4-scout-17b-16e-instruct"):
    client = Groq(api_key=GROQ_API_KEY)
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": query},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"},
                },
            ],
        }
    ]
    chat_completion = client.chat.completions.create(messages=messages, model=model)
    return chat_completion.choices[0].message.content