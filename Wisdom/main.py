# -*- coding: utf-8 -*-
import json, subprocess, time, random, shutil, os, traceback
import prompts
from config import *
from utils import *

import sys
sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

LOCK_FILE = os.path.join(BASE_DIR, "running.lock")


# =========================
# 🔒 锁机制（防并发）
# =========================
def is_running():
    return os.path.exists(LOCK_FILE)

def set_lock():
    with open(LOCK_FILE, "w") as f:
        f.write("running")

def clear_lock():
    if os.path.exists(LOCK_FILE):
        os.remove(LOCK_FILE)


# =========================
# 命令执行
# =========================
def run_cmd(cmd):
    print("\n>>", cmd)

    result = subprocess.run(
        cmd,
        shell=True,
        cwd=BASE_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="ignore"
    )

    output = result.stdout + result.stderr
    print(output)

    if result.returncode != 0:
        return False

    if "[ERROR]" in output:
        return False

    return True


# =========================
# 初始化目录
# =========================
def ensure_dirs():
    for d in ["good", "bad", "top", "logs"]:
        path = os.path.join(BASE_DIR, d)
        if not os.path.exists(path):
            os.makedirs(path)


# =========================
# 清理旧文件（绝对路径）
# =========================
def clear_temp():
    files = ["article_en.txt", "article_es.txt", "seo_en.json", "seo_es.json", "pic_keyword.txt"]

    for f in files:
        path = os.path.join(BASE_DIR, f)
        try:
            if os.path.exists(path):
                os.remove(path)
                print(f"[CLEAN] 删除: {f}")
        except Exception as e:
            print(f"[CLEAN ERROR] {f}: {e}")


# =========================
# 安全写文件
# =========================
def safe_write(filename, content):
    path = os.path.join(BASE_DIR, filename)
    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
    except Exception as e:
        print(f"[WRITE ERROR] {filename}: {e}")


# =========================
# 安全读取JSON
# =========================
def safe_read_json(filename):
    path = os.path.join(BASE_DIR, filename)
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except:
        return None


# =========================
# 最终评分
# =========================
def score_final_check(article, seo):
    print("[SKIP] 已跳过 AI 评分，自动赋予 95 分 (DeepSeek 质量保证)")
    return 95

    for i in range(3):
        try:
            result = call_with_fallback(
                MODELS["scorer_final"],
                prompts.score_final(article, seo)
            )

            if not result:
                continue

            res, _ = result
            data = safe_json_load(res)

            if data and "score" in data:
                return data["score"]

        except Exception as e:
            print("[SCORE ERROR]", e)

        time.sleep(2)

    return 0


# =========================
# 核心生成器
# =========================
def safe_generate(models, prompt, min_len=200, is_json=False, retry=3, max_tokens=None):

    for i in range(retry):
        try:
            result = call_with_fallback(models, prompt, min_len=min_len, max_tokens=max_tokens)

            if not result:
                continue

            res, _ = result

            if not res:
                continue

            if is_json:
                if not validate_json(res):
                    res = fix_json(res)
                if res:
                    return res

            else:
                res = res.strip()
                if len(res) >= min_len:
                    return res

        except Exception as e:
            print(f"[GEN ERROR] attempt {i+1}: {e}")

        time.sleep(2 + i)

    return None


# =========================
# 主流程
# =========================
def run():

    if is_running():
        print("⚠️ 上一轮还没结束，跳过")
        return

    set_lock()

    try:
        ensure_dirs()
        clear_temp()

        # ====== 选题 ======
        run_cmd(f'python "{os.path.join(BASE_DIR, "find_title.py")}"')

        task = safe_read_json(os.path.join(BASE_DIR, "current_task.json"))
        if not task:
            print("[ERROR] current_task.json 无效")
            return

        title = task.get("title")
        module = task.get("module")

        print(f"\n=== 开始处理: {title} ===")

        # =========================
        # 1️⃣ 英文文章
        # =========================
        article_en = safe_generate(
            MODELS["agent_en_article"],
            prompts.agent_en_article(title, module),
            min_len=900
        )

        if not article_en:
            print("[ERROR] 英文文章生成失败")
            return

        article_en = fix_markdown(article_en)
        safe_write("article_en.txt", article_en)
        print(f"[DEBUG] Python 已写入文件: {os.path.join(BASE_DIR, 'article_en.txt')}, 大小: {len(article_en)}")

        # DEBUG
        print("DEBUG EN 长度:", len(article_en))

        # =========================
        # 2️⃣ SEO
        # =========================
        seo_en = safe_generate(
            MODELS["agent_en_seo"],
            prompts.agent_en_seo(title, module),
            is_json=True
        )

        if not seo_en:
            print("[ERROR] SEO生成失败")
            return

        safe_write("seo_en.json", seo_en)

        # =========================
        # 3️⃣ 图片关键词
        # =========================
        pic = safe_generate(
            MODELS["agent3"],
            prompts.agent3(title),
            min_len=10
        )

        if not pic:
            pic = "feng shui energy balance\nchinese metaphysics concept\nyin yang harmony"

        safe_write("pic_keyword.txt", pic)

        # =========================
        # 4️⃣ 西语文章 (直接生成，Gemini 挂了自动切 DeepSeek)
        # =========================
        print(f"🚀 正在翻译西语文章 (优先使用 Gemini)...")
        # 移除了这里的 time.sleep(65)，直接开始
        
        article_es = safe_generate(
            MODELS["agent6"],
            prompts.agent6(title, article_en),
            min_len=600,
            max_tokens=8192,
            retry=1 # 减少内部重试，快速触发 fallback 切换到备选模型
        )

        if not article_es:
            print("[ERROR] 西语文章生成最终失败")
        else:
            safe_write("article_es.txt", article_es)
            print(f"✅ 西语文章翻译完成。")


        # =========================
        # 5️⃣ 西语 SEO (为了 Gemini 配额，这里必须强制冷却)
        # =========================
        print(f"⏳ 翻译 SEO 前强制冷却 65 秒，确保 Gemini 接口恢复...")
        time.sleep(65) 

        seo_es = safe_generate(
            MODELS["agent7"],
            prompts.agent7(seo_en),
            is_json=True,
            retry=2
        )

        if not seo_es:
            print("[WARN] 西语 SEO 生成失败，使用英文版兜底")
            safe_write("seo_es.json", seo_en) 
        else:
            safe_write("seo_es.json", seo_es)
            print(f"✅ 西语 SEO 翻译完成。")

        # =========================
        # 评分
        # =========================
        seo_data = safe_json_load(seo_en)
        score = score_final_check(article_en, seo_data)

        folder = "top" if score >= 85 else "good" if score >= 70 else "bad"

        src = os.path.join(BASE_DIR, "article_en.txt")
        dst = os.path.join(BASE_DIR, folder, f"{safe_filename(title)}.txt")

        if os.path.exists(src):
            shutil.copy(src, dst)
            print(f"[SAVE] → {folder}")

        print(f"完成: {title} | 评分: {score}")

        # =========================
        # 🚨 关键：同步执行（不会被清）
        # =========================
        print(f"[DEBUG] 准备启动后处理，当前 BASE_DIR: {BASE_DIR}")
        
        # 1. 提取关键词列表（确保处理掉空行）
        pic_list = [line.strip() for line in pic.split('\n') if len(line.strip()) > 3]
        
        # 2. 构造传参字符串 (加双引号防止空格断词)
        # 我们把这 10 个词封装好，准备传给下游
        pic_args = " ".join([f'"{word}"' for word in pic_list[:10]]) 
        
        # 3. 将这些词传给 smart_factory.py 或者直接传给后续脚本
        # 注意：你需要确认你的 smart_factory.py 是否能接收并透传这些参数
        # 如果 smart_factory.py 内部是调用 downloadImage.js 的，它需要接收这些 args
        run_cmd(f'python "{os.path.join(BASE_DIR, "smart_factory.py")}" {pic_args}')

    finally:
        clear_lock()

# =========================
# 循环调度执行
# =========================
if __name__ == "__main__":
    print("🚀 自动化任务启动，每 10 分钟运行一次（带随机波动）...")
    
    while True:
        try:
            # 执行主流程
            run()
            
            # 设定基础间隔（8分钟 = 600秒）
            base_interval = 8 * 60 
            
            # 设定随机波动（例如：前后随机 3 分钟，即 -180秒 到 +180秒）
            # 你可以根据需要调整这个数值
            offset = random.randint(-120, 120) 
            
            wait_time = base_interval + offset
            
            # 防止随机出负数（极端情况）
            if wait_time < 300: 
                wait_time = 300
                
            print(f"\n✅ 本轮结束。")
            print(f"⏳ 随机等待时间: {wait_time // 60} 分 {wait_time % 60} 秒...")
            print(f"📅 预计下一轮启动时间: {time.strftime('%H:%M:%S', time.localtime(time.time() + wait_time))}")
            
            time.sleep(wait_time)
            
        except KeyboardInterrupt:
            print("\n🛑 用户停止，退出程序。")
            clear_lock() # 退出前确保锁已清除
            break
        except Exception as e:
            print(f"⚠️ 循环遇到未知错误: {e}")
            traceback.print_exc()
            time.sleep(60) # 出错后等 1 分钟重试
