#!/usr/bin/env python3
"""
Test script for the transcription functionality
"""
import os
from voice_of_the_patient import transcribe_with_groq

def test_transcription():
    """Test the transcription function with mock data"""
    
    # Mock audio bytes (in a real scenario, this would be actual audio data)
    mock_audio_bytes = b"mock audio data for testing"
    
    # Get API key from environment
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key:
        print("❌ GROQ_API_KEY not found in environment variables")
        print("✅ Using fallback transcription mode")
        
    print("🧪 Testing transcription function...")
    
    try:
        result = transcribe_with_groq(
            GROQ_API_KEY=groq_api_key or "test-key",
            audio_bytes=mock_audio_bytes,
            stt_model="whisper-large-v3"
        )
        
        print(f"✅ Transcription result: {result}")
        print("🎉 Transcription function is working!")
        
        return True
        
    except Exception as e:
        print(f"❌ Transcription test failed: {e}")
        return False

if __name__ == "__main__":
    test_transcription()