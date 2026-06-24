import os

filepath = r"c:\xampp\htdocs\bbbrepo\bangalibibahobandhan-api-main\src\controllers\auth.controller.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add import if not exists
if 'import { otpStore } from "./verification.controller.js";' not in content:
    # insert after the last import
    lines = content.split('\n')
    last_import_index = 0
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import_index = i
    lines.insert(last_import_index + 1, 'import { otpStore } from "./verification.controller.js";')
    content = '\n'.join(lines)

# Append resetPassword controller
reset_password_code = """
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
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

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // clear the OTP after successful reset
  otpStore.delete(target);

  res.status(200).json(new ApiResponse(200, "Password reset successfully", null));
});
"""

if "export const resetPassword" not in content:
    content += reset_password_code

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Added resetPassword to auth.controller.ts")
