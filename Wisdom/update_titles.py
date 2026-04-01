import os
import json
import re

# 配置路径
txt_path = r'E:\zanpath v2\Wisdom\en-to-es-title.txt'
json_dir = r'E:\zanpath v2\Wisdom\content\articles\es\visual'

def slugify(text):
    """将标题转换为 slug 格式用于匹配文件名/ID"""
    text = text.lower().strip()
    # 移除问号等特殊字符，将空格换成横杠
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text

def load_translations(file_path):
    """从 txt 加载翻译映射表"""
    mapping = {}
    if not os.path.exists(file_path):
        print(f"错误: 找不到文件 {file_path}")
        return mapping
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line:
                en_part, es_title = line.split('=', 1)
                # 使用英文标题生成的 slug 作为 Key
                en_id = slugify(en_part)
                mapping[en_id] = es_title.strip()
    return mapping

def update_json_titles():
    # 1. 加载映射
    title_map = load_translations(txt_path)
    print(f"已加载 {len(title_map)} 条翻译规则。")

    # 2. 遍历 JSON 目录
    updated_count = 0
    for filename in os.listdir(json_dir):
        if filename.endswith('.json'):
            file_path = os.path.join(json_dir, filename)
            
            # 文件名通常就是 ID
            file_id = filename.replace('.json', '')
            
            if file_id in title_map:
                new_title = title_map[file_id]
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # 只更换 title 字段
                    old_title = data.get('title', '')
                    if old_title != new_title:
                        data['title'] = new_title
                        
                        with open(file_path, 'w', encoding='utf-8') as f:
                            # ensure_ascii=False 保证西语字符（如 ¿）不被转义
                            json.dump(data, f, ensure_ascii=False, indent=2)
                        
                        print(f"成功更新: {filename} -> {new_title}")
                        updated_count += 1
                except Exception as e:
                    print(f"处理 {filename} 时出错: {e}")

    print(f"\n任务完成！共检查 {len(os.listdir(json_dir))} 个文件，更新了 {updated_count} 个标题。")

if __name__ == "__main__":
    update_json_titles()