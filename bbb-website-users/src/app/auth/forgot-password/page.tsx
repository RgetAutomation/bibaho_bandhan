import { Metadata } from "next";
import ForgotPasswordClientPage from "./forgotPasswordClientPage";
import { ShieldCheck, Lock, Users, MessageCircle, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password to get back to finding your perfect match.",
};

export default async function ForgotPasswordPage() {
  return (
    <div className="flex flex-col md:flex-row items-center max-md:justify-center md:justify-between max-md:min-h-fit md:min-h-[calc(100vh-100px)] max-md:my-10 p-4 sm:p-6 lg:p-12 xl:px-32 max-w-[1600px] mx-auto w-full gap-8 lg:gap-16 relative">
      
      {/* Left side content */}
      <div className="hidden md:flex flex-col w-full md:w-1/2 max-w-[400px] lg:max-w-[480px] md:-mt-28 lg:-mt-40">
        <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 text-[#E51E44] dark:text-rose-400 px-3 py-1 rounded-full w-fit mb-6 border border-rose-100 dark:border-rose-900/50">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
          <span className="text-[11px] sm:text-xs font-bold">Trusted by Millions of Happy Members</span>
        </div>
        
        <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-[1.15] mb-3 tracking-tight">
          Forgot Your Password?<br />
          <span className="text-[#E51E44]">We've Got You Covered</span>
        </h1>
        
        <p className="text-zinc-600 dark:text-zinc-400 text-xs lg:text-sm mb-8 leading-relaxed font-medium">
          Don't worry, resetting your password is easy. Just verify your identity and you'll be back on Bangali Bibaho Bandhan in no time.
        </p>

        <div className="flex flex-col gap-4 lg:gap-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#E51E44] dark:text-rose-400" strokeWidth={2} />
            </div>
            <div className="flex flex-col pt-1 sm:pt-1.5">
              <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-[13px] sm:text-sm mb-0.5">Secure Reset Process</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs font-medium leading-relaxed">We use OTP verification to ensure your account remains safe.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#E51E44] dark:text-rose-400" strokeWidth={2} />
            </div>
            <div className="flex flex-col pt-1 sm:pt-1.5">
              <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-[13px] sm:text-sm mb-0.5">Privacy First</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs font-medium leading-relaxed">Your new password is encrypted and never shared.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Testimonial Card */}
      <div className="hidden lg:block absolute bottom-8 left-[25%] xl:left-[15%] bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-4 pt-6 max-w-[280px] text-center border border-zinc-100 dark:border-zinc-800 z-10">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#E51E44] rounded-full flex items-center justify-center text-white text-4xl font-serif pt-4">
          “
        </div>
        <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed mb-3">
          "I forgot my password but the reset process was so simple and fast!"
        </p>
        <div className="flex items-center justify-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          ))}
        </div>
        <p className="text-[#E51E44] font-bold text-[10px]">
          – Rahul
        </p>
      </div>

      {/* Right side form card */}
      <div className="flex w-full md:w-fit bg-white dark:bg-zinc-900 rounded-xl shadow-xl items-center justify-center sm:items-start sm:justify-start flex-shrink-0 border border-zinc-100 dark:border-zinc-800 relative z-20">
        <ForgotPasswordClientPage />
      </div>
    </div>
  );
}
