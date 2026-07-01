import re

file_path = 'c:/xampp/htdocs/bbbrepo/bbb-website-users/src/app/users/(all)/(main)/account/edit/profile/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'partnerDescription: data\.partnerDescription \|\| "",\s*// Add missing mappings for contact info and relationship')
replacement = '''partnerDescription: data.partnerDescription || "",
        lifeGoals: data.lifeGoals || "",
        personalityTraits: data.personalityTraits || "",

        // Add missing mappings for contact info and relationship'''

new_content = pattern.sub(replacement, content)
if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Target not found with regex")
