import re

file_path = 'c:/xampp/htdocs/bbbrepo/bbb-website-users/src/app/users/(all)/(main)/account/edit/profile/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace formData
target_form_data = '''        partnerEducation: data.partnerEducation || "",
        partnerProfession: data.partnerProfession || "",
        partnerIncome: data.partnerIncome || "","''"

replacement_form_data = '''        partnerMinimumQualification: data.partnerEducation || "",
        partnerOccupation: data.partnerProfession || "",
        partnerAnnualIncome: data.partnerIncome || "","''"
content = content.replace(target_form_data, replacement_form_data)

# Replace onSubmit
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
