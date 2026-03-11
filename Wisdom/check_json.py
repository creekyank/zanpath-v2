import json
import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

SEO_EN = r"E:\zanpath v2\Wisdom\seo_en.json"
SEO_ES = r"E:\zanpath v2\Wisdom\seo_es.json"

def clean_and_fix_json(text):
    """提取 JSON 部分并修复常见格式错误"""
    try:
        # 1. 尝试提取 {} 之间的内容（防止 AI 返回多余的文字或 Markdown 标签）
        match = re.search(r'(\{.*\})', text, re.DOTALL)
        if match:
            text = match.group(1)
        
        text = text.strip()

        # 2. 基础语法清理：删除多余的末尾逗号
        text = re.sub(r",\s*}", "}", text)
        text = re.sub(r",\s*]", "]", text)

        # 3. 简单的闭合修复 (如果缺失最后一个引号或花括号)
        # 注意：这只是为了应对极其微小的截断
        if not text.endswith("}"):
            # 如果最后不是 }，尝试补全
            if text.count('{') > text.count('}'):
                text += "}"

        return text
    except Exception:
        return text

def validate_json(file_path):
    if not os.path.exists(file_path):
        print("文件不存在:", file_path)
        return False

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 先尝试直接解析
    try:
        json.loads(content)
        print("JSON正常:", file_path)
        return True
    except Exception:
        print("JSON错误，尝试深度清理并修复:", file_path)
        
        fixed_content = clean_and_fix_json(content)
        
        try:
            obj = json.loads(fixed_content)
            # 修复后写回文件，确保后续 Node.js 脚本读取的是干净的 JSON
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(obj, f, ensure_ascii=False, indent=2)
            print("修复并保存成功:", file_path)
            return True
        except Exception as e:
            print(f"深度修复依然失败: {e}")
            return False

def main():
    # 只要文件存在且能通过/修复，就返回 True
    ok1 = validate_json(SEO_EN)
    ok2 = validate_json(SEO_ES)
    return ok1 and ok2

if __name__ == "__main__":
    if main():
        print("\n✅ 所有 JSON 检查/修复通过")
    else:
        print("\n❌ 存在无法修复的 JSON 错误")