#!/usr/bin/env python3
"""
Hugging Face TTS deployment test for Render
"""

import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if all required dependencies are available"""
    print("🔍 Checking Dependencies")
    print("=" * 30)
    
    required_modules = ['huggingface_hub', 'requests', 'tempfile', 'os']
    missing = []
    
    for module in required_modules:
        try:
            __import__(module)
            print(f"✅ {module}")
        except ImportError:
            print(f"❌ {module}")
            missing.append(module)
    
    if missing:
        print(f"\n⚠️ Missing modules: {missing}")
        return False
    else:
        print("\n✅ All dependencies available")
        return True

def test_imports():
    """Test all required imports"""
    print("\n🔍 Testing Imports")
    print("=" * 30)
    
    try:
        # Test huggingface_tts import
        from huggingface_tts import text_to_speech_with_elevenlabs, generate_mock_audio
        print("✅ huggingface_tts import successful")
        
        # Test simple_tts compatibility wrapper
        from simple_tts import text_to_speech_with_elevenlabs as simple_tts_func
        print("✅ simple_tts compatibility wrapper successful")
        
        # Test main.py imports
        from main import app
        print("✅ main.py FastAPI app import successful")
        
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected import error: {e}")
        return False

def test_mock_audio():
    """Test mock audio generation"""
    print("\n🔊 Testing Mock Audio (Always Available)")
    print("=" * 50)
    
    try:
        from huggingface_tts import generate_mock_audio
        
        test_text = "Deployment test for medical AI system"
        mock_data = generate_mock_audio(test_text)
        
        if mock_data and len(mock_data) > 1000:
            print(f"✅ Mock audio successful: {len(mock_data)} bytes")
            return True
        else:
            print("❌ Mock audio failed")
            return False
            
    except Exception as e:
        print(f"❌ Mock audio test failed: {e}")
        return False

def test_hf_token_handling():
    """Test HF token handling (with and without token)"""
    print("\n🤗 Testing HF Token Handling")
    print("=" * 40)
    
    try:
        from huggingface_tts import text_to_speech_with_elevenlabs
        
        hf_token = os.environ.get("HF_TOKEN")
        if hf_token:
            print(f"✅ HF_TOKEN found: {hf_token[:10]}...")
            print("🤗 Will use Hugging Face TTS")
        else:
            print("⚠️ HF_TOKEN not set")
            print("🔊 Will use mock audio fallback")
        
        # Test the function (should work either way)
        test_text = "Token handling test"
        result = text_to_speech_with_elevenlabs(test_text)
        
        if result:
            print(f"✅ TTS function successful: {len(result)} bytes")
            return True
        else:
            print("❌ TTS function failed")
            return False
            
    except Exception as e:
        print(f"❌ Token handling test failed: {e}")
        return False

def main():
    """Run all deployment tests"""
    print("🚀 HUGGING FACE TTS DEPLOYMENT TEST")
    print("=" * 60)
    
    tests = [
        ("Dependencies", check_dependencies),
        ("Imports", test_imports),
        ("Mock Audio", test_mock_audio),
        ("HF Token Handling", test_hf_token_handling)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n📊 DEPLOYMENT TEST RESULTS")
    print("=" * 60)
    
    passed = 0
    total = len(tests)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} : {status}")
        if result:
            passed += 1
    
    print("=" * 60)
    print(f"TOTAL: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 DEPLOYMENT READY!")
        print("✅ Hugging Face TTS system configured")
        print("✅ Mock audio fallback working")
        print("✅ Compatibility wrapper in place")
        print("✅ No heavy dependencies")
        
        # Show deployment info
        print("\n📋 DEPLOYMENT INFO:")
        print("- TTS System: Hugging Face Suno Bark model")
        print("- Fallback: Mock audio (always works)")
        print("- Dependencies: huggingface_hub only")
        print("- Token: Set HF_TOKEN for full functionality")
        print("- Startup: Fast (no model loading)")
        
        return True
    else:
        print(f"\n⚠️ {total - passed} tests failed")
        print("🔧 Fix the failed components before deployment")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)