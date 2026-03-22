# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import json
import subprocess
import time



BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
WISDOM_DIR = BASE_DIR

TASK_FILE = os.path.join(WISDOM_DIR, "current_task.json")

ARTICLE_EN = os.path.join(WISDOM_DIR, "article_en.txt")
ARTICLE_ES = os.path.join(WISDOM_DIR, "article_es.txt")
ARTICLE_ZH = os.path.join(WISDOM_DIR, "article_zh.txt")

SEO_EN = os.path.join(WISDOM_DIR, "seo_en.json")
SEO_ES = os.path.join(WISDOM_DIR, "seo_es.json")
SEO_ZH = os.path.join(WISDOM_DIR, "seo_zh.json")

PIC_KEYWORD = os.path.join(WISDOM_DIR, "pic_keyword.txt")

TITLE_DIR = os.path.join(WISDOM_DIR, "title")

MAX_RETRY = 3

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

def fix_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
        start = text.find("{")
        end = text.rfind("}") + 1
        text = text[start:end]
        data = json.loads(text)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("JSON修复成功:", path)
        return True
    except Exception as e:
        print("JSON修复失败:", path, e)
        return False

def check_json():
    """调用外部 check_json.py 脚本进行深度检查与修复"""
    print("\n>> 正在进行 JSON 深度检查...")
    ok = run_cmd(f'python "{os.path.join(BASE_DIR, "check_json.py")}"')
    if ok:
        print("SEO JSON 检查并修复完成")
        return True
    else:
        print("SEO JSON 修复失败，请检查 AI 原始输出内容")
        return False

def read_keywords():
    if not os.path.exists(PIC_KEYWORD):
        return "", ""
    with open(PIC_KEYWORD, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
    if len(lines) >= 2:
        return lines[0], lines[1]
    if len(lines) == 1:
        return lines[0], ""
    return "", ""

def validate_article(module, slug):
    path = os.path.join(
        BASE_DIR, "content", "articles", "en", module, slug + ".json"
    )
    if not os.path.exists(path):
        return False
    try:
        with open(path, "r", encoding="utf-8") as f:
            json.load(f)
        return True
    except:
        return False

def build_article(title, slug, module):
    for i in range(MAX_RETRY):
        print(f"\nBuild尝试 {i+1}")

        script_path = os.path.join(ROOT_DIR, "scripts", "buildArticle.js")
        ok = run_cmd(f'node "{script_path}" "{title}" "{slug}" "{module}"')

        if not ok:
            time.sleep(2)
            continue

        # ✅ 双重验证
        if validate_article(module, slug):
            print("✅ 文章生成成功")
            return True

        print("⚠️ JSON未生成，重试...")
        time.sleep(2)

    return False

def download_images(title, slug, module, kw1, kw2):
    script_path = os.path.join(ROOT_DIR, "scripts", "downloadImage.js")
    ok = run_cmd(f'node "{script_path}" "{title}" "{slug}" "{module}" "{kw1}" "{kw2}"')
    if not ok:
        print("图片生成失败，跳过")

def update_sitemap():
    print("\n>> 正在全量更新 Sitemap...")
    script_path = os.path.join(ROOT_DIR, "scripts", "generateSitemap.js")
    ok = run_cmd(f'node "{script_path}"')
    if ok:
        print("Sitemap 全量更新成功!")
    else:
        print("Sitemap 更新脚本运行报错")

def clear_temp():
    files = [
        ARTICLE_EN,
        ARTICLE_ES,
        SEO_EN,
        SEO_ES,
        PIC_KEYWORD
    ]

    for f in files:
        try:
            if os.path.exists(f):
                os.remove(f)   # ✅ 直接删除，比 truncate 安全
                print(f"已删除旧文件: {os.path.basename(f)}")
        except Exception as e:
            print(f"清理失败: {f}", e)

def mark_done(source_file, title):
    path = os.path.join(TITLE_DIR, source_file)
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    new = []
    for l in lines:
        if "[RUNNING]" in l and title in l:
            new.append("[DONE] " + title + "\n")
        else:
            new.append(l)
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(new)

def is_valid_text(file_path, min_len=500):
    print(f"[CHECK] 正在检查文件: {file_path}")
    
    if not os.path.exists(file_path):
        print(f"[CHECK ERROR] 文件不存在: {file_path}")
        return False

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read().strip()
        
        content_len = len(text)
        print(f"[CHECK INFO] 文件长度: {content_len} 字符 (阈值: {min_len})")

        if content_len <= min_len:
            print(f"[CHECK FAIL] 内容太短，只有 {content_len} 字符")
            return False

        # ❌ 防止旧内容（简单特征）
        bad_signs = ["lorem ipsum"]
        for b in bad_signs:
            if b in text.lower():
                print(f"[CHECK FAIL] 发现非法字符: {b}")
                return False

        return True
    except Exception as e:
        print(f"[CHECK ERROR] 读取出错: {e}")
        return False


def process():
    # 打印环境信息，确保它找的目录对不对
    print(f"\n[DEBUG] 当前工作目录 (CWD): {os.getcwd()}")
    print(f"[DEBUG] WISDOM_DIR 设定为: {WISDOM_DIR}")
    print(f"[DEBUG] 任务文件路径: {TASK_FILE}")

    if not os.path.exists(TASK_FILE):
        print("没有任务")
        return


    with open(TASK_FILE, "r", encoding="utf-8") as f:
        task = json.load(f)

    title = task["title"]
    slug = task["slug"]
    module = task["module"]
    source_file = task["source_file"]

    print("\n====== 开始处理 ======")
    print("标题:", title)

    # ✅ 1. 检查 AI 输出（关键）
    if not is_valid_text(ARTICLE_EN):
        print("❌ 英文文章为空或太短")
        return

    if not is_valid_text(ARTICLE_ES):
        print("❌ 西语文章为空或太短")
        return

    # ✅ 2. JSON检查（放这里）
    if not check_json():
        print("JSON检查失败")
        return

    kw1, kw2 = read_keywords()

    # 🚀 修改这里：先下载图片！！！
    # 这样当执行 build 的时候，硬盘里已经有真正的图片文件了
    print("\n[STEP] 正在下载图片...")
    download_images(title, slug, module, kw1, kw2)

    # ✅ 3. build（带强校验）
    print("\n[STEP] 正在生成文章 JSON...")
    if not build_article(title, slug, module):
        print("❌ 文章生成失败")
        return

    # ✅ 5. sitemap
    update_sitemap()

     #✅ 6. 标记完成
    mark_done(source_file, title)

    # ✅ 7. 清理
    # clear_temp()

    if os.path.exists(TASK_FILE):
        os.remove(TASK_FILE)

    print("\n====== 完成 ======")

if __name__ == "__main__":
    process()