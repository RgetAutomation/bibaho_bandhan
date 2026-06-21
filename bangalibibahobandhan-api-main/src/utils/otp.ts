import nodemailer from "nodemailer";
import { prisma } from "../config/db.js";
import axios from "axios";

export const generateOTP = (length: number = 6): string => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const sendEmailOtp = async (email: string, otp: string) => {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings || !settings.smtpHost || !settings.smtpUser) {
      console.log(`[MOCK EMAIL] To: ${email} | OTP: ${otp}`);
      return true;
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    } as any);

    await transporter.sendMail({
      from: `"Bangali Bibaho Bandhan" <${settings.smtpUser}>`,
      to: email,
      subject: "Your Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verification OTP</h2>
          <p>Your One Time Password (OTP) for verifying your email is:</p>
          <h1 style="color: #E51E44; letter-spacing: 5px;">${otp}</h1>
          <p>Please do not share this OTP with anyone.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending email OTP:", error);
    return false;
  }
};

export const sendMobileOtp = async (mobile: string, otp: string) => {
  try {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings || !settings.smsGatewayUrl) {
      console.log(`[MOCK SMS] To: ${mobile} | OTP: ${otp}`);
      return true;
    }

    // Example logic for generic SMS API
    // The exact implementation depends on the provider (e.g. MSG91, Fast2SMS)
    // Here we make a simple GET/POST call as a placeholder
    const url = settings.smsGatewayUrl
      .replace("{{mobile}}", mobile)
      .replace("{{otp}}", otp)
      .replace("{{apikey}}", settings.smsApiKey || "");

    await axios.get(url);
    return true;
  } catch (error) {
    console.error("Error sending mobile OTP:", error);
    return false;
  }
};
