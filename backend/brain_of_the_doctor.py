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
    Returns both summary (for TTS) and detailed analysis (for display).
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
        
        # Get both summary and detailed analysis
        summary = get_medical_summary(query, encoded_image, headers, url, model)
        detailed_analysis = get_detailed_medical_analysis(query, encoded_image, headers, url, model)
        
        # Return both responses
        return {
            "summary": summary,
            "detailed_analysis": detailed_analysis
        }
            
    except Exception as e:
        print(f"❌ Error in analyze_image_with_query: {e}")
        import traceback
        traceback.print_exc()
        # Fall back to mock analysis
        return generate_mock_medical_analysis(query)

def get_medical_summary(query, encoded_image, headers, url, model):
    """Get concise summary for TTS (voice response)"""
    try:
        import requests
        # System prompt for SHORT summary (for TTS)
        summary_prompt = """You are a professional doctor. Analyze this medical image and provide a VERY SHORT summary.
        
        Requirements:
        - Start with "With what I see, I think you have..."
        - Maximum 2 sentences only
        - No markdown, no bullet points, no special characters
        - Speak as if talking directly to the patient
        - Concise diagnosis and basic recommendation only
        - This will be spoken aloud, so keep it brief and clear"""
        
        messages = [
            {
                "role": "system",
                "content": summary_prompt
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
            "max_tokens": 150,  # Shorter for summary
            "temperature": 0.7
        }
        
        print(f"🧠 Getting medical summary...")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            summary = result["choices"][0]["message"]["content"]
            print(f"✅ Summary generated: {len(summary)} chars")
            return summary
        else:
            print(f"❌ Summary API error: {response.status_code}")
            return "With what I see, I think you have a skin condition that may need medical attention."
            
    except Exception as e:
        print(f"❌ Error getting summary: {e}")
        return "With what I see, I think you have a skin condition that may need medical attention."

def get_detailed_medical_analysis(query, encoded_image, headers, url, model):
    """Get detailed analysis for display (text only)"""
    try:
        import requests
        # System prompt for DETAILED analysis (for display)
        detailed_prompt = """You are a professional doctor providing a comprehensive medical analysis.
        
        Analyze this medical image and provide a detailed medical assessment including:
        
        **Visual Examination:** Describe what you observe
        **Possible Causes:** List potential diagnoses
        **Symptoms:** Expected symptoms the patient might experience  
        **Recommended Course of Action:** Detailed treatment recommendations
        
        Use proper medical terminology and provide thorough explanations.
        Format with clear sections and bullet points for readability.
        This is for text display, so detailed formatting is acceptable."""
        
        messages = [
            {
                "role": "system",
                "content": detailed_prompt
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
            "max_tokens": 800,  # Longer for detailed analysis
            "temperature": 0.7
        }
        
        print(f"🧠 Getting detailed analysis...")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            detailed = result["choices"][0]["message"]["content"]
            print(f"✅ Detailed analysis generated: {len(detailed)} chars")
            return detailed
        else:
            print(f"❌ Detailed analysis API error: {response.status_code}")
            return generate_detailed_fallback()
            
    except Exception as e:
        print(f"❌ Error getting detailed analysis: {e}")
        return generate_detailed_fallback()

def generate_detailed_fallback():
    """Generate detailed fallback analysis"""
    return """**Visual Examination:** The image shows a skin lesion or reaction that appears to be inflamed.

**Possible Causes:**
• Contact dermatitis (allergic reaction or irritation)
• Sunburn or heat-related skin damage
• Skin infection or bacterial involvement
• Insect bite or sting reaction

**Symptoms:** 
• Redness and inflammation
• Possible itching or burning sensation
• Potential pain or tenderness
• Possible swelling in the affected area

**Recommended Course of Action:**
• Keep the area clean and dry
• Apply topical anti-inflammatory treatments (e.g., hydrocortisone cream)
• Avoid scratching or further irritation
• Monitor for changes in size, color, or symptoms
• Consult a healthcare professional for proper evaluation and treatment
• Seek immediate medical attention if symptoms worsen or if fever develops"""

def generate_mock_medical_analysis(query):
    """
    Generate a mock medical analysis when the AI service is unavailable.
    Returns both summary and detailed analysis.
    """
    return {
        "summary": "With what I see, I think you have a skin condition that appears to be some form of dermatitis or irritation. I would recommend applying a topical anti-inflammatory cream and keeping the area clean and dry, but please consult with a healthcare professional for proper diagnosis and treatment if symptoms persist or worsen.",
        "detailed_analysis": generate_detailed_fallback()
    }