import os
import re

# 配置你的路径
txt_path = r'E:\zanpath v2\Wisdom\en-to-es-title.txt'
json_dir = r'E:\zanpath v2\content\articles\es\life-path' # 这里填你没跑完的那个文件夹

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text

# 加载 TXT 里的英文 ID
with open(txt_path, 'r', encoding='utf-8') as f:
    mapping_ids = [slugify(line.split('=')[0]) for line in f if '=' in line]

print("--- 以下 27 个文件没有匹配到翻译规则 ---")
missing_count = 0
for filename in os.listdir(json_dir):
    if filename.endswith('.json'):
        file_id = filename.replace('.json', '')
        if file_id not in mapping_ids:
            print(f"未匹配: {filename}")
            missing_count += 1

print(f"--- 总计未匹配数量: {missing_count} ---")