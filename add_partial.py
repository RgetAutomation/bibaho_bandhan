import re

file_path = 'c:/xampp/htdocs/bbbrepo/bangalibibahobandhan-api-main/src/controllers/user.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "export async function updateProfilePartial" not in content:
    new_func = '''
export async function updateProfilePartial(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json(new ApiError(400, "User not found"));
    }

    const data = req.body;
    
    // Fields that belong to the User model
    const userFields = [
      "title", "firstName", "middleName", "lastName", 
      "email", "phone", "isProfilePublic", "allowSocialPublish"
    ];
    
    const userDataToUpdate: any = {};
    const profileData: any = {};
    
    for (const key of Object.keys(data)) {
      if (userFields.includes(key)) {
        userDataToUpdate[key] = data[key];
      } else {
        profileData[key] = data[key];
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...userDataToUpdate,
        ...(Object.keys(profileData).length > 0 ? {
          profile: {
            upsert: {
              create: { ...profileData },
              update: { ...profileData },
            },
          },
        } : {})
      },
    });

    return res.status(200).json(new ApiResponse(200, "Profile updated successfully"));
  } catch (err: any) {
    console.error("Error in updateProfilePartial:", err);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}
'''
    with open(file_path, 'a', encoding='utf-8') as f:
        f.write("\n" + new_func)
    print("Added updateProfilePartial")
else:
    print("Already exists")
