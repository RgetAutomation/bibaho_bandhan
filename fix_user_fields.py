import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          allowSocialPublish: true,
          isProfilePublic: true,
          verificationStatus: true,
          profile: {'''

replacement = '''      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
          allowSocialPublish: true,
          isProfilePublic: true,
          verificationStatus: true,
          profile: {'''

new_content = content.replace(target, replacement)
if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Target not found")
