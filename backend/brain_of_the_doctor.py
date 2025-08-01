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
        detailed_prompt = """You are a medical specialist providing comprehensive treatment recommendations and detailed medical guidance.
        
        CRITICAL: This is COMPLETELY DIFFERENT from the short diagnosis. You must provide EXTENSIVE, COMPREHENSIVE, DETAILED recommendations that are MUCH LONGER and MORE THOROUGH than any diagnosis. This is for TEXT DISPLAY ONLY - make it very detailed and comprehensive in the following format:
        
        **Immediate Care Steps:**
        • Provide 4-5 detailed immediate care instructions
        • Include specific products, techniques, and timeframes
        • Be very specific about how to perform each step
        
        **Comprehensive Treatment Plan:**
        • List 5-6 detailed treatment options with specific instructions
        • Include over-the-counter medications with dosages
        • Mention prescription options that might be needed
        • Provide detailed application instructions and frequency
        
        **Lifestyle and Dietary Recommendations:**
        • Provide 4-5 specific lifestyle changes
        • Include dietary modifications if relevant
        • Mention environmental factors to consider
        
        **When to Seek Professional Medical Care:**
        • List 5-6 specific warning signs
        • Explain when to see a general practitioner vs specialist
        • Mention emergency situations requiring immediate attention
        
        **Long-term Prevention Strategy:**
        • Provide 4-5 detailed prevention methods
        • Include maintenance routines and schedules
        • Mention follow-up care recommendations
        
        **Additional Considerations:**
        • Mention potential complications
        • Discuss prognosis and expected timeline
        • Include any relevant medical tests or monitoring
        
        Make this VERY comprehensive with detailed explanations, specific instructions, and professional medical guidance. Use proper medical terminology and provide thorough, extensive recommendations that are much longer and more detailed than a simple diagnosis."""
        
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
    """Generate comprehensive detailed recommendations fallback"""
    return """**Immediate Care Steps:**
• Clean the affected area gently with lukewarm water and a mild, fragrance-free cleanser such as Cetaphil or CeraVe, avoiding harsh scrubbing motions
• Pat the area completely dry with a clean, soft towel using gentle dabbing motions rather than rubbing to prevent further irritation
• Apply a cool, damp compress using clean cloth soaked in cool water for 10-15 minutes every 2-3 hours to reduce inflammation and provide relief
• Avoid touching, scratching, or picking at the affected area to prevent secondary bacterial infection and scarring
• Remove any jewelry, tight clothing, or accessories that might be in contact with the affected area to reduce friction and irritation

**Comprehensive Treatment Plan:**
• Apply over-the-counter hydrocortisone cream (1% concentration) in a thin layer twice daily for up to 7 days, following package instructions carefully
• Consider using topical antihistamine creams like Benadryl cream for localized itching, but avoid prolonged use to prevent sensitization
• Use oral antihistamines such as loratadine (Claritin) 10mg once daily or cetirizine (Zyrtec) 10mg once daily for systemic relief of itching and inflammation
• Apply fragrance-free, hypoallergenic moisturizer such as Eucerin or Aveeno 2-3 times daily to maintain skin barrier function
• For severe inflammation, consider cool oatmeal baths (colloidal oatmeal) for 15-20 minutes to soothe irritated skin
• If bacterial infection is suspected, topical antibiotic ointment like bacitracin may be applied, but consult healthcare provider first

**Lifestyle and Dietary Recommendations:**
• Maintain a detailed diary of potential triggers including foods, cosmetics, detergents, and environmental factors to identify patterns
• Adopt a gentle skincare routine using only fragrance-free, hypoallergenic products specifically designed for sensitive skin
• Wear loose-fitting, breathable clothing made from natural fibers like cotton to reduce friction and allow proper air circulation
• Implement stress management techniques such as meditation, yoga, or regular exercise, as stress can exacerbate inflammatory skin conditions
• Consider an anti-inflammatory diet rich in omega-3 fatty acids, antioxidants, and avoiding known inflammatory foods if dietary triggers are suspected

**When to Seek Professional Medical Care:**
• If symptoms persist or worsen after 72 hours of appropriate home treatment, indicating possible need for prescription medications
• Development of systemic symptoms including fever above 100.4°F (38°C), chills, or general malaise suggesting possible systemic infection
• Signs of secondary bacterial infection such as increasing redness, warmth, swelling, pus formation, or red streaking extending from the affected area
• Rapid spreading of the condition to multiple body areas or involvement of mucous membranes, which may indicate a serious allergic reaction
• Severe pain that interferes with daily activities or sleep, or if over-the-counter pain management is insufficient
• Any signs of anaphylaxis including difficulty breathing, swelling of face or throat, rapid pulse, or dizziness requiring immediate emergency care

**Long-term Prevention Strategy:**
• Establish a consistent, gentle skincare routine using the same proven products to maintain skin barrier integrity and prevent future flare-ups
• Conduct systematic patch testing with new products by applying small amounts to a test area for 48-72 hours before full use
• Maintain optimal skin hydration through regular use of appropriate moisturizers and adequate water intake (8-10 glasses daily)
• Schedule regular dermatological check-ups every 6-12 months for ongoing skin health monitoring and professional guidance
• Keep a comprehensive health and skincare journal documenting products used, environmental exposures, and any skin reactions for pattern identification

**Additional Considerations:**
• Potential complications may include post-inflammatory hyperpigmentation, scarring from scratching, or development of chronic dermatitis requiring long-term management
• Expected timeline for resolution typically ranges from 1-2 weeks for mild cases to 4-6 weeks for more severe inflammatory conditions with appropriate treatment
• Consider allergy testing if recurrent episodes occur, as identification of specific allergens can guide long-term prevention strategies
• Monitor for signs of contact sensitization to topical treatments, which may manifest as worsening symptoms despite appropriate treatment
• Maintain realistic expectations regarding healing time and potential for temporary discoloration or texture changes during the recovery process"""

def generate_mock_medical_analysis(query):
    """
    Generate a mock medical analysis when the AI service is unavailable.
    Returns both detailed analysis (for voice) and recommendations (for text).
    """
    return {
        "detailed_analysis": "With what I see, I think you have a skin condition that appears to be some form of dermatitis or irritation. I would recommend applying a topical anti-inflammatory cream and keeping the area clean and dry, but please consult with a healthcare professional for proper diagnosis and treatment if symptoms persist or worsen.",
        "recommendations": generate_detailed_fallback()
    }