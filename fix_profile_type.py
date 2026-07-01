import re

file_path = 'c:/xampp/htdocs/bbbrepo/bbb-website-users/src/components/interface/ISelfProfile.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_fields = '''
  healthScreening?: string | null;
  country?: string | null;
  citizenship?: string | null;
  ancestralOrigin?: string | null;
  myFamilyStatus?: string | null;
  partnerSpokenLanguages?: string | null;
  partnerPreferredCountry?: string | null;
  partnerPreferredState?: string | null;
  partnerPreferredDistrict?: string | null;
  partnerDescription?: string | null;
  motherTongue?: string | null;
  spokenLanguages?: string | null;
  childrenLivingWith?: string | null;
  relationshipWithBrideGroom?: string | null;
  brothersMarriedCount?: string | null;
  sistersMarriedCount?: string | null;
  familyDescription?: string | null;
  familyBackground?: string | null;
  culturalValues?: string | null;
  partnerPersonalityExpectation?: string | null;
  partnerFamilyExpectation?: string | null;
  partnerFamilyDetails?: string | null;
  familyStatusPreference?: string | null;
  familyTypePreference?: string | null;
  familyValuesPreference?: string | null;
}
'''

content = content.replace('}', new_fields)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("ISelfProfile.ts updated")
