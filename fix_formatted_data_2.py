import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'const formattedData = \{\s*isProfilePublic: user\?\.isProfilePublic,\s*allowSocialPublish: user\?\.allowSocialPublish,\s*verificationStatus: user\?\.verificationStatus,\s*\.\.\.user\?\.profile,\s*\};')

replacement = '''const formattedData = {
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

new_content = pattern.sub(replacement, content)
if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Target not found with regex")
