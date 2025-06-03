import os
from openai import OpenAI
from dotenv import load_dotenv
from system_prompts import SYSTEM_PROMPT_EN

load_dotenv()

class ModernChatBot:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        self.client = OpenAI(api_key=self.api_key)
        self.conversation_history = []
    
    def add_message(self, role, content):
        self.conversation_history.append({"role": role, "content": content})
    
    def get_response(self, user_message, model="gpt-4o-mini"):
        self.add_message("user", user_message)
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=self.conversation_history,
                temperature=1
            )
            
            assistant_message = response.choices[0].message.content
            self.add_message("assistant", assistant_message)
            
            return assistant_message
            
        except Exception as e:
            return f"Error: {str(e)}"
    
    def reset_conversation(self):
        self.conversation_history = []
    
    def set_system_prompt(self, system_prompt):
        if self.conversation_history and self.conversation_history[0]["role"] == "system":
            self.conversation_history[0] = {"role": "system", "content": system_prompt}
        else:
            self.conversation_history.insert(0, {"role": "system", "content": system_prompt})
    
    def get_conversation_history(self):
        return self.conversation_history

def main():
    try:
        chatbot = ModernChatBot()
        
        chatbot.set_system_prompt(SYSTEM_PROMPT_EN)
        
        print("🤖 Modern ChatBot is ready! Type 'quit' to exit, 'reset' to clear the conversation.")
        print("-" * 60)
        
        while True:
            user_input = input("\n👤 You: ").strip()
            
            if user_input.lower() in ['quit', 'exit']:
                print("👋 Goodbye!")
                break
            elif user_input.lower() in ['reset', 'clear']:
                chatbot.reset_conversation()
                chatbot.set_system_prompt(SYSTEM_PROMPT_EN)
                print("🔄 Conversation has been reset!")
                continue
            elif user_input.lower() in ['history']:
                history = chatbot.get_conversation_history()
                print("\n📜 Conversation History:")
                for i, msg in enumerate(history[1:], 1):  # Skip system message
                    role = "👤" if msg["role"] == "user" else "🤖"
                    print(f"{i}. {role}: {msg['content'][:100]}...")
                continue
            elif not user_input:
                continue
            
            print("🤖 AI: ", end="")
            response = chatbot.get_response(user_input)
            print(response)
            
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
        print("Please ensure OPENAI_API_KEY is set in the .env file")
    except Exception as e:
        print(f"❌ Chatbot Initialization Error: {e}")

if __name__ == "__main__":
    main() 