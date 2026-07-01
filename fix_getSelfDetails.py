import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific select block in getSelfDetails
match = re.search(r'export async function getSelfDetails.*?where: { id: userId },\s*select: {(.*?)},\s*}\);\s*const formattedData', content, re.DOTALL)
if match:
    old_select = match.group(1)
    new_select = '''
          allowSocialPublish: true,
          isProfilePublic: true,
          verificationStatus: true,
          phone: true,
          email: true,
          firstName: true,
          lastName: true,
          gender: true,
          profile: true
    '''
    # We replace the old select with the new one
    new_content = content.replace(match.group(0), match.group(0).replace(old_select, new_select))
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced select block")
else:
    print("Could not find getSelfDetails select block")
