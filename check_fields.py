import re

fields = [
    "spokenLanguages", "motherTongue", "relationshipWithBrideGroom", 
    "employmentType", "occupationDetails", "designation", "workExperience", 
    "organizationName", "companyName", "collegeInstitution", "fieldOfStudy", 
    "country", "citizenship", "ancestralOrigin", "lifeGoals", "healthScreening", 
    "personalityTraits", "fatherProfession", "mothersOccupation", "noOfBrothers", 
    "brothersMarriedCount", "sistersMarriedCount", "noOfSisters", "myFamilyStatus", 
    "familyType", "familyValues", "familyDescription", "familyBackground", "culturalValues", 
    "partnerAgeRange", "partnerHeightRange", "partnerMaritalStatus", "partnerMotherTongue", 
    "partnerSpokenLanguages", "partnerEmploymentType", "partnerProfession", "partnerIncome", 
    "partnerEducation", "partnerReligion", "partnerCaste", "partnerSubCaste", "partnerGothra", 
    "partnerPreferredCountry", "partnerPreferredState", "partnerPreferredDistrict", 
    "partnerDiet", "partnerDrinkingHabit", "partnerSmokingHabit", "partnerDisabilityAcceptable", 
    "partnerDescription", "partnerPersonalityExpectation", "partnerFamilyExpectation", 
    "familyStatusPreference", "familyTypePreference", "familyValuesPreference"
]

page_path = 'c:/xampp/htdocs/bbbrepo/bbb-website-users/src/app/users/(all)/(main)/account/edit/profile/page.tsx'
controller_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'

with open(page_path, 'r', encoding='utf-8') as f:
    page_content = f.read()
    
with open(controller_path, 'r', encoding='utf-8') as f:
    controller_content = f.read()

# Extract formData object from page.tsx
form_data_match = re.search(r'const formData = \{([^}]+)\};', page_content)
form_data_content = form_data_match.group(1) if form_data_match else ""

# Extract select block from getSelfDetails
getself_match = re.search(r'export async function getSelfDetails.*?profile: \{.*?select: \{([^}]+)\}', controller_content, re.DOTALL)
getself_content = getself_match.group(1) if getself_match else ""

missing_in_page = []
missing_in_controller = []

for field in fields:
    if f"{field}:" not in form_data_content:
        missing_in_page.append(field)
    if f"{field}: true" not in getself_content:
        missing_in_controller.append(field)

print("Missing in page.tsx:", missing_in_page)
print("Missing in user.controller.ts:", missing_in_controller)
