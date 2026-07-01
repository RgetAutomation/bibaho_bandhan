import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''      const formattedData = {
        isProfilePublic: user?.isProfilePublic,
        allowSocialPublish: user?.allowSocialPublish,
        verificationStatus: user?.verificationStatus,
        ...user?.profile,
      };'''

replacement = '''      const formattedData = {
        isProfilePublic: user?.isProfilePublic,
        allowSocialPublish: user?.allowSocialPublish,
        verificationStatus: user?.verificationStatus,
        id: user?.id,
        firstName: user?.firstName,
        middleName: user?.middleName,
        lastName: user?.lastName,
        email: user?.email,
        phone: user?.phone,
        ...user?.profile,
      };'''

new_content = content.replace(target, replacement)
if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Target not found")
