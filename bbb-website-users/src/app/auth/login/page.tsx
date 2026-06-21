import { Metadata } from "next";
import LoginClientPage from "./loginClientPage";
import { ShieldCheck, Lock, Users, MessageCircle, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account to find your perfect match.",
};

export default async function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between min-h-[calc(100vh-100px)] p-4 sm:p-6 lg:p-12 xl:px-32 max-w-[1600px] mx-auto w-full gap-8 lg:gap-16 relative">
      
      {/* Left side content */}
      <div className="hidden md:flex flex-col w-full md:w-1/2 max-w-[400px] lg:max-w-[480px] md:-mt-28 lg:-mt-40">
        <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 text-[#E51E44] dark:text-rose-400 px-3 py-1 rounded-full w-fit mb-6 border border-rose-100 dark:border-rose-900/50">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
          <span className="text-[11px] sm:text-xs font-bold">Trusted by Millions of Happy Members</span>
        </div>
        
        <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-[1.15] mb-3 tracking-tight">
          Find Your Perfect Match,<br />
          <span className="text-[#E51E44]">Find Your Forever</span>
        </h1>
        
        <p className="text-zinc-600 dark:text-zinc-400 text-xs lg:text-sm mb-8 leading-relaxed font-medium">
          Join thousands of genuine people who are looking for a lifelong partner on Bangali Bibaho Bandhan.
        </p>

        <div className="flex flex-col gap-4 lg:gap-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#E51E44] dark:text-rose-400" strokeWidth={2} />
            </div>
            <div className="flex flex-col pt-1 sm:pt-1.5">
              <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-[13px] sm:text-sm mb-0.5">Verified & Genuine Profiles</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs font-medium leading-relaxed">Each profile is verified for your trust and safety.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#E51E44] dark:text-rose-400" strokeWidth={2} />
            </div>
            <div className="flex flex-col pt-1 sm:pt-1.5">
              <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-[13px] sm:text-sm mb-0.5">Secure & Private Platform</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs font-medium leading-relaxed">Your privacy and security are our top priority.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#E51E44] dark:text-rose-400" strokeWidth={2} />
            </div>
            <div className="flex flex-col pt-1 sm:pt-1.5">
              <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-[13px] sm:text-sm mb-0.5">Serious Relationships</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs font-medium leading-relaxed">Connect with like-minded people seeking a meaningful relationship.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#E51E44] dark:text-rose-400" strokeWidth={2} />
            </div>
            <div className="flex flex-col pt-1 sm:pt-1.5">
              <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-[13px] sm:text-sm mb-0.5">Easy & Safe Communication</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] sm:text-xs font-medium leading-relaxed">Start conversations and build connections with ease.</p>
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
          "Bangali Bibaho Bandhan helped me find not just a partner, but my best friend for life."
        </p>
        <div className="flex items-center justify-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          ))}
        </div>
        <p className="text-[#E51E44] font-bold text-[10px]">
          – Priya & Arjun
        </p>
      </div>

      {/* Right side login card */}
      <div className="flex w-full md:w-fit bg-white dark:bg-zinc-900 rounded-xl shadow-xl items-center justify-center sm:items-start sm:justify-start flex-shrink-0 border border-zinc-100 dark:border-zinc-800 relative z-20">
        <LoginClientPage />
      </div>
    </div>
  );
}
