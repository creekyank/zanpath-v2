import os
import json

# 修改路径为 dream 文件夹
json_dir = r'E:\zanpath v2\content\articles\es\dream'

def clean_dream_redundant_headers():
    updated_count = 0
    # 检查路径是否存在
    if not os.path.exists(json_dir):
        print(f"错误: 找不到目录 {json_dir}")
        return

    file_list = [f for f in os.listdir(json_dir) if f.endswith('.json')]
    
    print(f"开始检查梦境目录: {json_dir}")
    print(f"总计文件数: {len(file_list)}")

    for filename in file_list:
        file_path = os.path.join(json_dir, filename)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            content = data.get('content', [])
            
            # 精准匹配：第一个是 p 且第二个是 h1
            if len(content) >= 2:
                first_item = content[0]
                second_item = content[1]
                
                if first_item.get('type') == 'p' and second_item.get('type') == 'h1':
                    # 移除前两个冗余项
                    data['content'] = content[2:]
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    
                    print(f"已清理梦境标题: {filename}")
                    updated_count += 1

        except Exception as e:
            print(f"处理 {filename} 时出错: {e}")

    print(f"\n清理完成！")
    print(f"梦境分类成功清理了 {updated_count} 个文件。")

if __name__ == "__main__":
    clean_dream_redundant_headers()