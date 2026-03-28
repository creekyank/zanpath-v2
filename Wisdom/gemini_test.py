from google import genai
import os
import time

# 1. 自动读取环境变量
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("❌ 错误：未找到环境变量 GEMINI_API_KEY")
    exit()

# 2. 初始化客户端 (如果你的网络需要代理，请取消下面 proxy 的注释)
client = genai.Client(
    api_key=API_KEY,
    # http_options={'proxy': 'http://127.0.0.1:7890'}  # 👈 如果还是没反应，把这行前面的 # 删掉
)

def check_models():
    print("--- 正在连接 Google 服务器 (2.0/2.5 SDK) ---")
    try:
        # 获取模型列表
        print("🔍 正在获取可用模型列表...")
        models = client.models.list()
        
        print("✅ 验证成功！你的 Key 支持以下模型：")
        for m in models:
            # 过滤掉一些无关的模型前缀
            if "gemini" in m.name:
                print(f"  > {m.name}")

        # 尝试一次翻译测试
        print("\n🚀 正在进行 2.0/2.5 翻译能力测试...")
        
        # 自动选择最强模型
        target = "gemini-2.0-flash" 
        
        response = client.models.generate_content(
            model=target,
            contents="Translate to Spanish (informal 'tú'): Dreaming of a calm ocean means inner peace."
        )
        
        print("\n--- 翻译结果 ---")
        print(response.text)
        
    except Exception as e:
        print(f"\n❌ 连接失败。原因：{str(e)}")
        print("\n💡 提示：如果是网络超时，请检查是否开启了代理，或者在代码中配置了正确的 proxy 端口。")

if __name__ == "__main__":
    check_models()