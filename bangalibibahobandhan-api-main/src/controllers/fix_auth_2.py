import re

filepath = r"c:\xampp\htdocs\bbbrepo\bangalibibahobandhan-api-main\src\controllers\auth.controller.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add import for asyncHandler if missing
if "import asyncHandler from" not in content:
    lines = content.split('\n')
    last_import_index = 0
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import_index = i
    lines.insert(last_import_index + 1, 'import asyncHandler from "../utils/asyncHandler.js";')
    content = '\n'.join(lines)

# Replace resetPassword implementation
old_pattern = re.compile(r"export async function resetPassword\(req: Request, res: Response\) \{.*\}", re.DOTALL)

new_code = """export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { target, otp, newPassword } = req.body;

  if (!target || !otp || !newPassword) {
    throw new ApiError(400, "Please provide target, otp, and newPassword");
  }

  const storedData = otpStore.get(target);

  if (!storedData) {
    throw new ApiError(400, "No OTP found or it has expired. Please request a new one.");
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(target);
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (storedData.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // OTP is valid, hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user
  const isEmail = target.includes("@");
  const user = await prisma.user.findFirst({
    where: isEmail ? { email: target } : { phone: target },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update password in UserAccount
  const userAccount = await prisma.userAccount.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (userAccount) {
    await prisma.userAccount.update({
      where: { id: userAccount.id },
      data: { password: hashedPassword },
    });
  } else {
    await prisma.userAccount.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: target,
        password: hashedPassword,
      }
    });
  }

  // clear the OTP after successful reset
  otpStore.delete(target);

  res.status(200).json(new ApiResponse(200, "Password reset successfully", null));
});"""

if old_pattern.search(content):
    content = old_pattern.sub(new_code, content)
else:
    print("Could not find the function to replace")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed auth.controller.ts")
