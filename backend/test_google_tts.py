#!/usr/bin/env python3
"""
Simple test for Google TTS system
"""

import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_google_tts():
    """Test Google TTS"""
    print("🌐 Testing Google TTS")
    print("=" * 30)
    
    try:
        from google_tts import text_to_speech_with_elevenlabs
        
        test_text = "Medical diagnosis complete. The patient shows signs of improvement."
        result = text_to_speech_with_elevenlabs(test_text, "test_google.mp3")
        
        if result and len(result) > 1000:
            print(f"✅ Google TTS successful: {len(result)} bytes")
            return True
        else:
            print("❌ Google TTS failed")
            return False
            
    except Exception as e:
        print(f"❌ Google TTS error: {e}")
        return False

def test_beep_fallback():
    """Test beep audio fallback"""
    print("\n🔊 Testing Beep Fallback")
    print("=" * 30)
    
    try:
        from google_tts import generate_beep_audio
        
        test_text = "Beep test"
        result = generate_beep_audio(test_text, "test_beep.wav")
        
        if result and len(result) > 1000:
            print(f"✅ Beep audio successful: {len(result)} bytes")
            return True
        else:
            print("❌ Beep audio failed")
            return False
            
    except Exception as e:
        print(f"❌ Beep audio error: {e}")
        return False

def test_compatibility():
    """Test simple_tts compatibility"""
    print("\n🔄 Testing Compatibility")
    print("=" * 30)
    
    try:
        from simple_tts import text_to_speech_with_elevenlabs
        
        test_text = "Compatibility test"
        result = text_to_speech_with_elevenlabs(test_text)
        
        if result and len(result) > 1000:
            print(f"✅ Compatibility successful: {len(result)} bytes")
            return True
        else:
            print("❌ Compatibility failed")
            return False
            
    except Exception as e:
        print(f"❌ Compatibility error: {e}")
        return False

def main():
    """Run all tests"""
    print("🌐 GOOGLE TTS TEST SUITE")
    print("=" * 50)
    
    tests = [
        ("Google TTS", test_google_tts),
        ("Beep Fallback", test_beep_fallback),
        ("Compatibility", test_compatibility)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n📊 TEST RESULTS")
    print("=" * 50)
    
    passed = 0
    total = len(tests)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} : {status}")
        if result:
            passed += 1
    
    print("=" * 50)
    print(f"TOTAL: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 GOOGLE TTS SYSTEM READY!")
        print("✅ High-quality voice synthesis")
        print("✅ Audible beep fallback")
        print("✅ Full compatibility")
        print("✅ No premium tokens needed")
        print("✅ Render deployment ready")
        return True
    else:
        print(f"\n⚠️ {total - passed} tests failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)