from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

class GeminiChat:
    def __init__(self):
        self.model = None
        self.initialize_model()
    
    def initialize_model(self):
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("API key missing from .env file")
            
            genai.configure(api_key=api_key)

            model_name = 'gemini-2.0-flash'
            self.model = genai.GenerativeModel(model_name)
            
            # Test connection
            response = self.model.generate_content("Hello")
            if hasattr(response, 'text') and response.text:
                print(f"✅ Connected to Gemini model: {model_name}")
            else:
                raise Exception("Model did not return valid response.")

        except Exception as e:
            print(f"❌ Initialization failed: {str(e)}")
            self.model = None

gemini = GeminiChat()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    if not gemini.model:
        return jsonify({"reply": "⚠️ Service unavailable. Please refresh the page."})
    
    try:
        user_input = request.json.get("message", "").strip()
        if not user_input:
            return jsonify({"reply": "Please enter a message"})

        response = gemini.model.generate_content(user_input)

        if hasattr(response, 'text') and response.text:
            return jsonify({"reply": response.text.strip()})
        else:
            return jsonify({"reply": "⚠️ Gemini API responded but with no answer."})

    except Exception as e:
        print(f"Chat error: {str(e)}")
        return jsonify({"reply": "⚠️ Temporary system issue. Please try again."})

if __name__ == "__main__":
    app.run(debug=True)
