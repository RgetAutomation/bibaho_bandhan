import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the select in getUserById and the basicInfo / fullInfo objects.
# Let's just use profile: true for the select to get everything,
# and then spread 	argetUser.profile into basicInfo (excluding sensitive things if needed).

new_content = content.replace('''
          profile: {
            select: {
              profileImages: {
                select: {
                  id: true,
                  url: true,
                },
              },
              dob: true,
              maritalStatus: true,
              children: true,
              speciallyAble: true,
              religion: true,
              gotra: true,
              caste: true,
              subCaste: true,
              manglikDosh: true,
              height: true,
              weight: true,
              bloodGroup: true,
              skinTone: true,
              bodyType: true,
              eatingHabits: true,
              drinkingHabits: true,
              smokingHabits: true,
              dist: true,
              state: true,
              aboutMyself: true,
              profession: true,
              education: true,
              hobbies: true,
              monthlyIncome: true,
              language: true,
              familyMembers: true,
              fatherProfession: true,
              candidatePreference: true,
              locationPreference: true,
              aboutMyPartner: true,
              rashi: true,
              nakshatra: true,
              birthTime: true,
              cityOfBirth: true,
              countryOfBirth: true,
            },
          },
''', '''
          profile: {
            include: {
              profileImages: {
                select: {
                  id: true,
                  url: true,
                },
              },
            }
          },
''')

# Now add firstName, middleName to the user select
new_content = new_content.replace('''
          id: true,
          publicId: true,
          title: true,
          lastName: true,
''', '''
          id: true,
          publicId: true,
          title: true,
          firstName: true,
          middleName: true,
          lastName: true,
''')

# Now let's fix basicInfo
# I will replace the basicInfo declaration completely.
basic_info_regex = re.compile(r'const basicInfo = \{.*?\};', re.DOTALL)
new_basic_info = '''const basicInfo = {
      id: targetUser.id,
      publicId: targetUser.publicId,
      age: age,
      title: targetUser.title,
      firstName: targetUser.firstName,
      middleName: targetUser.middleName,
      lastName: targetUser.lastName,
      gender: targetUser.gender,
      avatar: targetUser?.avatar,
      alreadySentRequest: !!youRequestSent,
      receivedRequestId: youRequestReceived?.id,
      receivedRequestStatus: youRequestReceived?.status,
      alreadyBlocked: !!youBlockUser,
      alreadyFriend: !!bothAreFriends,
      phone: !!bothAreFriends ? targetUser.phone : null,
      email: !!bothAreFriends ? targetUser.email : null,
      status,
      verificationStatus: targetUser.verificationStatus,
      isGhotokOwned: targetUser.isGhotokOwned,
      ghotokPublicId: targetUser.ghotok?.ghotokPublicId,
      ...(targetUser.profile || {}),
      // override any sensitive profile fields if necessary
      whatsappNumber: !!bothAreFriends ? targetUser.profile?.whatsappNumber : null,
      alternatePhone: !!bothAreFriends ? targetUser.profile?.alternatePhone : null,
    };'''
new_content = basic_info_regex.sub(new_basic_info, new_content)

full_info_regex = re.compile(r'const fullInfo = \{.*?\};', re.DOTALL)
new_full_info = '''const fullInfo = {
      ...basicInfo,
      // All fields are already in basicInfo now, so frontend can mask them.
      // Phone/email/whatsapp are only revealed if bothAreFriends, 
      // or we can allow fullInfo to see phone/email if paid?
      // Wait, the original code had: phone: !!bothAreFriends ? targetUser.phone : null
      // So paid users DON'T get phone numbers unless they are friends!
    };'''
new_content = full_info_regex.sub(new_full_info, new_content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated user.controller.ts")
