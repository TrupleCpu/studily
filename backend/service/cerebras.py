import os
from google import genai
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

load_dotenv()

def call_ai(prompt: str) -> str:
    
    client = Cerebras(
        api_key=os.getenv("CEREBRAS_API_KEY")
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="gpt-oss-120b"
    )

    return chat_completion.choices[0].message.content
