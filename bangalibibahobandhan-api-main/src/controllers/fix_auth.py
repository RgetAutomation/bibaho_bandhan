import re

filepath = r"c:\xampp\htdocs\bbbrepo\bangalibibahobandhan-api-main\src\controllers\auth.controller.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the resetPassword implementation
old_reset_password_pattern = re.compile(r"export const resetPassword = asyncHandler\(async \(req: Request, res: Response\) => \{.*\}\);", re.DOTALL)

new_reset_password = """export async function resetPassword(req: Request, res: Response) {
  try {
    const { target, otp, newPassword } = req.body;

    if (!target || !otp || !newPassword) {
      return res.status(400).json(new ApiError(400, "Please provide target, otp, and newPassword"));
    }

    const storedData = otpStore.get(target);

    if (!storedData) {
      return res.status(400).json(new ApiError(400, "No OTP found or it has expired. Please request a new one."));
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(target);
      return res.status(400).json(new ApiError(400, "OTP has expired. Please request a new one."));
    }

    if (storedData.otp !== otp) {
      return res.status(400).json(new ApiError(400, "Invalid OTP"));
    }

    // OTP is valid, hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    const isEmail = target.includes("@");
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: target } : { phone: target },
    });

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
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

    return res.status(200).json(new ApiResponse(200, "Password reset successfully", null));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
}"""

if old_reset_password_pattern.search(content):
    content = old_reset_password_pattern.sub(new_reset_password, content)
else:
    print("Could not find the old resetPassword implementation to replace.")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed auth.controller.ts")
