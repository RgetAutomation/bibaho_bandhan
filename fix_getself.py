import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("export async function getSelfDetails")
end_idx = content.find("export async function getSelfPublicProfileDetails", start_idx)

if start_idx != -1 and end_idx != -1:
    func_content = content[start_idx:end_idx]
    
    insert_str = '''
              familyType: true,
              myFamilyStatus: true,
              familyValues: true,
              mothersOccupation: true,
              noOfBrothers: true,
              noOfSisters: true,
              brothersMarriedCount: true,
              sistersMarriedCount: true,
              familyDescription: true,
              familyBackground: true,
              culturalValues: true,
              partnerWeightRange: true,
              partnerEmploymentType: true,
              partnerSubCaste: true,
              partnerGothra: true,
              partnerDrinkingHabit: true,
              partnerSmokingHabit: true,
              partnerDisabilityAcceptable: true,
              partnerPersonalityExpectation: true,
              partnerFamilyExpectation: true,
              partnerFamilyDetails: true,
              familyStatusPreference: true,
              familyTypePreference: true,
              familyValuesPreference: true,
'''
    if "myFamilyStatus: true" not in func_content:
        new_func_content = func_content.replace('relationshipWithBrideGroom: true,', 'relationshipWithBrideGroom: true,' + insert_str)
        new_content = content[:start_idx] + new_func_content + content[end_idx:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Fields added successfully")
    else:
        print("Fields already exist")
else:
    print("Could not find function bounds")
