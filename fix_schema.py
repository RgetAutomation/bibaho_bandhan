import re

file_path = 'c:/xampp/htdocs/bbbrepo/bbb-website-users/src/schema/updateProfileSchema.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all z.string().optional() and string().optional()
# But let's be careful about how it's imported. The schema uses string().optional()
new_content = re.sub(r'string\(\)\.optional\(\)', r'string().nullable().optional()', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Schema updated successfully")
