import os
import base64
from dotenv import load_dotenv
from pymongo import MongoClient
from gridfs import GridFS
from bson import ObjectId
from groq import Groq

# Load environment variables
load_dotenv()

# MongoDB Setup
client = MongoClient(os.environ.get('MONGO_CONN'))
db = client["test"]
fs = GridFS(db)

# Groq API Key
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# Step 2: Encode Image from GridFS
def encode_image(image_id):
    try:
        image_file = fs.get(ObjectId(image_id))  # Safely cast to ObjectId
        image_content = image_file.read()
        if not image_content:
            raise ValueError("Image content is empty")
        return base64.b64encode(image_content).decode('utf-8')
    except Exception as e:
        print(f"❌ Error in encode_image: {e}")
        raise

# Step 3: Send to Groq Multimodal LLM
def analyze_image_with_query(query, encoded_image, model="meta-llama/llama-4-scout-17b-16e-instruct"):
    client = Groq(api_key=GROQ_API_KEY)
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": query},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}},
            ],
        }
    ]
    try:
        chat_completion = client.chat.completions.create(messages=messages, model=model)
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"❌ Error in analyze_image_with_query: {e}")
        raise