import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''            partnerAgeRange: true,
            partnerHeightRange: true,
            partnerMaritalStatus: true,
            partnerReligion: true,
            partnerMotherTongue: true,'''

replacement = '''            lifeGoals: true,
            personalityTraits: true,
            partnerAgeRange: true,
            partnerHeightRange: true,
            partnerMaritalStatus: true,
            partnerReligion: true,
            partnerMotherTongue: true,
            partnerProfession: true,
            partnerIncome: true,
            partnerEducation: true,
            partnerCaste: true,'''

new_content = content.replace(target, replacement)
if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Target not found")
