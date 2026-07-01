import re

# Fix user.controller.ts (add myFamilyStatus)
controller_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(controller_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "myFamilyStatus: true," not in content:
    content = content.replace("familyType: true,", "familyType: true,\n            myFamilyStatus: true,")
    with open(controller_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("user.controller.ts updated")

# Fix page.tsx (fix myFamilyStatus/myFamilyType/myFamilyValues mappings)
page_path = 'c:/xampp/htdocs/bbbrepo/bbb-website-users/src/app/users/(all)/(main)/account/edit/profile/page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    content = f.read()

# defaultValues
content = content.replace("familyType: \"\",\n        familyStatus: \"\",\n        familyValues: \"\",", "myFamilyType: \"\",\n        myFamilyStatus: \"\",\n        myFamilyValues: \"\",")
content = content.replace("familyType: data.familyType || \"\",", "myFamilyType: data.familyType || \"\",")
content = content.replace("familyStatus: data.myFamilyStatus || data.familyStatus || \"\",", "myFamilyStatus: data.myFamilyStatus || \"\",")
content = content.replace("familyValues: data.familyValues || \"\",", "myFamilyValues: data.familyValues || \"\",")

# check if familyStatus existed in defaultValues without the hack
content = content.replace("familyStatus: \"\",", "myFamilyStatus: \"\",")
content = content.replace("familyStatus: data.familyStatus || \"\",", "myFamilyStatus: data.myFamilyStatus || \"\",")


# onSubmit
if "data.familyType = data.myFamilyType;" not in content:
    old_submit = "if (data.partnerEatingHabit) {"
    new_submit = "if (data.myFamilyType) {\n      data.familyType = data.myFamilyType;\n    }\n    if (data.myFamilyValues) {\n      data.familyValues = data.myFamilyValues;\n    }\n    if (data.partnerEatingHabit) {"
    content = content.replace(old_submit, new_submit)

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("page.tsx updated")
