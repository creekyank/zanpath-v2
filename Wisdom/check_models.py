import os
import requests

api_key = os.getenv("GEMINI_API_KEY")
base_url = "https://generativelanguage.googleapis.com/v1beta/openai/models"

headers = {"Authorization": f"Bearer {api_key}"}
response = requests.get(base_url, headers=headers)

if response.status_code == 200:
    models = response.json().get('data', [])
    print("✅ 你可以使用的模型名称列表：")
    for m in models:
        print(f"- {m['id']}")
else:
    print(f"❌ 无法获取列表: {response.status_code}")
    print(response.text)