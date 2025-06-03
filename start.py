#!/usr/bin/env python3

import os
import sys
from dotenv import load_dotenv

load_dotenv()

def check_environment():
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found!")
        print("📝 Instructions:")
        print("1. Create a .env file in the project directory")
        print("2. Add line: OPENAI_API_KEY=your_api_key_here")
        print("3. Replace 'your_api_key_here' with your actual API key")
        return False
    
    print(f"✅ API Key configured: {api_key[:10]}...")
    return True

def install_requirements():
    try:
        import flask
        print("✅ Flask already installed")
    except ImportError:
        print("📦 Installing dependencies...")
        os.system("pip install -r requirements.txt")

def main():
    print("🚀 Starting Modern ChatBot...")
    print("=" * 50)
    
    if not check_environment():
        sys.exit(1)
    
    install_requirements()
    
    print("🌐 Starting server...")
    print("📱 Open browser and go to: http://localhost:5000")
    print("🔴 Press Ctrl+C to stop server")
    print("=" * 50)
    
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"❌ Startup error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 