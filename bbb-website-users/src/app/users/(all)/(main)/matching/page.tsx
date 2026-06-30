"use client";
import { useState, useMemo, useEffect } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import LoadingPage from "@/components/loader";
import { isPaidUser, NotPaidUserReason } from "@/lib/utils";
import { PlansSection } from "@/components/dashboard/planSection";
import { UserType } from "@/components/enum/userType";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { sendConnectionRequest } from "@/actions/userConnections";
import api from "@/lib/axiosInstance";
import { PaginationResponse } from "@/components/interface/AxiosResponse";
import { AllUsers } from "@/components/interface/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { 
  Heart, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  CheckCircle2, 
  MessageSquare,
  Users,
  Search,
  Filter,
  Bell,
  MailOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  Flame,
  Target,
  Bookmark,
  ChevronDown
} from "lucide-react";

const ageOptions = Array.from({length: 33}, (_, i) => {
  const age = i + 18; // 18 to 50
  return { label: `${age}`, value: `${age}`, numericValue: age };
});

const heightOptions = Array.from({length: 25}, (_, i) => {
  const inches = i + 54; // 4'6" to 6'6"
  const feet = Math.floor(inches / 12);
  const inch = inches % 12;
  return { label: `${feet}' ${inch}"`, value: `${feet}'${inch}`, numericValue: inches };
});

const parseHeight = (h: string) => {
  if (!h) return 0;
  const parts = h.match(/(\d+)'\s*(\d+)/);
  if (parts) {
    return parseInt(parts[1]) * 12 + parseInt(parts[2]);
  }
  return 0;
};

const RangeWithSlider = ({ title, minVal, maxVal, setMinVal, setMaxVal, options, minRange, maxRange }: any) => {
  const minNum = options.find((o: any) => o.value === minVal)?.numericValue ?? minRange;
  const maxNum = options.find((o: any) => o.value === maxVal)?.numericValue ?? maxRange;
  
  const minPercent = ((minNum - minRange) / (maxRange - minRange)) * 100;
  const maxPercent = ((maxNum - minRange) / (maxRange - minRange)) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <label className="text-[13px] font-extrabold text-gray-900 dark:text-zinc-100">{title}</label>
      </div>
      
      {/* Visual Slider */}
      <div className="px-2 mb-3">
        <div className="relative h-[3px] bg-gray-200 dark:bg-zinc-800 rounded-full w-full flex items-center">
          <div className="absolute h-full bg-[#E51E44] rounded-full pointer-events-none" style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}></div>
          
          <input 
            type="range"
            min={minRange}
            max={maxRange}
            value={minNum}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), maxNum - 1);
              const option = options.find((o: any) => o.numericValue === val) || options.reduce((prev: any, curr: any) => Math.abs(curr.numericValue - val) < Math.abs(prev.numericValue - val) ? curr : prev);
              setMinVal(option.value);
            }}
            className="absolute w-full h-[3px] appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#E51E44] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-[#E51E44] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full cursor-pointer"
          />
          <input 
            type="range"
            min={minRange}
            max={maxRange}
            value={maxNum}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), minNum + 1);
              const option = options.find((o: any) => o.numericValue === val) || options.reduce((prev: any, curr: any) => Math.abs(curr.numericValue - val) < Math.abs(prev.numericValue - val) ? curr : prev);
              setMaxVal(option.value);
            }}
            className="absolute w-full h-[3px] appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#E51E44] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-[#E51E44] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select value={minVal} onChange={(e) => setMinVal(e.target.value)} className="w-full text-[11px] font-bold text-gray-700 dark:text-zinc-300 py-1.5 px-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md outline-none focus:border-rose-400 appearance-none">
            <option value="">Min {options[0]?.label}</option>
            {options.map((o: any) => <option key={`min-${o.value}`} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <span className="text-[11px] font-bold text-gray-900 dark:text-zinc-300">to</span>
        <div className="relative flex-1">
          <select value={maxVal} onChange={(e) => setMaxVal(e.target.value)} className="w-full text-[11px] font-bold text-gray-700 dark:text-zinc-300 py-1.5 px-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md outline-none focus:border-rose-400 appearance-none">
            <option value="">Max {options[options.length - 1]?.label}</option>
            {options.map((o: any) => <option key={`max-${o.value}`} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}

export default function MatchingPage() {
  const { user, isPending } = useAuthSession();
  const router = useRouter();

  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [heightFrom, setHeightFrom] = useState("");
  const [heightTo, setHeightTo] = useState("");
  const [location, setLocation] = useState("");
  const [religion, setReligion] = useState("");
  const [caste, setCaste] = useState("");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<string[]>([]);

  const [appliedFilters, setAppliedFilters] = useState<any>({});

  const handleApplyFilters = () => {
    setAppliedFilters({
      ageFrom, ageTo, heightFrom, heightTo, location, religion, caste, education, profession, maritalStatus
    });
  };

  const handleResetFilters = () => {
    setAgeFrom(""); setAgeTo(""); setHeightFrom(""); setHeightTo("");
    setLocation(""); setReligion(""); setCaste(""); setEducation(""); setProfession("");
    setMaritalStatus([]);
    setAppliedFilters({});
    setSearchQuery("");
  };

  const [matchTab, setMatchTab] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Trigger fade transition when filters, tabs or search change
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 200);
    return () => clearTimeout(timer);
  }, [appliedFilters, matchTab, searchQuery]);

  const [shortlistedUsers, setShortlistedUsers] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("shortlistedUsers");
    if (saved) {
      try {
        setShortlistedUsers(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleShortlist = async (match: AllUsers) => {
    const id = match.id!;
    let updated = [...shortlistedUsers];
    
    const savedData = localStorage.getItem("shortlistedUserData");
    let dataMap: Record<string, any> = {};
    if (savedData) dataMap = JSON.parse(savedData);

    if (updated.includes(id)) {
      updated = updated.filter(savedId => savedId !== id);
      delete dataMap[id];
      toast.success("Removed from shortlist");
    } else {
      updated.push(id);
      dataMap[id] = {
        id: match.id,
        title: match.title,
        firstName: (match as any).firstName,
        lastName: match.lastName,
        gender: match.gender,
        avatar: match.avatar,
        isGhotokOwned: match.isGhotokOwned,
        profile: match.profile,
        isInterestSent: false,
        isInterestReceived: false
      };
      toast.success("Added to shortlist");
    }
    setShortlistedUsers(updated);
    localStorage.setItem("shortlistedUsers", JSON.stringify(updated));
    localStorage.setItem("shortlistedUserData", JSON.stringify(dataMap));
    window.dispatchEvent(new Event("shortlistUpdated"));

    // Sync with backend
    try {
      await api.post(`/users/shortlist/${id}`);
    } catch(e) {
      console.error("Failed to sync shortlist with backend", e);
    }
  };

  const { ref: loadMoreRef, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
    queryKey: ["allMatches"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get<PaginationResponse<AllUsers>>(`/users/profiles?page=${pageParam}&limit=50`);
      let fetchedData = res.data.data.data;
      // Shuffle array to show random profiles
      return fetchedData.sort(() => Math.random() - 0.5);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 50 ? allPages.length + 1 : undefined;
    },
    enabled: !!user && user.type === UserType.PAID_USER
  });

  const matches = useMemo(() => data?.pages.flat() || [], [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    return matches.filter(match => {
      let isValid = true;
      const { age, height, dist, state, religion, caste, education, profession } = match.profile as any;
      
      if (appliedFilters.ageFrom && age && age < parseInt(appliedFilters.ageFrom)) isValid = false;
      if (appliedFilters.ageTo && age && age > parseInt(appliedFilters.ageTo)) isValid = false;
      
      if (appliedFilters.heightFrom || appliedFilters.heightTo) {
        const hInches = parseHeight(height);
        const hFrom = appliedFilters.heightFrom ? parseHeight(appliedFilters.heightFrom) : 0;
        const hTo = appliedFilters.heightTo ? parseHeight(appliedFilters.heightTo) : 999;
        if (hInches > 0) {
          if (hFrom > 0 && hInches < hFrom) isValid = false;
          if (hTo < 999 && hInches > hTo) isValid = false;
        }
      }
      
      // Just simple checks, if user selects "All Religions" or leaves empty, we skip
      if (appliedFilters.location && appliedFilters.location !== "All Locations" && dist && state && !`${dist}, ${state}`.toLowerCase().includes(appliedFilters.location.toLowerCase())) isValid = false;
      if (appliedFilters.religion && appliedFilters.religion !== "All Religions" && religion !== appliedFilters.religion) isValid = false;
      if (appliedFilters.caste && appliedFilters.caste !== "All Castes" && caste !== appliedFilters.caste) isValid = false;
      if (appliedFilters.education && appliedFilters.education !== "All Education" && education !== appliedFilters.education) isValid = false;
      if (appliedFilters.profession && appliedFilters.profession !== "All Profession" && profession !== appliedFilters.profession) isValid = false;

      return isValid;
    });
  }, [matches, appliedFilters]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Reset to page 1 when filters or tabs change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, matchTab]);

  const finalMatches = useMemo(() => {
    let result = filteredMatches;
    if (matchTab === "new") {
       // Since 'createdAt' isn't on AllUsers, we'll assume the first 15 returned are the newest.
       result = result.slice(0, 15);
    } else if (matchTab === "premium") {
       result = result.filter(m => m.type === "PAID" || m.isGhotokOwned);
    } else if (matchTab === "shortlisted") {
       result = result.filter(m => m.id && shortlistedUsers.includes(m.id));
    }
    
    if (searchQuery.trim() !== "") {
       const lowerQuery = searchQuery.toLowerCase();
       result = result.filter(m => {
         // Only search by lastName and publicId as requested
         return (m.lastName && m.lastName.toLowerCase().includes(lowerQuery)) || 
                (m.publicId && m.publicId.toLowerCase().includes(lowerQuery));
       });
    }
    
    return result;
  }, [filteredMatches, matchTab, shortlistedUsers, searchQuery]);

  const matchTabs = [
    { id: "all", label: "All Matches", count: filteredMatches.length },
    { id: "premium", label: "Premium Matches", count: filteredMatches.filter(m => m.type === "PAID" || m.isGhotokOwned).length },
    { id: "shortlisted", label: "Shortlisted", count: shortlistedUsers.length },
  ];

  const paginatedMatches = useMemo(() => {
    if (isMobile) return finalMatches;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return finalMatches.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [finalMatches, currentPage, isMobile]);

  const totalPages = Math.ceil(finalMatches.length / ITEMS_PER_PAGE);

  const handleSendInterest = async (receiverId: string) => {
    try {
      const response = await sendConnectionRequest(receiverId);
      if (response.success) {
        toast.success(response.message || "Interest sent successfully!");
        refetch();
      } else {
        toast.error(response.message || "Failed to send interest");
      }
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  if (isPending) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh]">
        <LoadingPage />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPaid = isPaidUser(
    user.type as UserType,
    new Date(user.planExpiryDate ?? "")
  );

  if (!isPaid.paid) {
    return (
      <div className="flex flex-col flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <PlansSection
          showFreeSection={isPaid.reason === NotPaidUserReason.FREE_USER}
          showPlanExpiredSection={isPaid.reason === NotPaidUserReason.PLAN_EXPIRED}
          userType={user.type as UserType}
          planExpiryDate={user.planExpiryDate}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row h-[calc(100vh-80px)] xl:h-full bg-gray-50/50 dark:bg-zinc-950 px-4 md:px-6 xl:pr-8 xl:pl-3 gap-6 pt-4 pb-0 overflow-hidden">
      
      {/* Right Sidebar - Refine Matches */}
      <div className={`${showMobileFilters ? "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" : "hidden"} xl:flex xl:static xl:bg-transparent xl:p-0 xl:backdrop-blur-none xl:z-auto flex-col w-full xl:w-[220px] shrink-0 space-y-3 xl:sticky xl:top-0 h-[100dvh] xl:h-fit max-h-screen xl:max-h-[calc(100vh-120px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-10 xl:pb-10`}>
        {showMobileFilters && (
          <div className="absolute inset-0 z-0 xl:hidden" onClick={() => setShowMobileFilters(false)} />
        )}
        
        {/* Refine Matches Card */}
        <Card className="relative z-10 w-full max-w-[320px] xl:max-w-none max-h-[85vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-4 xl:p-3 shrink-0 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-2xl xl:shadow-xs flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-zinc-800">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
              Refine Matches <Filter className="w-3.5 h-3.5 text-gray-400" />
            </h2>
            <button 
              onClick={handleResetFilters}
              className="text-[10px] md:text-xs font-bold text-[#E51E44] hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {/* Age Range */}
            <RangeWithSlider 
              title="Age" 
              minVal={ageFrom} maxVal={ageTo} 
              setMinVal={setAgeFrom} setMaxVal={setAgeTo} 
              options={ageOptions} minRange={18} maxRange={50} 
            />

            {/* Height Range */}
            <RangeWithSlider 
              title="Height" 
              minVal={heightFrom} maxVal={heightTo} 
              setMinVal={setHeightFrom} setMaxVal={setHeightTo} 
              options={heightOptions} minRange={54} maxRange={78} 
            />

            {/* Marital Status (Checkboxes) */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5 block">Marital Status</label>
              <div className="flex flex-col gap-2.5 mt-2">
                {["Never Married", "Divorced", "Widowed", "Awaiting Divorce"].map(status => (
                  <label key={status} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={maritalStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMaritalStatus(prev => [...prev, status]);
                          } else {
                            setMaritalStatus(prev => prev.filter(s => s !== status));
                          }
                        }}
                        className="peer appearance-none w-4 h-4 border border-gray-300 dark:border-zinc-700 rounded-sm checked:bg-[#E51E44] checked:border-[#E51E44] cursor-pointer transition-all" 
                      />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                        <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Single Selects */}
            {[
              { label: "Location", state: location, setter: setLocation, options: ["Kolkata + 50 km", "Delhi", "Mumbai", "Bangalore"] },
              { label: "Religion", state: religion, setter: setReligion, options: ["Hinduism", "Islam", "Christianity", "Sikhism"] },
              { label: "Caste", state: caste, setter: setCaste, options: ["Brahmin", "Kayastha", "Baidya", "Scheduled Caste"] },
              { label: "Education", state: education, setter: setEducation, options: ["B.Tech", "M.Tech", "B.Sc", "MBA", "Doctorate"] },
              { label: "Profession", state: profession, setter: setProfession, options: ["Software Engineer", "Doctor", "Teacher", "Business"] }
            ].map((field, idx) => (
              <div key={idx}>
                <label className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1 block">{field.label}</label>
                <div className="relative">
                  <select value={field.state} onChange={(e) => field.setter(e.target.value)} className="w-full text-[11px] font-semibold py-1.5 px-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md outline-none focus:border-rose-400 appearance-none">
                    <option value="">All {field.label}</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}

            <Button 
              onClick={() => {
                handleApplyFilters();
                setShowMobileFilters(false);
              }}
              className="w-full bg-[#E51E44] hover:bg-[#C81A3C] text-white font-bold rounded-xl py-2 mt-2"
            >
              Apply Filters
            </Button>
          </div>
        </Card>

        {/* Search Alerts Card */}
        <div className="hidden xl:block relative shrink-0 overflow-hidden p-4 bg-gradient-to-br from-rose-50/80 to-white dark:from-rose-950/20 dark:to-zinc-900 border border-rose-100 dark:border-rose-900/30 rounded-2xl shadow-xs">
          <div className="relative z-10 space-y-2.5">
            <h3 className="font-extrabold text-[13px] text-gray-900 dark:text-white flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-rose-500" /> Search Alerts
            </h3>
            <p className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 leading-relaxed max-w-[170px]">
              12 New profiles matching your preferences
            </p>
            <button className="text-[11px] font-bold text-[#E51E44] hover:underline flex items-center gap-1">
              View New Profiles &rarr;
            </button>
          </div>
          <div className="absolute -bottom-2 -right-4 opacity-80">
            <MailOpen className="w-20 h-20 text-rose-200 dark:text-rose-900/40 fill-rose-100 dark:fill-rose-900/20" strokeWidth={1} />
          </div>
        </div>
      </div>
      {/* Left side: Header + Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        
        {/* Header */}
        <div className="w-full pb-3 shrink-0 z-30 relative bg-gray-50/50 dark:bg-zinc-950 border-b border-transparent">
          <h1 className="hidden md:flex text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white items-center gap-2">
            My Matches <Heart className="w-6 h-6 md:w-7 md:h-7 fill-[#E51E44] text-[#E51E44]" />
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:mt-1">
            <p className="hidden md:block text-sm font-medium text-gray-500 dark:text-zinc-400">
              Profiles that are most compatible with you
            </p>
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[320px] text-sm font-medium pl-9 pr-10 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E51E44]/20 transition-all shadow-sm"
              />
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`xl:hidden absolute right-1.5 top-1/2 -translate-y-1/2 shrink-0 flex items-center justify-center p-1.5 rounded-lg transition-colors ${showMobileFilters ? "bg-[#E51E44]/10 text-[#E51E44]" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
              >
                <Filter className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-wrap md:flex-nowrap items-center justify-between gap-1.5 md:gap-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-1 rounded-xl shadow-sm w-full shrink-0 z-20 mt-1 mb-2">
          {matchTabs.map(tab => {
            const isActive = matchTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMatchTab(tab.id)}
                className={`flex-1 flex justify-center items-center gap-1.5 md:gap-2 px-2 py-1 md:px-4 md:py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all ${
                  isActive 
                    ? "bg-[#E51E44] text-white shadow-sm" 
                    : "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Main Column */}
        <div id="matching-scroll-container" className="flex-1 flex flex-col space-y-6 pt-2 h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-10 xl:pr-2">

        {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[340px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs animate-pulse" />
          ))}
        </div>
      ) : !matches || finalMatches.length === 0 ? (
        <div className={`flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800/80 shadow-xs min-h-[40vh] transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-full mb-4">
            <Users className="w-8 h-8 text-gray-400 dark:text-zinc-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Matches Found</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
            We couldn't find any perfect matches for this section. Try adjusting your search criteria or switching tabs.
          </p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-1 gap-4 md:gap-5 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {paginatedMatches.map((match) => {
            const age = match.profile.age || 27;
            const education = match.profile.education || "B.Sc";
            const profession = match.profile.profession || "Profession Not Set";
            const location = match.profile.dist && match.profile.state 
              ? `${match.profile.dist}, ${match.profile.state}` 
              : "Location Not Set";
            const height = match.profile.height || "";

            return (
              <Card key={match.id} className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs group hover:shadow-md transition-shadow p-0 gap-0 flex flex-col xl:flex-row scroll-mt-2">
                {/* Image */}
                <div className="relative aspect-square xl:aspect-auto w-full xl:w-[220px] bg-gray-100 dark:bg-zinc-800 shrink-0">
                  <Image
                    src={match.avatar || (match.gender === "MALE" ? "/groom.webp" : "/bride.webp")}
                    alt={match.lastName}
                    fill
                    className="object-cover object-top"
                  />
                  
                  {match.status === "Online" && (
                    <span className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md border border-white/20">
                      Online
                    </span>
                  )}

                  {match.isGhotokOwned && (
                    <div className="absolute bottom-1.5 left-0 right-0 bg-gradient-to-r from-emerald-600 via-emerald-600/80 to-transparent backdrop-blur-[2px] text-white text-xs font-bold py-1.5 px-2.5 leading-none flex items-center">
                      Managed by a Matchmaker
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-3.5 flex flex-col gap-3 flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <h4 className="font-extrabold text-[15px] text-gray-900 dark:text-white truncate">
                        {match.title} {match.lastName}, {age}
                      </h4>
                      {match.isGhotokOwned && <CheckCircle2 className="w-4 h-4 text-white fill-green-500 shrink-0 shadow-sm rounded-full" />}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] md:text-xs text-gray-600 dark:text-zinc-400 font-bold mb-1">
                      <p className="flex items-center gap-1.5 truncate">
                        <Briefcase className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" /> {profession}
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <GraduationCap className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" /> {education}
                      </p>
                      <p className="flex items-center gap-1.5 truncate text-gray-600 dark:text-zinc-400">
                        <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 text-[#9B1C31]" /> {location}
                      </p>
                      {height && (
                        <p className="flex items-center gap-1.5 truncate text-gray-600 dark:text-zinc-400">
                          <Target className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 text-gray-400" /> {height}
                        </p>
                      )}
                    </div>

                    {/* Why it's a great match */}
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                      <h5 className="text-[10px] font-extrabold text-[#E51E44] mb-1.5">
                        Why it's a great match
                      </h5>
                      <div className="grid grid-cols-2 gap-y-1.5 gap-x-1.5">
                        {(() => {
                          const reasons = [];
                          const p = match.profile as any;
                          if (p.religion) reasons.push({ label: "Religion Match", icon: Flame, color: "text-amber-500" });
                          if (p.education) reasons.push({ label: "Education Match", icon: GraduationCap, color: "text-amber-500" });
                          if (p.profession) reasons.push({ label: "Profession Match", icon: Briefcase, color: "text-blue-500" });
                          if (p.location || p.state) reasons.push({ label: "Location Match", icon: MapPin, color: "text-rose-500" });
                          
                          // Fallbacks to ensure exactly 4 items for a perfect 2x2 grid
                          if (!reasons.find(r => r.label === "Family Values Match")) reasons.push({ label: "Family Values Match", icon: Users, color: "text-amber-500" });
                          if (!reasons.find(r => r.label === "Partner Preference Match")) reasons.push({ label: "Partner Preference Match", icon: Target, color: "text-[#E51E44]/70" });
                          if (!reasons.find(r => r.label === "Lifestyle Match")) reasons.push({ label: "Lifestyle Match", icon: Heart, color: "text-rose-400" });
                          
                          // Take exactly the first 4
                          return reasons.slice(0, 4).map((reason, idx) => {
                            const Icon = reason.icon;
                            return (
                              <div key={idx} className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold text-gray-600 dark:text-zinc-400">
                                <Icon className={`w-3 h-3 ${reason.color} shrink-0`} />
                                <span className="truncate">{reason.label}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 mt-auto">
                    {shortlistedUsers.includes(match.id!) ? (
                      <Button
                        size="sm"
                        onClick={() => toggleShortlist(match)}
                        className="flex-1 md:flex-[1.2] rounded-xl text-[10px] md:text-xs py-2 bg-rose-50 text-[#E51E44] hover:bg-rose-100 h-auto font-bold flex items-center justify-center gap-1 shadow-sm px-1 md:px-2 border border-[#E51E44]/30"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-[#E51E44]" />
                        Saved
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleShortlist(match)}
                        className="flex-1 md:flex-[1.2] rounded-xl text-[10px] md:text-xs py-2 text-[#E51E44] hover:text-[#C81A3C] border-[#E51E44]/30 hover:bg-rose-50 h-auto font-bold flex items-center justify-center gap-1 shadow-sm px-1 md:px-2"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        Shortlist
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleSendInterest(match.id!)}
                      className="flex-1 rounded-xl text-[10px] md:text-xs py-2 bg-[#E51E44] hover:bg-[#C81A3C] text-white h-auto border-none shadow-sm font-bold px-1 md:px-2"
                    >
                      {match.isInterestSent ? "Sent" : "Interest"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/users/profile/${match.id}`)}
                      className="flex-1 rounded-xl text-[10px] md:text-xs py-2 text-[#E51E44] hover:text-[#C81A3C] border-[#E51E44]/30 hover:bg-rose-50 h-auto font-bold flex items-center justify-center shadow-sm px-1 md:px-2"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination & Verification Banner */}
      <div className="mt-6 hidden md:flex flex-col items-center gap-6 pb-6">
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <Button 
              variant="outline" size="icon" 
              className="w-9 h-9 rounded-xl border-gray-200 dark:border-zinc-800 shadow-xs bg-white dark:bg-zinc-900"
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                const scrollContainer = document.getElementById('matching-scroll-container');
                if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
            </Button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <Button 
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    className={`w-9 h-9 rounded-xl font-bold transition-all ${
                      currentPage === pageNum 
                        ? "bg-[#E51E44] hover:bg-[#C81A3C] text-white shadow-xs" 
                        : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                    }`}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      const scrollContainer = document.getElementById('matching-scroll-container');
                      if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                      else window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {pageNum}
                  </Button>
                );
              } else if (
                pageNum === currentPage - 2 || 
                pageNum === currentPage + 2
              ) {
                return <span key={pageNum} className="px-1 text-gray-400 font-bold">...</span>;
              }
              return null;
            })}

            <Button 
              variant="outline" size="icon" 
              className="w-9 h-9 rounded-xl border-gray-200 dark:border-zinc-800 shadow-xs bg-white dark:bg-zinc-900"
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                const scrollContainer = document.getElementById('matching-scroll-container');
                if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
            </Button>
          </div>
        )}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="w-full h-10 flex items-center justify-center mb-8 shrink-0">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-[#E51E44] text-sm font-semibold">
            <div className="w-4 h-4 rounded-full border-2 border-[#E51E44] border-t-transparent animate-spin"></div>
            Loading more profiles...
          </div>
        )}
      </div>
      </div>
      </div>
      {/* --- WATERMARK SECTION (DELETE THIS TO REMOVE THE WATERMARK) --- */}
      <div className="fixed inset-0 z-[999999] pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] dark:opacity-5">
        <div className="transform -rotate-45 text-[75px] sm:text-[90px] md:text-[180px] font-black text-black dark:text-white whitespace-nowrap select-none">
          COMPLETED
        </div>
      </div>
      {/* ------------------------------------------------------------- */}
    </div>
  );
}
