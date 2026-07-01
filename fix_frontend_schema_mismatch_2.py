import re

file_path = 'c:/xampp/htdocs/bbbrepo/bbb-website-users/src/app/users/(all)/(main)/account/edit/profile/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = '''        partnerEducation: data.partnerEducation || "",
        partnerProfession: data.partnerProfession || "",
        partnerIncome: data.partnerIncome || "","''"
target1 = target1[:-1]

replacement1 = '''        partnerMinimumQualification: data.partnerEducation || "",
        partnerOccupation: data.partnerProfession || "",
        partnerAnnualIncome: data.partnerIncome || "","''"
replacement1 = replacement1[:-1]

content = content.replace(target1, replacement1)

target2 = '''      if (data.partnerEatingHabit) {
        data.partnerDiet = data.partnerEatingHabit;
      }'''

replacement2 = '''      if (data.partnerEatingHabit) {
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

content = content.replace(target2, replacement2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced successfully")
