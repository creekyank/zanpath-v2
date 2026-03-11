import os
import json
import subprocess
import time

BASE_DIR = r"E:\zanpath v2"
WISDOM_DIR = os.path.join(BASE_DIR, "Wisdom")

TASK_FILE = os.path.join(WISDOM_DIR, "current_task.json")

ARTICLE_EN = os.path.join(WISDOM_DIR, "article_en.txt")
ARTICLE_ES = os.path.join(WISDOM_DIR, "article_es.txt")

SEO_EN = os.path.join(WISDOM_DIR, "seo_en.json")
SEO_ES = os.path.join(WISDOM_DIR, "seo_es.json")

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
        encoding="gbk",
        errors="ignore"
    )

    if result.stdout:
        print(result.stdout)

    if result.stderr:
        print(result.stderr)

    return result.returncode == 0



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
    
    # 因为 cwd 是 BASE_DIR (E:\zanpath v2)
    # 而脚本在 Wisdom 文件夹下，所以路径要写成 "Wisdom/check_json.py"
    ok = run_cmd("python Wisdom/check_json.py") 
    
    if ok:
        print("✅ SEO JSON 检查并修复完成")
        return True
    else:
        print("❌ SEO JSON 修复失败，请检查 AI 原始输出内容")
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
        BASE_DIR,
        "content",
        "articles",
        "en",
        module,
        slug + ".json"
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

        ok = run_cmd(
            f'node scripts/buildArticle.js "{title}" "{slug}" "{module}"'
        )

        if not ok:
            time.sleep(2)
            continue

        if validate_article(module, slug):

            print("文章生成成功")

            return True

    return False


def download_images(title, slug, module, kw1, kw2):

    ok = run_cmd(
        f'node scripts/downloadImage.js "{title}" "{slug}" "{module}" "{kw1}" "{kw2}"'
    )

    if not ok:
        print("图片生成失败，跳过")


def update_sitemap():
    """运行全量 Sitemap 生成脚本，扫描所有 JSON 并更新 XML"""
    print("\n>> 正在全量更新 Sitemap...")
    # 无论当前处理的是哪篇文章，都直接跑一遍 generateSitemap.js
    ok = run_cmd("node scripts/generateSitemap.js")
    if ok:
        print("🚀 Sitemap 全量更新成功!")
    else:
        print("❌ Sitemap 更新脚本运行报错")


def clear_temp():

    files = [
        ARTICLE_EN,
        ARTICLE_ES,
        SEO_EN,
        SEO_ES,
        PIC_KEYWORD
    ]

    for f in files:

        if os.path.exists(f):
            open(f, "w").close()


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


def process():

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

    if not check_json():
        print("JSON检查失败")
        return

    kw1, kw2 = read_keywords()

    if not build_article(title, slug, module):

        print("文章生成失败")
        return

    download_images(title, slug, module, kw1, kw2)

    update_sitemap()

    mark_done(source_file, title)

    clear_temp()

    os.remove(TASK_FILE)

    print("\n====== 完成 ======")


if __name__ == "__main__":
    process()
