#!/usr/bin/env python3
"""
Final deployment preparation for Render
Ensures clean deployment with cloud TTS
"""

import os
import sys
import shutil

def clean_cache():
    """Clean Python cache files"""
    print("🧹 Cleaning Python cache...")
    
    cache_dirs = ['__pycache__', '.pytest_cache']
    for cache_dir in cache_dirs:
        if os.path.exists(cache_dir):
            shutil.rmtree(cache_dir)
            print(f"✅ Removed {cache_dir}")
    
    # Remove .pyc files
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.pyc'):
                os.remove(os.path.join(root, file))
                print(f"✅ Removed {file}")

def verify_files():
    """Verify all required files are present"""
    print("\n📋 Verifying deployment files...")
    
    required_files = [
        'main.py',
        'cloud_tts.py',
        'simple_tts.py',  # Compatibility wrapper
        'requirements.txt',
        'config.py',
        'brain_of_the_doctor.py',
        'voice_of_the_patient.py'
    ]
    
    missing = []
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - MISSING")
            missing.append(file)
    
    return len(missing) == 0

def check_requirements():
    """Check requirements.txt for cloud compatibility"""
    print("\n📦 Checking requirements.txt...")
    
    with open('requirements.txt', 'r') as f:
        content = f.read()
    
    # Check for problematic packages (only in actual package lines, not comments)
    problematic = ['TTS==', 'torch==', 'torchaudio==', 'espeak==']
    found_problems = []
    
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#'):  # Skip comments
            for package in problematic:
                if package.lower() in line.lower():
                    found_problems.append(package.replace('==', ''))
    
    if found_problems:
        print(f"⚠️ Found problematic packages: {found_problems}")
        print("💡 These should be removed for cloud deployment")
        return False
    else:
        print("✅ Requirements.txt is cloud-compatible")
        return True

def test_imports():
    """Test critical imports"""
    print("\n🔍 Testing critical imports...")
    
    try:
        from cloud_tts import text_to_speech_with_elevenlabs
        print("✅ cloud_tts import successful")
        
        from simple_tts import text_to_speech_with_elevenlabs as simple_func
        print("✅ simple_tts compatibility wrapper successful")
        
        return True
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

def main():
    """Main deployment preparation"""
    print("🚀 RENDER DEPLOYMENT PREPARATION")
    print("=" * 50)
    
    # Clean cache
    clean_cache()
    
    # Verify files
    files_ok = verify_files()
    
    # Check requirements
    req_ok = check_requirements()
    
    # Test imports
    imports_ok = test_imports()
    
    # Summary
    print("\n📊 DEPLOYMENT READINESS CHECK")
    print("=" * 50)
    print(f"Files Present    : {'✅ PASS' if files_ok else '❌ FAIL'}")
    print(f"Requirements OK  : {'✅ PASS' if req_ok else '❌ FAIL'}")
    print(f"Imports Working  : {'✅ PASS' if imports_ok else '❌ FAIL'}")
    
    if files_ok and req_ok and imports_ok:
        print("\n🎉 DEPLOYMENT READY!")
        print("✅ All checks passed")
        print("✅ Cloud TTS system configured")
        print("✅ No heavy dependencies")
        print("✅ Compatibility wrapper in place")
        print("\n🚀 Ready to deploy to Render!")
        
        # Show deployment info
        print("\n📋 DEPLOYMENT INFO:")
        print("- TTS System: Google TTS + Edge TTS fallback")
        print("- Dependencies: Lightweight (requests only)")
        print("- Startup Time: Fast (no model loading)")
        print("- Compatibility: Full (simple_tts wrapper)")
        
        return True
    else:
        print("\n⚠️ DEPLOYMENT NOT READY")
        print("🔧 Fix the failed checks before deploying")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)