import os
import glob

search_text = 'className="space-y-4 bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm"'
replace_text = 'className="space-y-4 bg-transparent md:bg-white dark:md:bg-card p-0 md:p-6 md:rounded-2xl border-0 md:border border-border shadow-none md:shadow-sm"'

path = r'c:\xampp\htdocs\bbbrepo\bbb-website-users\src\app\(website)\(other)\account\setup\_steps\*.tsx'

for file_path in glob.glob(path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if search_text in content:
        content = content.replace(search_text, replace_text)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
