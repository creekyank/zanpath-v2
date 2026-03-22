import requests
import json
import urllib3

# 忽略 SSL 警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# --- 配置区 ---
API_KEY = "ak_25C60u0QJ1pV6LO7yl0Is59Z9RQ1T" 
URL = "https://api.longcat.chat/openai/v1/chat/completions"
# -------------

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "model": "LongCat-Flash-Chat",
    "messages": [{"role": "user", "content": "hi"}],
    "max_tokens": 50
}

print(f"🚀 正在测试连接: {URL}")
try:
    # 强制不使用代理（proxies={"http": None, "https": None}）排除干扰
    response = requests.post(
        URL, 
        headers=headers, 
        json=data, 
        verify=False, 
        proxies={"http": None, "https": None},
        timeout=30
    )
    print(f"✅ 状态码: {response.status_code}")
    print(f"📝 响应内容: {response.text}")
except Exception as e:
    print(f"❌ 请求发生异常: {e}")