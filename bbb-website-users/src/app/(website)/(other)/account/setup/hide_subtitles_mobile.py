import os
import glob

search_text = 'className="text-slate-500 dark:text-muted-foreground"'
replace_text = 'className="hidden md:block text-slate-500 dark:text-muted-foreground"'

path = r'c:\xampp\htdocs\bbbrepo\bbb-website-users\src\app\(website)\(other)\account\setup\_steps\*.tsx'

for file_path in glob.glob(path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if search_text in content:
        content = content.replace(search_text, replace_text)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
