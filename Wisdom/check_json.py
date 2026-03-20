import json
import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

SEO_EN = r"E:\zanpath v2\Wisdom\seo_en.json"
SEO_ES = r"E:\zanpath v2\Wisdom\seo_es.json"


def clean_and_fix_json(text):
    try:
        match = re.search(r'(\{.*\})', text, re.DOTALL)
        if match:
            text = match.group(1)

        text = text.strip()
        text = re.sub(r",\s*}", "}", text)
        text = re.sub(r",\s*]", "]", text)

        if not text.endswith("}"):
            if text.count('{') > text.count('}'):
                text += "}"

        return text
    except:
        return text


def is_valid_seo(data):
    required = ["metaTitle", "metaDescription", "primaryKeyword"]

    for f in required:
        if f not in data or not str(data[f]).strip():
            return False

    if len(data.get("metaDescription", "")) < 50:
        return False

    return True


def validate_json(file_path):
    if not os.path.exists(file_path):
        print("❌ 文件不存在:", file_path)
        return False

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    try:
        obj = json.loads(content)
    except:
        print("⚠️ JSON错误，尝试修复:", file_path)
        content = clean_and_fix_json(content)
        try:
            obj = json.loads(content)
        except Exception as e:
            print("❌ 修复失败:", e)
            return False

    # ✅ 关键：质量检测
    if not is_valid_seo(obj):
        print("❌ SEO质量不合格:", file_path)
        return False

    # 回写干净JSON
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

    print("✅ JSON通过:", file_path)
    return True


def main():
    ok_en = validate_json(SEO_EN)
    ok_es = validate_json(SEO_ES)

    print("\n结果：")
    print("EN:", "✅" if ok_en else "❌")
    print("ES:", "✅" if ok_es else "❌")

    return ok_en and ok_es


if __name__ == "__main__":
    if main():
        print("\n✅ 所有 JSON 检查通过")
        exit(0)
    else:
        print("\n❌ JSON 存在问题")
        exit(1)