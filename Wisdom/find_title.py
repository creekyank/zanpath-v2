
import os
import re
import json

TITLE_DIR = r"E:\zanpath v2\Wisdom\title"
SITE_ARTICLE_DIR = r"E:\zanpath v2\content\articles\en"

MODULE_MAP = {
    "bazi": "life-path",
    "dream": "dream",
    "naming": "naming",
    "space": "space",
    "visual": "visual"
}

OUTPUT_FILE = r"E:\zanpath v2\Wisdom\current_task.json"


def slugify(title):
    slug = title.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    return slug


def clean_title(line):
    """去掉编号和前后空格"""
    line = line.strip()
    line = re.sub(r"^\d+\.\s*", "", line)  # 去掉开头的编号 '14. '
    return line


def process_titles():
    for file in os.listdir(TITLE_DIR):
        if not file.endswith(".txt"):
            continue

        module_raw = file.replace(".txt", "")
        module = MODULE_MAP.get(module_raw, module_raw)
        path = os.path.join(TITLE_DIR, file)

        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        new_lines = []
        task_created = False

        for line in lines:
            stripped = line.strip()

            if not stripped:
                new_lines.append(line.rstrip())
                continue

            if stripped.startswith("[DONE]") or stripped.startswith("[RUNNING]"):
                new_lines.append(stripped)
                continue

            # 清理标题前编号
            title_clean = clean_title(stripped)
            slug = slugify(title_clean)

            article_path = os.path.join(
                SITE_ARTICLE_DIR,
                module,
                slug + ".json"
            )

            if os.path.exists(article_path):
                print(f"已存在文章: {title_clean}")
                new_lines.append("[DONE] " + title_clean)
                continue

            # 找到第一个未生成过的标题，生成任务
            task = {
                "title": title_clean,
                "slug": slug,
                "module": module,
                "source_file": file
            }

            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(task, f, ensure_ascii=False, indent=2)

            print(f"找到新标题: {title_clean}")
            new_lines.append("[RUNNING] " + title_clean)
            task_created = True
            break  # 只处理一个标题

        # 对剩余标题，不改变原内容，直接追加
        index_first_unprocessed = lines.index(line) + 1
        new_lines += [l.rstrip() for l in lines[index_first_unprocessed:]]

        # 写回原文件
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(new_lines) + "\n")

        if task_created:
            return task

    return None


if __name__ == "__main__":
    task = process_titles()
    if not task:
        print("没有新标题")
