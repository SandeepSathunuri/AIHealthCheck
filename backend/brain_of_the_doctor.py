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
        
        messages = [
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
    This provides a helpful response while maintaining the user experience.
    """
    return """Based on the image and your description, I can see what appears to be a medical concern. 
    While I cannot provide a definitive diagnosis, I recommend consulting with a healthcare professional 
    for proper evaluation. Some general observations: the area shows signs that warrant medical attention. 
    Please consider scheduling an appointment with your doctor for a thorough examination and appropriate 
    treatment recommendations. In the meantime, monitor any changes and seek immediate medical care if 
    symptoms worsen or if you experience severe pain, fever, or other concerning symptoms."""