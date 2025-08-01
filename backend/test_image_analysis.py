#!/usr/bin/env python3
"""
Test script for the image analysis functionality
"""
import os
import base64
from brain_of_the_doctor import analyze_image_with_query

def test_image_analysis():
    """Test the image analysis function with mock data"""
    
    # Create a simple mock base64 encoded image (1x1 pixel PNG)
    mock_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=="
    
    # Test query
    test_query = "What do you see in this medical image? Please provide a professional medical analysis."
    
    print("🧪 Testing image analysis function...")
    
    try:
        result = analyze_image_with_query(
            query=test_query,
            encoded_image=mock_image_base64,
            model="meta-llama/llama-4-scout-17b-16e-instruct"
        )
        
        print(f"✅ Image analysis result: {result}")
        print("🎉 Image analysis function is working!")
        
        return True
        
    except Exception as e:
        print(f"❌ Image analysis test failed: {e}")
        return False

if __name__ == "__main__":
    test_image_analysis()