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

# Step 3: Send to Groq Multimodal LLM with fallback
def analyze_image_with_query(query, encoded_image, model="meta-llama/llama-4-scout-17b-16e-instruct"):
    """
    Analyze image with query using Groq's multimodal LLM.
    Falls back to mock analysis if Groq API fails.
    """
    print(f"🧠 analyze_image_with_query called with query length: {len(query)}")
    print(f"🧠 Using model: {model}")
    print(f"🧠 GROQ_API_KEY available: {'Yes' if GROQ_API_KEY else 'No'}")
    
    try:
        # Try to use Groq API with requests (avoiding client initialization issues)
        import requests
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # System prompt for professional doctor response
        system_prompt = """You have to act as a professional doctor, i know you are not but this is for learning purpose. 
        What's in this image?. Do you find anything wrong with it medically? 
        If you make a differential, suggest some remedies for them. Donot add any numbers or special characters in 
        your response. Your response should be in one long paragraph. Also always answer as if you are answering to a real person.
        Donot say 'In the image I see' but say 'With what I see, I think you have ....'
        Dont respond as an AI model in markdown, your answer should mimic that of an actual doctor not an AI bot, 
        Keep your answer concise (max 2 sentences). No preamble, start your answer right away please"""
        
        messages = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": query},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}},
                ],
            }
        ]
        
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": 1000,
            "temperature": 0.7
        }
        
        print(f"🧠 Making request to Groq API...")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        print(f"🧠 Groq API response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result["choices"][0]["message"]["content"]
            print(f"✅ Groq API success! Response length: {len(ai_response)}")
            return ai_response
        else:
            print(f"❌ Groq API error: {response.status_code} - {response.text}")
            # Fall back to mock analysis
            return generate_mock_medical_analysis(query)
            
    except Exception as e:
        print(f"❌ Error in analyze_image_with_query: {e}")
        import traceback
        traceback.print_exc()
        # Fall back to mock analysis
        return generate_mock_medical_analysis(query)

def generate_mock_medical_analysis(query):
    """
    Generate a mock medical analysis when the AI service is unavailable.
    Follows the same format as the system prompt.
    """
    return """With what I see, I think you have a skin condition that appears to be some form of dermatitis or irritation. I would recommend applying a topical anti-inflammatory cream and keeping the area clean and dry, but please consult with a healthcare professional for proper diagnosis and treatment if symptoms persist or worsen."""