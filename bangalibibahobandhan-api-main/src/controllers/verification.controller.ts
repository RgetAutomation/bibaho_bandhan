import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { generateOTP, sendEmailOtp, sendMobileOtp } from "../utils/otp.js";

// In-memory store for OTPs (Key: email or mobile, Value: { otp, expiresAt })
// In production, consider using Redis.
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// @desc    Send OTP to email and mobile
// @route   POST /api/v1/auth/send-otp
// @access  Public
export const sendVerificationOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, mobile } = req.body;

    if (!email && !mobile) {
      throw new ApiError(400, "Please provide email or mobile to send OTP");
    }

    const responseData: any = {};

    if (email) {
      const emailOtp = generateOTP(6);
      otpStore.set(email, {
        otp: emailOtp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
      });
      const emailSent = await sendEmailOtp(email, emailOtp);
      responseData.emailSent = emailSent;
    }

    if (mobile) {
      const mobileOtp = generateOTP(6);
      otpStore.set(mobile, {
        otp: mobileOtp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
      });
      const mobileSent = await sendMobileOtp(mobile, mobileOtp);
      responseData.mobileSent = mobileSent;
      responseData.mockOtp = mobileOtp; // Bypass for testing
    }

    res
      .status(200)
      .json(new ApiResponse(200, "OTPs sent successfully", responseData));
  }
);

// @desc    Verify OTP for email or mobile
// @route   POST /api/v1/auth/verify-otp
// @access  Public
export const verifyOtp = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, target, otp } = req.body; // type: "email" | "mobile", target: "user@example.com", otp: "123456"

    if (!type || !target || !otp) {
      throw new ApiError(400, "Please provide type, target, and otp");
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

    // OTP is valid
    otpStore.delete(target); // clear the OTP after successful verification

    res
      .status(200)
      .json(new ApiResponse(200, `${type} verified successfully`, null));
  }
);
