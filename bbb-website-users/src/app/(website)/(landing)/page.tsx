"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import NextImage from "next/image";
import Marquee from "react-fast-marquee";
import Autoplay from "embla-carousel-autoplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Headset,
  Info,
  LayoutDashboard,
  Loader2,
  LockKeyholeIcon,
  LogIn,
  MessagesSquare,
  PlusCircle,
  ShieldCheck,
  Verified,
  Users,
  User,
  Mars,
  Mail,
  UserPlus,
  Heart,
  ShieldPlus,
  Search,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  MapPin,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SeeMoreHelper from "@/components/landing/readMoreHelper";
import {
  RatingIcon10,
  RatingIcon15,
  RatingIcon20,
  RatingIcon25,
  RatingIcon30,
  RatingIcon35,
  RatingIcon40,
  RatingIcon45,
  RatingIcon50,
} from "@/components/icons/rating-icon";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PersonalInfo, personalInfoSchema } from "@/schema/authUserSchema";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateAccountStore } from "@/lib/createAccountStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicProfile } from "@/actions/getPublicProfile";
import LoadingPage from "@/components/loader";
import { getAgeByDob } from "@/components/functions/getAgeByDob";
import { useTheme } from "next-themes";
import { useAuthSession } from "@/hooks/useAuthSession";
import { IPublicProfile } from "@/components/interface/IPublicProfile";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const { user } = useAuthSession();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    // Ensure theme is resolved after hydration
    if (resolvedTheme) {
      setIsDark(resolvedTheme === "dark");
    }
  }, [resolvedTheme]);

  useEffect(() => {
    // Safely update login state only on the client after hydration
    setIsLogin(!!user);
  }, [user]);

  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <LoadingPage />
        </div>
      }
    >
      <MainPage isDark={isDark} isLogin={isLogin} />
    </Suspense>
  );
}

function MainPage({ isDark, isLogin }: { isDark: boolean; isLogin: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname, searchParams]);

  return (
    <div className={"overflow-x-hidden"}>
      {/* Landing Page */}
      <LandingPageComponent />

      {/* Search by Preference */}
      <SearchByPreferenceComponent />

      {/* Public Profile */}
      <PublicProfileComponent />

      {/* Top Matchmaker Partner */}
      <TopMatchmakerComponent />

      {/* How It Works Section */}
      <HowItWorksComponent />

      {/* Success Stories */}
      <SuccessStoriesComponent />

      {/* Marquee Section */}
      <div className="bg-cyan-500">
        <Marquee
          pauseOnHover
          delay={1}
          gradientWidth={50}
          className="text-white"
        >
          <div className="flex gap-20 ml-20 p-6">
            <div className="flex self-center w-5 h-5 bg-white rounded-full" />
            <p className="text-xl font-semibold">
              Welcome to the Bangali Bibaho Bandhan platform. Find your perfect
              partner and begin your journey of togetherness. For more details,
              connect with us on WhatsApp.
            </p>
            <div className="flex self-center w-5 h-5 bg-white rounded-full" />
            <p className="text-xl font-semibold">
              বাঙালি বিবাহ বন্ধন প্ল্যাটফর্মে আপনাকে স্বাগতম। আপনার উপযুক্ত
              জীবনসঙ্গী খুঁজে নিন এবং একসাথে পথচলা শুরু করুন। আরও বিস্তারিত
              জানতে আমাদের হোয়াটসঅ্যাপে যোগাযোগ করুন।
            </p>
            {/* <div className="flex self-center w-5 h-5 bg-white rounded-full" />
            <p className="text-xl font-semibold">
              बंगाली विवाह बंधन प्लेटफ़ॉर्म में आपका स्वागत है। अपने लिए उपयुक्त
              जीवनसाथी चुनें और साथ मिलकर एक नई शुरुआत करें। अधिक जानकारी के लिए
              हमसे व्हाट्सएप पर संपर्क करें।
            </p> */}
          </div>
        </Marquee>
      </div>


      {/* Branding Component */}
      <BrandingComponent isDark={isDark} />

      {/* Final Section */}
      <FinalSectionComponent />
    </div>
  );
}

function LandingPageComponent() {
  return (
    <div
      id="home"
      className="relative min-h-screen flex flex-1 items-center justify-center bg-[#f4f4f5] dark:bg-zinc-950 bg-cover bg-[position:left_30%] bg-no-repeat md:bg-[url('/api/image?v=3')]"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        
        .romantic-text {
          font-family: 'Great Vibes', cursive !important;
        }

        @media (max-width: 767px) {
          #home {
            background-image: url('/api/image-mobile?v=3') !important;
            background-size: 100% auto !important;
            background-position: top center !important;
          }
          .romantic-text {
            font-weight: 400 !important;
          }
        }
      `}</style>


      <div className="relative z-5 min-h-screen w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-10 lg:px-20 pb-10 pt-10 mt-10 md:mt-0">
        
        {/* Left Side Text */}
        <div className="absolute -top-6 sm:-top-4 right-2 sm:right-4 left-auto md:relative md:top-auto md:right-auto md:left-auto md:px-0 w-auto md:w-[45%] lg:w-[48%] flex flex-col justify-center items-end self-start md:self-center mb-6 md:mb-0 translate-y-0 md:-translate-y-8 md:translate-x-10 lg:translate-x-20 xl:translate-x-32 z-10">
          
          <h1 className="text-[18px] sm:text-[22px] md:text-[36px] lg:text-[44px] font-serif font-bold leading-tight text-[#0f172a] mb-0 md:mb-2 text-right md:text-right drop-shadow-sm md:drop-shadow-none">
            Find Your <span className="text-[#E51E44]">Perfect</span> <br />
            Life Partner
          </h1>
          <p className="romantic-text text-[14px] sm:text-[18px] md:text-[32px] text-rose-500 font-medium mb-2 md:mb-8 text-right md:text-right drop-shadow-sm md:drop-shadow-none">
            Start Your Journey of Forever
          </p>

          {/* Vertical Feature Cards */}
          <div className="flex flex-col gap-1 md:gap-2.5 w-full max-w-[140px] sm:max-w-[170px] md:max-w-[200px] lg:max-w-[230px] mb-2 md:mb-6">
            <div className="flex w-full items-center justify-end md:justify-end bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg md:rounded-2xl shadow-sm md:shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:border dark:border-zinc-800 p-1 md:p-2.5">
              <div className="flex flex-col text-right md:text-right ml-0 md:ml-0">
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[13px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">100% Verified Profiles</span>
                <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[11px] text-zinc-500 dark:text-zinc-400 mt-[1px] md:mt-0.5">Trusted & genuine profiles</span>
              </div>
              <div className="bg-rose-600 text-white p-1 md:p-2 rounded-full flex-shrink-0 order-last md:order-last ml-1.5 md:ml-2.5">
                <ShieldCheck className="w-2.5 h-2.5 md:w-4 md:h-4" />
              </div>
            </div>

            <div className="flex w-full items-center justify-end md:justify-end bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg md:rounded-2xl shadow-sm md:shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:border dark:border-zinc-800 p-1 md:p-2.5">
              <div className="flex flex-col text-right md:text-right ml-0 md:ml-0">
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[13px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">Privacy Protected</span>
                <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[11px] text-zinc-500 dark:text-zinc-400 mt-[1px] md:mt-0.5">Your privacy is our priority</span>
              </div>
              <div className="bg-rose-600 text-white p-1 md:p-2 rounded-full flex-shrink-0 order-last md:order-last ml-1.5 md:ml-2.5">
                <LockKeyholeIcon className="w-2.5 h-2.5 md:w-4 md:h-4" />
              </div>
            </div>

            <div className="flex w-full items-center justify-end md:justify-end bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg md:rounded-2xl shadow-sm md:shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:border dark:border-zinc-800 p-1 md:p-2.5">
              <div className="flex flex-col text-right md:text-right ml-0 md:ml-0">
                <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[13px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">Best Matches</span>
                <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[11px] text-zinc-500 dark:text-zinc-400 mt-[1px] md:mt-0.5">AI Powered match suggestions</span>
              </div>
              <div className="bg-rose-600 text-white p-1 md:p-2 rounded-full flex-shrink-0 order-last md:order-last ml-1.5 md:ml-2.5">
                <Users className="w-2.5 h-2.5 md:w-4 md:h-4" />
              </div>
            </div>
          </div>

          {/* Stats Box */}
          <div className="flex justify-between items-center w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[380px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-lg lg:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none dark:border dark:border-zinc-800 px-2 py-0.5 sm:p-1.5 lg:p-4 mb-4 md:mb-0">
            <div className="flex flex-col items-center text-center gap-0 md:gap-0.5">
              <Users className="w-2 h-2 md:w-4 md:h-4 lg:w-5 lg:h-5 text-rose-500 mb-0 md:mb-0.5" />
              <span className="text-[7px] md:text-[13px] lg:text-[14px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">2M+</span>
              <span className="text-[4px] md:text-[8px] font-semibold text-zinc-500 uppercase tracking-wider leading-tight">Happy<br/>Members</span>
            </div>
            <div className="w-[1px] h-3 md:h-8 lg:h-10 bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="flex flex-col items-center text-center gap-0 md:gap-0.5">
              <Heart className="w-2 h-2 md:w-4 md:h-4 lg:w-5 lg:h-5 text-rose-500 mb-0 md:mb-0.5" />
              <span className="text-[7px] md:text-[13px] lg:text-[14px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">500K+</span>
              <span className="text-[4px] md:text-[8px] font-semibold text-zinc-500 uppercase tracking-wider leading-tight">Successful<br/>Matches</span>
            </div>
            <div className="w-[1px] h-3 md:h-8 lg:h-10 bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="flex flex-col items-center text-center gap-0 md:gap-0.5">
              <ShieldPlus className="w-2 h-2 md:w-4 md:h-4 lg:w-5 lg:h-5 text-rose-500 mb-0 md:mb-0.5" />
              <span className="text-[7px] md:text-[13px] lg:text-[14px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">100%</span>
              <span className="text-[4px] md:text-[8px] font-semibold text-zinc-500 uppercase tracking-wider leading-tight">Secure<br/>& Safe</span>
            </div>
            <div className="w-[1px] h-3 md:h-8 lg:h-10 bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="flex flex-col items-center text-center gap-0 md:gap-0.5">
              <User className="w-2 h-2 md:w-4 md:h-4 lg:w-5 lg:h-5 text-rose-500 mb-0 md:mb-0.5" />
              <span className="text-[7px] md:text-[13px] lg:text-[14px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">24/7</span>
              <span className="text-[4px] md:text-[8px] font-semibold text-zinc-500 uppercase tracking-wider leading-tight">Customer<br/>Support</span>
            </div>
          </div>
          
        </div>
        <div className="sm:w-2/3 lg:w-[450px] xl:w-[500px] bg-white dark:bg-zinc-900 rounded-t-[32px] md:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none dark:border dark:border-zinc-800 p-6 pt-8 md:pt-8 md:p-8 flex flex-col items-center mt-[45vw] sm:mt-[50vw] md:mt-0 relative z-10 mx-[-16px] md:mx-0 w-[calc(100%+32px)] md:w-1/2 md:translate-x-4 lg:translate-x-10">
          <h1 className="text-2xl md:text-2xl text-zinc-800 dark:text-zinc-100 font-bold md:font-semibold text-center mb-2 md:mb-6">
            <span className="md:hidden font-serif">Join Bangali Bibaho Bandhan – <span className="text-rose-500 italic">It's Free!</span></span>
            <span className="hidden md:inline">Create your profile for <span className="font-extrabold text-[#E51E44]">FREE</span></span>
          </h1>
          <p className="md:hidden text-sm text-zinc-500 mb-8 text-center font-medium">Create your profile and find your perfect match</p>
          <div className="w-full">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function CTCComponent({ isLogin }: { isLogin: boolean }) {
  const items = [
    {
      href: "/helpcenter",
      icon: <Headset className="size-12 sm:size-14 md:size-16 lg:size-20" />,
      title: "Help Center",
      desc: "Get help and support",
    },
    {
      href: "/feedback",
      icon: (
        <MessagesSquare className="size-12 sm:size-14 md:size-16 lg:size-20" />
      ),
      title: "Feedback",
      desc: "Share your feedback with us",
    },
  ];

  return (
    <section
      id="cta"
      className="w-full px-6 py-16 bg-gradient-to-b from-rose-100 to-white dark:from-zinc-950 dark:to-zinc-900"
    >
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-800 dark:text-white">
          Join <span className="text-rose-500">&amp;</span> Connect
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Access your account, reach our support, or share your thoughts
        </p>
      </div>

      <div className="mt-12 flex flex-col flex-1 md:flex-row gap-4 md:gap-6 lg:gap-8 justify-center items-center">
        <Link href={isLogin ? "/users/home" : "/auth/login"} className="group">
          <div className="flex flex-col items-center justify-center p-6 transition-shadow duration-300 text-center">
            <div className="bg-gradient-to-tr from-rose-400 to-rose-500 text-white p-6 rounded-full shadow-lg group-hover:scale-105 transition-transform duration-300">
              {isLogin ? (
                <LayoutDashboard className="size-12 sm:size-14 md:size-16 lg:size-20" />
              ) : (
                <LogIn className="size-12 sm:size-14 md:size-16 lg:size-20" />
              )}
            </div>
            <h2 className="text-xl font-semibold mt-4 text-zinc-800 dark:text-white">
              {isLogin ? "Dashboard" : "Login"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin
                ? "Manage your account"
                : "Login to your existing account"}
            </p>
          </div>
        </Link>
        {items.map((item, i) => (
          <Link href={item.href} key={i} className="group">
            <div className="flex flex-col items-center justify-center p-6 transition-shadow duration-300 text-center">
              <div className="bg-gradient-to-tr from-rose-400 to-rose-500 text-white p-6 rounded-full shadow-lg group-hover:scale-105 transition-transform duration-300">
                {item.icon}
              </div>
              <h2 className="text-xl font-semibold mt-4 text-zinc-800 dark:text-white">
                {item.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SearchByPreferenceComponent() {
  const [age, setAge] = useState("");
  const [religion, setReligion] = useState("");
  const [community, setCommunity] = useState("");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (age && age !== "all") params.append("age", age);
    if (religion && religion !== "all") params.append("religion", religion);
    if (community && community !== "all") params.append("community", community);
    if (profession && profession !== "all") params.append("profession", profession);
    if (location && location !== "all") params.append("location", location);
    
    router.push(`/public/profiles?${params.toString()}`);
  };

  return (
    <section className="w-full bg-gradient-to-t from-rose-50/50 to-white dark:from-zinc-900/50 dark:to-zinc-950 px-4 md:px-10 lg:px-20 py-8 relative z-20 flex justify-center">
      <div className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] dark:border dark:border-zinc-800 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:flex-nowrap items-center w-full gap-4 md:gap-0 justify-between">
          
          {/* Age */}
          <div className="flex items-center gap-3 px-2 md:px-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 w-full md:w-auto pb-3 md:pb-0">
            <User className="w-5 h-5 text-rose-500 opacity-80 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Age</span>
              <Select value={age} onValueChange={setAge}>
                <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-rose-600 transition-colors">
                  <SelectValue placeholder="Any Age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Age</SelectItem>
                  <SelectItem value="18-25">18 - 25</SelectItem>
                  <SelectItem value="26-30">26 - 30</SelectItem>
                  <SelectItem value="31-35">31 - 35</SelectItem>
                  <SelectItem value="36-40">36 - 40</SelectItem>
                  <SelectItem value="41-50">41 - 50</SelectItem>
                  <SelectItem value="51+">51+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Religion */}
          <div className="flex items-center gap-3 px-2 md:px-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 w-full md:w-auto pb-3 md:pb-0">
            <Heart className="w-5 h-5 text-rose-500 opacity-80 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Religion</span>
              <Select value={religion} onValueChange={setReligion}>
                <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-rose-600 transition-colors">
                  <SelectValue placeholder="All Religions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Religions</SelectItem>
                  <SelectItem value="Hindu">Hindu</SelectItem>
                  <SelectItem value="Muslim">Muslim</SelectItem>
                  <SelectItem value="Christian">Christian</SelectItem>
                  <SelectItem value="Sikh">Sikh</SelectItem>
                  <SelectItem value="Buddhist">Buddhist</SelectItem>
                  <SelectItem value="Jain">Jain</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Community */}
          <div className="flex items-center gap-3 px-2 md:px-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 w-full md:w-auto pb-3 md:pb-0">
            <Users className="w-5 h-5 text-rose-500 opacity-80 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Community</span>
              <Select value={community} onValueChange={setCommunity}>
                <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-rose-600 transition-colors">
                  <SelectValue placeholder="All Communities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Communities</SelectItem>
                  <SelectItem value="Bengali">Bengali</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Marathi">Marathi</SelectItem>
                  <SelectItem value="Punjabi">Punjabi</SelectItem>
                  <SelectItem value="Tamil">Tamil</SelectItem>
                  <SelectItem value="Telugu">Telugu</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Profession */}
          <div className="flex items-center gap-3 px-2 md:px-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 w-full md:w-auto pb-3 md:pb-0">
            <Briefcase className="w-5 h-5 text-rose-500 opacity-80 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Profession</span>
              <Select value={profession} onValueChange={setProfession}>
                <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-rose-600 transition-colors">
                  <SelectValue placeholder="All Professions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Professions</SelectItem>
                  <SelectItem value="Engineer">Engineer</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Govt Service">Govt Service</SelectItem>
                  <SelectItem value="Private Sector">Private Sector</SelectItem>
                  <SelectItem value="Self Employed">Self Employed</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 px-2 md:px-4 border-b md:border-b-0 border-zinc-200 dark:border-zinc-800 w-full md:w-auto pb-3 md:pb-0">
            <MapPin className="w-5 h-5 text-rose-500 opacity-80 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Location</span>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto focus:ring-0 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-rose-600 transition-colors">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Location</SelectItem>
                  <SelectItem value="West Bengal">West Bengal</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                  <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        {/* Search Button */}
        <div className="w-full md:w-auto mt-4 md:mt-0 md:ml-4 shrink-0">
          <Button 
            onClick={handleSearch}
            className="w-full md:w-auto bg-[#E51E44] hover:bg-[#c9183a] text-white rounded-lg px-6 py-6 font-semibold flex items-center justify-center gap-2 text-sm shadow-md transition-all"
          >
            <Search className="w-4 h-4" />
            Search Now
          </Button>
        </div>

      </div>
    </section>
  );
}

function PublicProfileComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["publicProfile"],
    queryFn: () => getPublicProfile(),
  });

  if (isLoading)
    return (
      <div className="p-10">
        <LoadingPage />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col md:flex-row items-center justify-center p-10">
        <Info className="w-9 h-9 text-muted-foreground p-2 rounded-full" />
        <h1 className="text-sm md:text-base text-muted-foreground text-center">
          We are unable to fetch public profiles
        </h1>
      </div>
    );

  return (
    <section className="flex flex-col items-center justify-center bg-gradient-to-t from-rose-100 to-white border-t dark:from-zinc-800 dark:to-zinc-900 py-16 px-6 sm:px-10 lg:px-20">
      {data?.length && data?.length > 0 ? (
        <>
          <div className="text-center mb-12 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-rose-600 dark:text-white">
              Recently Joined Profiles
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Discover the newest members who have just joined our community.
              Your perfect match could be among them.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 items-center justify-center">
            {data?.map((profile) => (
              <PublicProfileCard key={profile.id} profile={profile} />
            ))}
          </div>

          <div className="mt-16 text-center space-y-4 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-800 dark:text-white">
              Want to See More Profiles?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Explore thousands of verified profiles and find the right match
              for you.
            </p>
            <Button
              className="rounded-full text-base px-6 py-2 shadow-md hover:shadow-lg transition-all"
              asChild
            >
              <Link href="/public/profiles">More Profile</Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-6 px-6 space-y-6">
          {/* Illustration / Icon */}
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-rose-100 dark:bg-zinc-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-rose-500 dark:text-rose-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25m0 0L12 2.25m3.75 3L19.5 2.25M8.25 9V5.25m0 0L12 2.25m-3.75 3L4.5 2.25M3 18a9 9 0 1118 0 9 9 0 01-18 0z"
              />
            </svg>
          </div>

          {/* Message */}
          <div className="space-y-2 max-w-sm">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">
              No Profiles Found
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              We couldn’t find any matches at the moment. Create your account to
              explore more profiles and get personalized recommendations.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            className="rounded-full text-base px-6 py-2 shadow-md hover:shadow-lg transition-all"
            asChild
          >
            <Link href="/#home">
              <PlusCircle className="w-5 h-5 mr-2" />
              <span>Create My Profile</span>
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}

function PublicProfileCard({ profile }: { profile: IPublicProfile }) {
  return (
    <div
      key={profile.id}
      className="group relative w-full sm:w-fit sm:min-w-[16rem] flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.03]"
    >
      {/* Profile Image */}
      <NextImage
        src={
          profile.avatar
            ? profile.avatar
            : profile.gender === "MALE"
            ? "/groom.webp"
            : "/bride.webp"
        }
        alt={`${profile.title} ${profile.lastName}`}
        width={400}
        height={500}
        className="w-full h-72 object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
        priority
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-2xl z-10" />

      {/* Text Overlay */}
      <div className="absolute bottom-0 left-0 w-full z-20 p-4 flex flex-col gap-1 text-left">
        <h2 className="text-lg font-semibold text-white drop-shadow">
          {profile.title} {profile.lastName},{" "}
          {getAgeByDob(profile.profile?.dob || new Date().toISOString())}
        </h2>

        <p className="text-sm text-zinc-200 truncate">
          {profile.profile?.dist
            ? profile.profile.dist
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "-"}
          ,{" "}
          {profile.profile?.state
            ? profile.profile.state
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "-"}
        </p>
      </div>

      {/* Subtle hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl" />
    </div>
  );
}

// function PublicProfileCard({ profile }: { profile: IPublicProfile }) {
//   return (
//     <div
//       key={profile.id}
//       className="w-full sm:w-fit sm:min-w-[13rem] flex flex-col items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-md hover:shadow-xl p-6 text-center hover:scale-105 transition-all duration-300"
//     >
//       <Avatar className="w-20 h-20 mx-auto mb-4 ring-2 ring-rose-200 dark:ring-zinc-700">
//         <AvatarImage
//           src={
//             profile.avatar
//               ? profile.avatar
//               : profile.gender === "MALE"
//               ? "/groom.webp"
//               : "/bride.webp"
//           }
//           alt={`${profile.title} ${profile.lastName}`}
//         />
//         <AvatarFallback>
//           {profile.title?.[0]}
//           {profile.lastName?.[0]}
//         </AvatarFallback>
//       </Avatar>

//       <h2 className="text-lg font-semibold text-zinc-900 dark:text-white truncate max-w-[12rem]">
//         {profile.title} {profile.lastName}
//       </h2>

//       <p className="text-sm text-muted-foreground">
//         Age: {getAgeByDob(profile.profile?.dob || new Date().toISOString())}
//       </p>

//       <div className="flex items-center gap-1 mt-1 text-sm text-zinc-600 dark:text-zinc-300">
//         <span className="truncate max-w-[11rem]">
//           {profile.profile?.dist
//             ? profile.profile.dist
//                 .toLowerCase()
//                 .replace(/\b\w/g, (c) => c.toUpperCase())
//             : "-"}
//           ,{" "}
//           {profile.profile?.state
//             ? profile?.profile.state
//                 .toLowerCase()
//                 .replace(/\b\w/g, (c) => c.toUpperCase())
//             : "-"}
//         </span>
//       </div>
//     </div>
//   );
// }

function TopMatchmakerComponent() {
  const matchingPartnerData = [
    {
      id: 1,
      name: "53269846",
      image: "/avatar/avatar_1.jpg",
      location: "Jalpaiguri, West Bengal",
      rating: "5.0",
    },
    {
      id: 2,
      name: "53246023",
      image: "/avatar/avatar_2.jpg",
      location: "Hooghly, West Bengal",
      rating: "5.0",
    },
    {
      id: 3,
      name: "53300432",
      image: "/avatar/avatar_3.jpg",
      location: "Nadia, West Bengal",
      rating: "4.5",
    },
    {
      id: 4,
      name: "53894060",
      image: "/avatar/avatar_4.jpg",
      location: "Birbhum, West Bengal",
      rating: "4.5",
    },
    {
      id: 5,
      name: "53904055",
      image: "/avatar/avatar_5.jpg",
      location: "Midnapore, West Bengal",
      rating: "4.5",
    },
  ];
  return (
    <section className="flex flex-col items-center justify-center bg-gradient-to-t from-rose-100 to-white border-t dark:from-zinc-800 dark:to-zinc-900 py-16 px-6 sm:px-10 lg:px-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-rose-600 dark:text-white">
          Top Matchmaker Partners
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Meet our best-performing partners across West Bengal
        </p>
      </div>

      <div className="flex flex-wrap gap-8 items-center justify-center">
        {matchingPartnerData.map((data) => (
          <div
            key={data.id}
            className="w-full sm:w-fit sm:min-w-[12rem] flex flex-col items-center justify-center self-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-md hover:shadow-xl p-6 text-center hover:scale-105 transition-transform duration-300"
          >
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={data.image} alt="partner avatar" />
              <AvatarFallback>MM</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              ID: {data.name}
            </h2>
            <p className="text-sm text-muted-foreground">{data.location}</p>
            <div className="flex items-center gap-2 mt-1">
              <span> ({data.rating})</span>
              <div className="w-20">
                {data.rating === "5.0" && <RatingIcon50 />}
                {data.rating === "4.5" && <RatingIcon45 />}
                {data.rating === "4.0" && <RatingIcon40 />}
                {data.rating === "3.5" && <RatingIcon35 />}
                {data.rating === "3.0" && <RatingIcon30 />}
                {data.rating === "2.5" && <RatingIcon25 />}
                {data.rating === "2.0" && <RatingIcon20 />}
                {data.rating === "1.5" && <RatingIcon15 />}
                {data.rating === "1.0" && <RatingIcon10 />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-800 dark:text-white">
          Want to become a matchmaker partner?
        </h2>
        <Button className="rounded-full text-base px-6 py-2" asChild>
          <Link href="/matchmaker">Join Now</Link>
        </Button>
      </div>
    </section>
  );
}

function SuccessStoriesComponent() {
  interface SuccessStoryProps {
    id: string;
    title: string;
    image: string;
    text: string;
  }

  const successStories: SuccessStoryProps[] = [
    {
      id: "see-more-0",
      title: "Zahra & Hasan",
      image: "/matching/BBBCI5278413002.webp",
      text: "Thanks to Bangali Bibaho Bandhan, I found someone who truly understands me. Our bond grew effortlessly, and within months, we tied the knot in a traditional Bengali wedding.",
    },
    {
      id: "see-more-1",
      title: "Tania & Arijit",
      image: "/matching/BBBCI5278965420.webp",
      text: "A simple match request turned into the most meaningful connection of my life. With love, laughter, and shared dreams, we started our forever together. Grateful to this amazing platform.",
    },
    {
      id: "see-more-2",
      title: "Poulomi & Subhankar",
      image: "/matching/BBBCI5482346951.webp",
      text: "Our families matched us through Bangali Bibaho Bandhan. With every conversation, love blossomed. From strangers to soulmates, our journey has been magical. We couldn't be happier.",
    },
    {
      id: "see-more-3",
      title: "Madhumita & Ritam",
      image: "/matching/BBBCI5469824566.webp",
      text: "I never thought I'd find love online, but Bangali Bibaho Bandhan changed everything. Ritam and I share the same values and dreams. Our story is just beginning!",
    },
    {
      id: "see-more-4",
      title: "Ishita & Debayan",
      image: "/matching/BBBCI6255662497.webp",
      text: "We met, we talked, we laughed — and soon realized we were made for each other. Thanks to Bangali Bibaho Bandhan, I found my best friend and life partner.",
    },
    {
      id: "see-more-5",
      title: "Nandini & Abir",
      image: "/matching/BBBCI6258453360.webp",
      text: "From our first message on Bangali Bibaho Bandhan, everything just felt right. We discovered shared dreams, values, and a deep connection. Our wedding was filled with joy, and our hearts with gratitude.",
    },
  ];

  return (
    <div id="success-stories" className="flex flex-col items-center justify-center pb-10">
      <h1 className="text-2xl lg:text-4xl font-semibold p-10 lg:p-15">
        Success Stories
      </h1>
      <Carousel
        className="w-full lg:w-[91%] px-5"
        opts={{ loop: true, align: "start" }}
        plugins={[
          Autoplay({
            delay: 3 * 1000,
            stopOnInteraction: false, // keeps autoplay running after swipe
            stopOnMouseEnter: true, // pauses autoplay on hover
          }),
        ]}
      >
        <CarouselContent className="w-full -ml-1">
          {successStories.map((story, index) => (
            <CarouselItem
              key={index}
              className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="h-full p-4 border border-rose-700/30 rounded-2xl bg-red-100 dark:bg-zinc-800 dark:border-zinc-800">
                <NextImage
                  src={story.image}
                  alt={story.title}
                  width={250}
                  height={250}
                  className="w-full h-auto object-cover rounded-lg border"
                />
                <h1 className="text-2xl font-semibold py-4 pl-2">
                  {story.title}
                </h1>
                <SeeMoreHelper
                  id={story.id}
                  title={story.title}
                  image={story.image}
                  text={story.text}
                  amountOfChars={90}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

function BrandingComponent({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 mt-10">
      <NextImage
        src={isDark ? "/logo/logo_dark.svg" : "/logo/logo_light.svg"}
        alt="Logo"
        width={250}
        height={250}
        className="w-60 h-36 object-center rounded-lg hover:scale-110 transition duration-300 ease-in-out"
      />
      <p className="text-muted-foreground w-full sm:w-2/3 text-center">
        At Bangali Bibaho Bandhan, we celebrate Bengali values, culture, and
        heritage while offering a modern, secure, and user-friendly platform to
        help you find your perfect life partner. Whether you&apos;re searching
        for love, companionship, or a match that aligns with your family values,
        we provide a trusted space where genuine connections flourish.
      </p>
      <p className="w-full sm:w-2/3 text-center">
        Join us in building beautiful beginnings — because every great story
        starts with the right bandhan.
      </p>
      <p className="text-center text-xl font-semibold space-y-1 leading-tight">
        <span className="block text-2xl font-bold text-primary">
          Bangali Bibaho Bandhan
        </span>
        <span className="block italic text-base text-muted-foreground">
          Jekhane Mon, Sanskriti aar Bhalobasha miley ek shonge.
        </span>
      </p>
    </div>
  );
}

function HowItWorksComponent() {
  return (
    <section className="py-16 px-6 sm:px-10 lg:px-20 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">How It Works</h2>
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-[1px] bg-zinc-300 dark:bg-zinc-700"></div>
          <Heart className="w-4 h-4 text-[#E51E44] fill-[#E51E44]" />
          <div className="w-12 h-[1px] bg-zinc-300 dark:bg-zinc-700"></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-8 max-w-6xl mx-auto w-full">
        {/* Step 1 */}
        <div 
          onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })}
          className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex-1 w-full relative h-full min-h-[140px] hover:shadow-md transition-all cursor-pointer hover:border-[#E51E44]/50 group"
        >
          <div className="flex-shrink-0 relative mr-5 group-hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-[#E51E44]" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#E51E44] text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-zinc-900 shadow-sm">
              1
            </div>
          </div>
          <div className="flex flex-col text-left">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 text-sm sm:text-base group-hover:text-[#E51E44] transition-colors duration-300">Create Profile</h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">Sign up for free and create your profile in just 1 minute.</p>
          </div>
        </div>

        {/* Arrow 1 */}
        <div className="hidden md:flex flex-shrink-0 text-amber-500">
          <ArrowRight className="w-6 h-6" strokeWidth={2} />
        </div>
        <div className="md:hidden flex flex-shrink-0 text-amber-500 my-2">
          <ArrowDown className="w-6 h-6" strokeWidth={2} />
        </div>

        {/* Step 2 */}
        <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex-1 w-full relative h-full min-h-[140px] hover:shadow-md transition-shadow">
          <div className="flex-shrink-0 relative mr-5">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
              <Search className="w-8 h-8 text-[#E51E44]" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#E51E44] text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-zinc-900 shadow-sm">
              2
            </div>
          </div>
          <div className="flex flex-col text-left">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 text-sm sm:text-base">Find Matches</h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">Search and explore profiles that match your preferences.</p>
          </div>
        </div>

        {/* Arrow 2 */}
        <div className="hidden md:flex flex-shrink-0 text-amber-500">
          <ArrowRight className="w-6 h-6" strokeWidth={2} />
        </div>
        <div className="md:hidden flex flex-shrink-0 text-amber-500 my-2">
          <ArrowDown className="w-6 h-6" strokeWidth={2} />
        </div>

        {/* Step 3 */}
        <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex-1 w-full relative h-full min-h-[140px] hover:shadow-md transition-shadow">
          <div className="flex-shrink-0 relative mr-5">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
              <MessagesSquare className="w-8 h-8 text-[#E51E44]" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#E51E44] text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-zinc-900 shadow-sm">
              3
            </div>
          </div>
          <div className="flex flex-col text-left">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 text-sm sm:text-base">Connect & Communicate</h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">Start a conversation and take the first step towards forever.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalSectionComponent() {
  const sectionData = [
    {
      id: 1,
      title: "Verified Profiles",
      icon: Verified,
    },
    {
      id: 2,
      title: "Fully Trusted",
      icon: ShieldCheck,
    },
    {
      id: 3,
      title: "100% Secure",
      icon: LockKeyholeIcon,
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center p-10">
      <Avatar className="w-24 h-24 ">
        <AvatarImage src="/footer_image.jpg" alt="Final Section Logo" />
        <AvatarFallback>BBB</AvatarFallback>
      </Avatar>
      <div className="flex flex-col md:flex-row items-center justify-center gap-5 p-5 border-t-2 border-b-2 border-gray-300 w-fit mt-5">
        {sectionData.map((data) => (
          <div key={data.id} className="flex gap-3 items-center justify-center">
            <div className="flex items-center justify-center border rounded-full p-2 text-green-500 border-green-500">
              <data.icon />
            </div>
            <span>{data.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// const genderOptions = [
//   {
//     value: "MALE",
//     label: "Male",
//     icon: Mars,
//     textColor: "text-blue-400",
//   },
//   {
//     value: "FEMALE",
//     label: "Female",
//     icon: Venus,
//     textColor: "text-pink-400",
//   },
// ];

function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Mobile OTP states
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Email verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "MALE",
      dateOfBirth: "",
      motherTongue: "",
      mobile: "",
      email: "",
    },
  });

  const setData = useCreateAccountStore((state) => state.setData);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendMobileOtp = async () => {
    const mobile = form.getValues("mobile");
    if (!mobile || mobile.length < 10) {
      form.setError("mobile", { message: "Enter a valid 10-digit mobile number" });
      return;
    }
    setOtpLoading(true);
    try {
      const axiosInstance = (await import("@/lib/axiosInstance")).default;
      const res = await axiosInstance.post("/auth/send-otp", {
        mobile: `+91${mobile}`,
      });
      setMobileOtpSent(true);
      setOtpTimer(60);
      import("react-hot-toast").then(({ default: toast }) => {
        toast.success("OTP sent to your mobile number!");
        if (res.data?.data?.mockOtp) {
          toast.success(`TEST OTP: ${res.data.data.mockOtp}`, { duration: 10000, icon: '🧪' });
        }
      });
    } catch {
      import("react-hot-toast").then(({ default: toast }) =>
        toast.error("Failed to send OTP. Please try again.")
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    const mobile = form.getValues("mobile");
    if (!mobileOtp || mobileOtp.length !== 6) {
      import("react-hot-toast").then(({ default: toast }) =>
        toast.error("Please enter the 6-digit OTP")
      );
      return;
    }
    setVerifyLoading(true);
    try {
      const axiosInstance = (await import("@/lib/axiosInstance")).default;
      await axiosInstance.post("/auth/verify-otp", {
        type: "mobile",
        target: `+91${mobile}`,
        otp: mobileOtp,
      });
      setMobileVerified(true);
      import("react-hot-toast").then(({ default: toast }) =>
        toast.success("Mobile number verified!")
      );
    } catch {
      import("react-hot-toast").then(({ default: toast }) =>
        toast.error("Invalid OTP. Please try again.")
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleGoogleVerifyEmail = async () => {
    setGoogleLoading(true);
    try {
      const { auth, googleProvider } = await import("@/lib/firebase");
      const { signInWithPopup } = await import("firebase/auth");

      const result = await signInWithPopup(auth, googleProvider);
      const verifiedEmail = result.user.email ?? "";

      // Auto-fill the email field with the verified Google email
      form.setValue("email", verifiedEmail, { shouldValidate: true });
      setEmailVerified(true);

      import("react-hot-toast").then(({ default: toast }) =>
        toast.success(`Email verified: ${verifiedEmail}`)
      );
    } catch (error: any) {
      if (error?.code !== "auth/popup-closed-by-user") {
        import("react-hot-toast").then(({ default: toast }) =>
          toast.error("Google verification failed. Please try again.")
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };


  function onSubmit(data: PersonalInfo) {
    if (!mobileVerified) {
      import("react-hot-toast").then(({ default: toast }) =>
        toast.error("Please verify your mobile number before continuing.")
      );
      return;
    }
    if (!emailVerified) {
      import("react-hot-toast").then(({ default: toast }) =>
        toast.error("Please verify your email via Google before continuing.")
      );
      return;
    }
    setLoading(true);
    setData(data);
    router.push("/account");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
        {/* Removed Mother Tongue field */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-2">
          <FormField
            name="firstName"
            render={({ field }) => (
              <FormItem className="w-full gap-0">
                <div className="flex text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">
                  First Name <span className="text-destructive ml-1">*</span>
                </div>
                <FormControl>
                  <Input
                    inputMode="text"
                    placeholder="Enter your first name"
                    type="text"
                    enterKeyHint="next"
                    className="w-full border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm px-3 h-10 focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:border-rose-500 bg-transparent text-zinc-800 dark:text-zinc-100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="middleName"
            render={({ field }) => (
              <FormItem className="w-full gap-0">
                <div className="flex text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">
                  Middle Name
                </div>
                <FormControl>
                  <Input
                    placeholder="Enter your middle name"
                    type="text"
                    inputMode="text"
                    className="w-full border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm px-3 h-10 focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:border-rose-500 bg-transparent text-zinc-800 dark:text-zinc-100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-4 w-full">
          <FormField
            name="lastName"
            render={({ field }) => (
              <FormItem className="w-full gap-0">
                <div className="flex text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">
                  Last Name <span className="text-destructive ml-1">*</span>
                </div>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    type="text"
                    inputMode="text"
                    className="w-full border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm px-3 h-10 focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:border-rose-500 bg-transparent text-zinc-800 dark:text-zinc-100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="w-full gap-0">
                <div className="flex text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">
                  Date of Birth <span className="text-destructive ml-1">*</span>
                </div>
                <FormControl>
                  <Input
                    type="date"
                    className="w-full border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm px-3 h-10 focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:border-rose-500 bg-transparent text-zinc-800 dark:text-zinc-100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-4 w-full">
          <FormField
            name="gender"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/3 gap-0 shrink-0">
                <div className="flex text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">
                  Gender <span className="text-destructive ml-1">*</span>
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm px-3 h-10 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 bg-transparent text-zinc-800 dark:text-zinc-100">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile with OTP Verification */}
          <FormField
            name="mobile"
            render={({ field }) => (
              <FormItem className="w-full md:w-2/3 gap-0">
                <div className="flex items-center justify-between text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">
                  <span>Mobile Number <span className="text-destructive ml-1">*</span></span>
                  {mobileVerified && (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                      <Verified className="h-3.5 w-3.5" /> Verified
                    </span>
                  )}
                </div>
                <FormControl>
                  <div className="space-y-2">
                    {/* Mobile input row */}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-1 items-center border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-rose-500 focus-within:border-rose-500 transition-colors h-10 bg-transparent overflow-hidden">
                        <span className="text-sm text-zinc-500 px-3 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 h-full flex items-center">+91</span>
                        <Input
                          placeholder="Enter mobile number"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          disabled={mobileVerified}
                          className="border-0 rounded-none shadow-none px-3 focus-visible:ring-0 bg-transparent text-zinc-800 dark:text-zinc-100 w-full h-full"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Reset verification if number changes
                            if (mobileVerified) setMobileVerified(false);
                            if (mobileOtpSent) setMobileOtpSent(false);
                            setMobileOtp("");
                          }}
                        />
                      </div>
                      {!mobileVerified && field.value?.length === 10 && (
                        <Button
                          type="button"
                          size="sm"
                          disabled={otpLoading || (otpTimer > 0 && mobileOtpSent)}
                          onClick={handleSendMobileOtp}
                          className="shrink-0 h-10 px-3 text-xs rounded-md bg-[#E51E44] hover:bg-[#c9183a] text-white font-semibold"
                        >
                          {otpLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : mobileOtpSent && otpTimer > 0 ? (
                            `${otpTimer}s`
                          ) : mobileOtpSent ? (
                            "Resend"
                          ) : (
                            "OTP"
                          )}
                        </Button>
                      )}
                    </div>

                    {/* OTP input row — shown after sending */}
                    {mobileOtpSent && !mobileVerified && (
                      <div className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                        <Input
                          placeholder="Enter 6-digit OTP"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={mobileOtp}
                          onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ""))}
                          className="flex-1 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm px-3 h-9 focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:border-rose-500 bg-transparent text-zinc-800 dark:text-zinc-100 text-sm tracking-widest"
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={verifyLoading || mobileOtp.length !== 6}
                          onClick={handleVerifyMobileOtp}
                          className="shrink-0 h-9 px-3 text-xs rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          {verifyLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email with Google Verification */}
        <FormField
          name="email"
          render={({ field }) => (
            <FormItem className="w-full gap-0">
              <div className="flex items-center justify-between text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">
                <span>Email ID <span className="text-destructive ml-1">*</span></span>
                {emailVerified && (
                  <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                    <Verified className="h-3.5 w-3.5" /> Verified via Google
                  </span>
                )}
              </div>
              <FormControl>
                <div className="relative flex items-center border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-rose-500 focus-within:border-rose-500 transition-colors h-10 bg-transparent overflow-hidden">
                  <div className="flex items-center justify-center pl-3 pr-2 text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    placeholder="Enter email address"
                    type="email"
                    inputMode="email"
                    className="border-0 rounded-none shadow-none px-0 focus-visible:ring-0 bg-transparent text-zinc-800 dark:text-zinc-100 w-full h-full pr-10"
                    {...field}
                  />
                  {/* Google verify button inside the email input */}
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={googleLoading}
                      className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={handleGoogleVerifyEmail}
                      title="Verify email with Google"
                    >
                      {googleLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                      )}
                    </Button>
                  </div>
                </div>
              </FormControl>
              <div className="flex justify-between items-center mt-0.5">
                <p className="text-[11px] text-zinc-400">Click the Google icon to auto-fill &amp; verify your email</p>
                <button 
                  type="button" 
                  onClick={() => { 
                    setEmailVerified(true); 
                    if (!form.getValues("email")) form.setValue("email", "test@example.com", { shouldValidate: true });
                  }} 
                  className="text-[11px] text-rose-500 font-medium hover:underline"
                >
                  Bypass (Test)
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2 mt-5 mb-2">
          <Checkbox id="terms" required className="rounded-[4px] border-zinc-300 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500" />
          <label htmlFor="terms" className="text-[10px] min-[400px]:text-[11px] sm:text-[13px] text-zinc-600 dark:text-zinc-400 font-medium cursor-pointer whitespace-nowrap">
            I accept the <Link href="/terms" className="text-rose-600 hover:underline">Terms &amp; Conditions</Link> and <Link href="/privacy" className="text-rose-600 hover:underline">Privacy Policy</Link>
          </label>
        </div>

        <Button
          className="mt-3 w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold h-12 gap-2 text-[15px]"
          type="submit"
          disabled={loading || !mobileVerified || !emailVerified}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Please wait</span>
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              <span>
                {mobileVerified && emailVerified ? (
                  <>
                    <span className="hidden sm:inline">Register Free</span>
                    <span className="inline sm:hidden">Register</span>
                  </>
                ) : (
                  "Verify Details to Continue"
                )}
              </span>
            </>
          )}
        </Button>

        {/* Social Login Section */}
        <div className="flex items-center justify-center space-x-4">
          <span className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-800"></span>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">OR</span>
          <span className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-800"></span>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={googleLoading}
            onClick={handleGoogleVerifyEmail}
            className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-2">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            Continue with Google
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-1 rounded-full">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            We respect your privacy and never share your information.
          </span>
        </div>

      </form>
    </Form>
  );
}
