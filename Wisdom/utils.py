import json
import requests
import time
import random
import re
import urllib3
from datetime import datetime
from config import API_CONFIG

# 禁用安全请求警告（针对 verify=False）
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ======================
# 1. API调用核心（带重试 & 代理支持）
# ======================
def call_api(provider, model, prompt, max_retry=3, max_tokens=None):
    conf = API_CONFIG.get(provider)
    if not conf or not conf.get("key"):
        raise Exception(f"Provider {provider} 的 API Key 未设置，请检查环境变量")
    
    url = conf["base_url"].rstrip('/') + "/chat/completions"

    headers = {
        "Authorization": f"Bearer {conf['key']}",
        "Content-Type": "application/json"
    }

    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }
    # 如果调用时传了 max_tokens，就加入到请求中
    if max_tokens:
        data["max_tokens"] = max_tokens

    for attempt in range(max_retry):
        try:
            print(f"   [DEBUG] 发送请求到 {provider}/{model} (第 {attempt+1} 次尝试)...")
            
            # verify=False 解决代理软件导致的 SSL 证书校验失败
            # timeout=180 给长文生成留足时间
            r = requests.post(url, headers=headers, json=data, timeout=180, verify=False)

            if r.status_code != 200:
                error_msg = f"HTTP {r.status_code}: {r.text[:200]}"
                print(f"   [DEBUG] API 报错: {error_msg}")
                raise Exception(error_msg)

            res = r.json()["choices"][0]["message"]["content"]

            if res and len(res.strip()) > 0:
                print(f"   [DEBUG] 成功获取响应，长度: {len(res)} 字符")
                if provider == "groq":
                    import random
                    wait_time = random.uniform(30, 50)  # Groq 建议等 25-40 秒
                    print(f"   [WAIT] Groq 频率保护：随机等待 {wait_time:.1f} 秒...")
                    time.sleep(wait_time)
                return res
            else:
                print("   [DEBUG] API 返回了空字符串")

        except Exception as e:
            print(f"   [API ERROR] {attempt+1} 次尝试失败: {e}")
            time.sleep(5 * (attempt + 1))

    raise Exception(f"{provider}/{model} 在多次重试后仍然失败")

# ======================
# 2. 带有 Fallback 机制的调用
# ======================
def call_with_fallback(models, prompt, min_len=10, max_tokens=None):
    best = None
    best_len = 0

    for provider, model in models:
        try:
            print(f"🔄 正在尝试模型: {provider}/{model}")
            res = call_api(provider, model, prompt, max_tokens=max_tokens)

            if not res:
                continue

            res = res.strip()
            length = len(res)

            if length < min_len:
                print(f"⚠️ 太短丢弃: {length} (要求至少 {min_len})")
                continue

            if length > best_len:
                best = res
                best_len = length

        except Exception as e:
            print(f"❌ {provider}/{model} 失败: {e}")

    if best:
        print(f"✅ 使用最佳结果，长度: {best_len}")
        return best, "best_model"

    print("❌ 所有模型失败")
    return None

# ======================
# 3. 校验与修复逻辑
# ======================
def validate_text(text, check_length=False):
    if not text or not isinstance(text, str):
        return False

    clean_text = text.replace("```", "").strip()
    
    # 文章字数校验
    if check_length and len(clean_text) < 800:
        print(f"   [DEBUG] 文本长度不足: {len(clean_text)}/800")
        return False

    # 异常关键词过滤
    bad_patterns = ["I'm sorry", "API Error", "<html>", "undefined", "Access denied", "cannot fulfill"]
    for p in bad_patterns:
        if p.lower() in text.lower():
            print(f"   [DEBUG] 命中异常词: {p}")
            return False

    return True

def validate_json(text):
    if not text: return False
    try:
        json.loads(text)
        return True
    except:
        return False

def fix_json(text):
    if not text: return None
    try:
        return json.dumps(json.loads(text), ensure_ascii=False)
    except:
        match = re.search(r"\{.*\}", text, re.S)
        if match:
            try:
                return json.dumps(json.loads(match.group()), ensure_ascii=False)
            except:
                return None
    return None

def safe_json_load(text):
    if not text: return None
    try:
        # 1. 尝试直接解析
        return json.loads(text)
    except:
        try:
            # 2. 尝试正则提取 {} 之间的内容
            match = re.search(r"(\{.*\})", text, re.S)
            if match:
                return json.loads(match.group(1))
        except:
            return None

def fix_markdown(text):
    if not text: return ""
    text = re.sub(r"```[a-zA-Z]*\n", "", text)
    text = text.replace("```", "")
    return text.strip()

# ======================
# 4. 其他辅助功能
# ======================
def safe_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "_", str(name))

def sleep_random(cfg):
    if isinstance(cfg, tuple) and len(cfg) == 2:
        wait = random.randint(*cfg)
        time.sleep(wait)
    else:
        time.sleep(5)

def log(title, step, model):
    try:
        with open("logs.txt", "a", encoding="utf-8") as f:
            f.write("\n" + "="*30 + "\n")
            f.write(f"⏰ Time  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"📌 Title : {title}\n")
            f.write(f"🚀 Step  : {step}\n")
            f.write(f"🤖 Model : {model}\n")
    except Exception as e:
        print(f"⚠️ 写入日志失败: {e}")