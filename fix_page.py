import re

file_path = 'c:/xampp/htdocs/bbbrepo/bbb-website-users/src/app/users/(all)/(main)/account/edit/profile/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the formData mapping to include missing fields
old_eating_habit = "eatingHabits: data.eatingHabits || \"\","
new_eating_habit = "eatingHabits: data.eatingHabits || \"\",\n        healthScreening: data.healthScreening || \"\","
content = content.replace(old_eating_habit, new_eating_habit)

old_field_of_study = "fieldOfStudy: data.fieldOfStudy || \"\","
new_field_of_study = "fieldOfStudy: data.fieldOfStudy || \"\",\n        companyName: data.companyName || \"\","
content = content.replace(old_field_of_study, new_field_of_study)

old_partner_diet = "partnerDiet: data.partnerDiet || \"\","
new_partner_diet = "partnerEatingHabit: data.partnerDiet || \"\",\n        partnerDiet: data.partnerDiet || \"\","
content = content.replace(old_partner_diet, new_partner_diet)

old_partner_tongue = "partnerMotherTongue: data.partnerMotherTongue || \"\","
new_partner_tongue = "partnerMotherTongue: data.partnerMotherTongue || \"\",\n        partnerSpokenLanguages: data.partnerSpokenLanguages || \"\",\n        partnerPreferredCountry: data.partnerPreferredCountry || \"\",\n        partnerPreferredState: data.partnerPreferredState || \"\",\n        partnerPreferredDistrict: data.partnerPreferredDistrict || \"\",\n        partnerDescription: data.partnerDescription || \"\","
content = content.replace(old_partner_tongue, new_partner_tongue)

old_country_birth = "countryOfBirth: data.countryOfBirth || \"\","
new_country_birth = "countryOfBirth: data.countryOfBirth || \"\",\n        country: data.country || \"\",\n        citizenship: data.citizenship || \"\",\n        ancestralOrigin: data.ancestralOrigin || \"\","
content = content.replace(old_country_birth, new_country_birth)

# Now in onSubmit, we need to map partnerEatingHabit -> partnerDiet
old_submit = "async function onSubmit(data: any) {\n    setLoading(true);"
new_submit = "async function onSubmit(data: any) {\n    setLoading(true);\n    if (data.partnerEatingHabit) {\n      data.partnerDiet = data.partnerEatingHabit;\n    }"
content = content.replace(old_submit, new_submit)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("page.tsx updated")
