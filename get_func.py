import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("export async function getUserById")
end_idx = content.find("export async function", start_idx + 10)

if start_idx != -1 and end_idx != -1:
    print(content[start_idx:end_idx])
else:
    print("Function not found")
