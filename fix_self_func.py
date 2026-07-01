import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the select in getSelfDetails.
new_content = re.sub(r'profile: \{\s*select: \{.*?\}\s*\}', r'profile: true', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated getSelfDetails")
