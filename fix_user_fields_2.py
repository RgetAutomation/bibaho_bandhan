import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''export async function getSelfDetails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        allowSocialPublish: true,'''

# Regex to handle spacing
pattern = re.compile(r'export async function getSelfDetails\(req: Request, res: Response\) \{\s*try \{\s*const userId = req\.user\?\.id;\s*const user = await prisma\.user\.findUnique\(\{\s*where: \{ id: userId \},\s*select: \{\s*allowSocialPublish: true,')

replacement = '''export async function getSelfDetails(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phone: true,
        allowSocialPublish: true,'''

new_content = pattern.sub(replacement, content)
if new_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Target not found with regex")
