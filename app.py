from flask import Flask, render_template, request, jsonify
import os
from modern_chatbot import ModernChatBot
from system_prompts import SYSTEM_PROMPT_EN

app = Flask(__name__)
app.secret_key = os.urandom(24)

chatbot_instance = None

def get_chatbot():
    global chatbot_instance
    if chatbot_instance is None:
        try:
            chatbot_instance = ModernChatBot()
            chatbot_instance.set_system_prompt(SYSTEM_PROMPT_EN)
        except Exception as e:
            print(f"Error initializing chatbot: {e}")
            return None
    return chatbot_instance

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        chatbot = get_chatbot()
        if chatbot is None:
            return jsonify({'error': 'Chatbot not available. Please check API key configuration.'}), 500
        
        response = chatbot.get_response(message)
        
        return jsonify({
            'response': response,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/reset', methods=['POST'])
def reset_conversation():
    try:
        chatbot = get_chatbot()
        if chatbot:
            chatbot.reset_conversation()
            chatbot.set_system_prompt(SYSTEM_PROMPT_EN)
            return jsonify({'status': 'success', 'message': 'Conversation reset'})
        else:
            return jsonify({'error': 'Chatbot not available'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/history', methods=['GET'])
def get_history():
    try:
        chatbot = get_chatbot()
        if chatbot:
            history = chatbot.get_conversation_history()
            return jsonify({'history': history[1:], 'status': 'success'})
        else:
            return jsonify({'error': 'Chatbot not available'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 