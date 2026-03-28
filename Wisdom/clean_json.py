import os
import json

# 配置路径
json_dir = r'E:\zanpath v2\content\articles\es\life-path'

def clean_redundant_headers():
    updated_count = 0
    file_list = [f for f in os.listdir(json_dir) if f.endswith('.json')]
    
    print(f"开始检查目录: {json_dir}")
    print(f"总计文件数: {len(file_list)}")

    for filename in file_list:
        file_path = os.path.join(json_dir, filename)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            content = data.get('content', [])
            
            # 精准检查逻辑：
            # 1. content 至少要有 2 个以上的元素
            # 2. 第一个元素是 type: p
            # 3. 第二个元素是 type: h1
            if len(content) >= 2:
                first_item = content[0]
                second_item = content[1]
                
                if first_item.get('type') == 'p' and second_item.get('type') == 'h1':
                    # 执行删除前两个元素的操作
                    data['content'] = content[2:]
                    
                    # 写回文件
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    
                    print(f"已清理冗余标题: {filename}")
                    updated_count += 1
                else:
                    # 如果不符合该结构，跳过，不强行删除
                    pass

        except Exception as e:
            print(f"处理 {filename} 时出错: {e}")

    print(f"\n清理完成！")
    print(f"成功清理了 {updated_count} 个文件的冗余标题。")

if __name__ == "__main__":
    clean_redundant_headers()