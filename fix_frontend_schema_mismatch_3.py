import re

file_path = 'c:/xampp/htdocs/bbbrepo/bbb-website-users/src/app/users/(all)/(main)/account/edit/profile/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("partnerEducation: data.partnerEducation || \"\",", "partnerMinimumQualification: data.partnerEducation || \"\",")
content = content.replace("partnerProfession: data.partnerProfession || \"\",", "partnerOccupation: data.partnerProfession || \"\",")
content = content.replace("partnerIncome: data.partnerIncome || \"\",", "partnerAnnualIncome: data.partnerIncome || \"\",")

target_onsubmit = '''      if (data.partnerEatingHabit) {
        data.partnerDiet = data.partnerEatingHabit;
      }'''

replacement_onsubmit = '''      if (data.partnerEatingHabit) {
        data.partnerDiet = data.partnerEatingHabit;
      }
      if (data.partnerMinimumQualification) {
        data.partnerEducation = data.partnerMinimumQualification;
      }
      if (data.partnerOccupation) {
        data.partnerProfession = data.partnerOccupation;
      }
      if (data.partnerAnnualIncome) {
        data.partnerIncome = data.partnerAnnualIncome;
      }'''

content = content.replace(target_onsubmit, replacement_onsubmit)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced successfully")
