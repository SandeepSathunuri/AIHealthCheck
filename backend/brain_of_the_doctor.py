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
        
        # Get both detailed analysis (for voice) and recommendations (for text)
        detailed_analysis = get_medical_summary(query, encoded_image, headers, url, model)  # This is for VOICE
        recommendations = get_detailed_medical_analysis(query, encoded_image, headers, url, model)  # This is for TEXT
        
        # Return both responses
        return {
            "detailed_analysis": detailed_analysis,  # AI will speak this
            "recommendations": recommendations       # Text only, no voice
        }
            
    except Exception as e:
        print(f"❌ Error in analyze_image_with_query: {e}")
        import traceback
        traceback.print_exc()
        # Fall back to mock analysis
        return generate_mock_medical_analysis(query)

def get_medical_summary(query, encoded_image, headers, url, model):
    """Get detailed analysis for TTS (voice response) - uses exact system prompt"""
    try:
        import requests
        # Use the EXACT system prompt you specified for the voice response
        summary_prompt = """You have to act as a professional doctor, i know you are not but this is for learning purpose. 
        What's in this image?. Do you find anything wrong with it medically? 
        If you make a differential, suggest some remedies for them. Donot add any numbers or special characters in 
        your response. Your response should be in one long paragraph. Also always answer as if you are answering to a real person.
        Donot say 'In the image I see' but say 'With what I see, I think you have ....'
        Dont respond as an AI model in markdown, your answer should mimic that of an actual doctor not an AI bot, 
        Keep your answer concise (max 2 sentences). No preamble, start your answer right away please
        
        IMPORTANT: This is for VOICE OUTPUT - keep it SHORT and conversational. This will be spoken aloud to the patient."""
        
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
        
        print(f"🧠 Getting detailed analysis (for voice)...")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            detailed_analysis = result["choices"][0]["message"]["content"]
            print(f"✅ Detailed analysis generated: {len(detailed_analysis)} chars")
            return detailed_analysis
        else:
            print(f"❌ Detailed analysis API error: {response.status_code}")
            return "With what I see, I think you have a skin condition that may need medical attention."
            
    except Exception as e:
        print(f"❌ Error getting detailed analysis: {e}")
        return "With what I see, I think you have a skin condition that may need medical attention."

def get_detailed_medical_analysis(query, encoded_image, headers, url, model):
    """Get detailed recommendations for display (text only, no voice)"""
    try:
        import requests
        # System prompt for COMPREHENSIVE recommendations (text display only)
        detailed_prompt = """You are a medical specialist providing concise, practical treatment recommendations.
        
        Provide CONCISE but helpful recommendations in this format:
        
        **Immediate Care:**
        • 3-4 brief, actionable steps for immediate relief
        • Include specific products or techniques
        • Keep each point to 1-2 sentences maximum
        
        **Treatment Options:**
        • 3-4 practical treatment suggestions
        • Include over-the-counter options with simple instructions
        • Mention when to consider prescription alternatives
        
        **When to See a Doctor:**
        • 3-4 clear warning signs requiring medical attention
        • Be specific about timeframes (e.g., "if no improvement in 3 days")
        
        **Prevention Tips:**
        • 2-3 simple prevention strategies
        • Focus on practical, easy-to-follow advice
        
        Keep the entire response under 800 characters. Be concise, practical, and professional. No excessive detail or repetition."""
        
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
            "max_tokens": 400,  # Concise recommendations
            "temperature": 0.7
        }
        
        print(f"🧠 Getting recommendations (for text display)...")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            recommendations = result["choices"][0]["message"]["content"]
            print(f"✅ Recommendations generated: {len(recommendations)} chars")
            return recommendations
        else:
            print(f"❌ Recommendations API error: {response.status_code}")
            return generate_detailed_fallback()
            
    except Exception as e:
        print(f"❌ Error getting recommendations: {e}")
        return generate_detailed_fallback()

def generate_detailed_fallback():
    """Generate concise medical recommendations fallback"""
    return """**Immediate Care:**
• Clean area gently with mild soap and lukewarm water
• Apply cool compress for 10-15 minutes to reduce inflammation
• Avoid scratching or touching the affected area
• Remove any irritating clothing or jewelry

**Treatment Options:**
• Apply over-the-counter hydrocortisone cream (1%) twice daily
• Take oral antihistamine like Benadryl for itching relief
• Use fragrance-free moisturizer to keep skin hydrated
• Consider cool oatmeal baths for soothing relief

**When to See a Doctor:**
• No improvement after 3-5 days of treatment
• Signs of infection (pus, red streaking, fever)
• Severe pain or rapid spreading of symptoms
• Difficulty breathing or swelling of face/throat

**Prevention Tips:**
• Use gentle, fragrance-free skincare products
• Wear loose, breathable cotton clothing
• Keep a diary of potential triggers to identify patterns"""

def generate_mock_medical_analysis(query):
    """
    Generate a mock medical analysis when the AI service is unavailable.
    Returns both detailed analysis (for voice) and recommendations (for text).
    """
    return {
        "detailed_analysis": "With what I see, I think you have a skin condition that appears to be some form of dermatitis or irritation. I would recommend applying a topical anti-inflammatory cream and keeping the area clean and dry, but please consult with a healthcare professional for proper diagnosis and treatment if symptoms persist or worsen.",
        "recommendations": generate_detailed_fallback()
    }