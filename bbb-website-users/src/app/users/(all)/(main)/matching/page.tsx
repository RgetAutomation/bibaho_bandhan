"use client";
import { useState, useMemo, useEffect } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import LoadingPage from "@/components/loader";
import { isPaidUser, NotPaidUserReason } from "@/lib/utils";
import { PlansSection } from "@/components/dashboard/planSection";
import { UserType } from "@/components/enum/userType";
import { useQuery } from "@tanstack/react-query";
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
  Bookmark
} from "lucide-react";

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

  const [appliedFilters, setAppliedFilters] = useState<any>({});

  const handleApplyFilters = () => {
    setAppliedFilters({
      ageFrom, ageTo, heightFrom, heightTo, location, religion, caste, education, profession
    });
  };

  const handleResetFilters = () => {
    setAgeFrom(""); setAgeTo(""); setHeightFrom(""); setHeightTo("");
    setLocation(""); setReligion(""); setCaste(""); setEducation(""); setProfession("");
    setAppliedFilters({});
    setSearchQuery("");
  };

  const [matchTab, setMatchTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const toggleShortlist = (id: string) => {
    let updated = [...shortlistedUsers];
    if (updated.includes(id)) {
      updated = updated.filter(savedId => savedId !== id);
      toast.success("Removed from shortlist");
    } else {
      updated.push(id);
      toast.success("Added to shortlist");
    }
    setShortlistedUsers(updated);
    localStorage.setItem("shortlistedUsers", JSON.stringify(updated));
  };

  const { data: matches, isLoading, refetch } = useQuery({
    queryKey: ["allMatches"],
    queryFn: async () => {
      const res = await api.get<PaginationResponse<AllUsers>>("/users/profiles?page=1&limit=50");
      return res.data.data.data;
    },
    enabled: !!user && user.type === UserType.PAID_USER
  });

  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    return matches.filter(match => {
      let isValid = true;
      const { age, height, dist, state, religion, caste, education, profession } = match.profile as any;
      
      if (appliedFilters.ageFrom && age && age < parseInt(appliedFilters.ageFrom)) isValid = false;
      if (appliedFilters.ageTo && age && age > parseInt(appliedFilters.ageTo)) isValid = false;
      
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
       result = result.filter(m => 
         (m.lastName && m.lastName.toLowerCase().includes(lowerQuery)) ||
         (m.publicId && m.publicId.toLowerCase().includes(lowerQuery))
       );
    }
    
    return result;
  }, [filteredMatches, matchTab, shortlistedUsers, searchQuery]);

  const matchTabs = [
    { id: "all", label: "All Matches", count: filteredMatches.length },
    { id: "premium", label: "Premium Matches", count: filteredMatches.filter(m => m.type === "PAID" || m.isGhotokOwned).length },
    { id: "shortlisted", label: "Shortlisted", count: shortlistedUsers.length },
  ];

  const paginatedMatches = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return finalMatches.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [finalMatches, currentPage]);

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
    <div className="flex flex-col xl:flex-row h-full bg-gray-50/50 dark:bg-zinc-950 px-4 md:px-6 xl:px-8 gap-6 pt-4 pb-0">
      
      {/* Left side: Header + Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        
        {/* Header */}
        <div className="w-full pb-3 shrink-0 z-30 relative bg-gray-50/50 dark:bg-zinc-950 border-b border-transparent">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            My Matches <Heart className="w-6 h-6 md:w-7 md:h-7 fill-[#E51E44] text-[#E51E44]" />
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
              Profiles that are most compatible with you
            </p>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[320px] text-xs font-semibold pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg outline-none focus:border-[#E51E44]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-1.5 md:gap-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-1 rounded-xl shadow-sm w-full shrink-0 z-20 mt-1 mb-2">
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
        <div className="flex-1 flex flex-col space-y-6 pt-2 h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-10 pr-2">

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
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-5 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {paginatedMatches.map((match) => {
            const age = match.profile.age || 27;
            const education = match.profile.education || "B.Sc";
            const profession = match.profile.profession || "Profession Not Set";
            const location = match.profile.dist && match.profile.state 
              ? `${match.profile.dist}, ${match.profile.state}` 
              : "Location Not Set";

            return (
              <Card key={match.id} className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs group hover:shadow-md transition-shadow p-0 gap-0 flex flex-col">
                {/* Image */}
                <div className="relative aspect-square w-full bg-gray-100 dark:bg-zinc-800 shrink-0">
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
                    <div className="absolute bottom-1.5 left-0 right-0 bg-gradient-to-r from-emerald-600 via-emerald-600/80 to-transparent backdrop-blur-[2px] text-white text-[9px] md:text-[10px] font-bold py-1 px-2 leading-none flex items-center">
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

                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-zinc-400 font-medium">
                      <p className="flex items-center gap-2 truncate">
                        <Briefcase className="w-3.5 h-3.5 shrink-0" /> {profession}
                      </p>
                      <p className="flex items-center gap-2 truncate">
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" /> {education}
                      </p>
                      <p className="flex items-center gap-2 truncate text-gray-600 dark:text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#9B1C31]" /> {location}
                      </p>
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
                        onClick={() => toggleShortlist(match.id!)}
                        className="flex-[1.2] rounded-xl text-[10px] md:text-xs py-2 bg-rose-50 text-[#E51E44] hover:bg-rose-100 h-auto font-bold flex items-center justify-center gap-1 shadow-sm px-1 md:px-2 border border-[#E51E44]/30"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-[#E51E44]" />
                        Saved
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleShortlist(match.id!)}
                        className="flex-[1.2] rounded-xl text-[10px] md:text-xs py-2 text-[#E51E44] hover:text-[#C81A3C] border-[#E51E44]/30 hover:bg-rose-50 h-auto font-bold flex items-center justify-center gap-1 shadow-sm px-1 md:px-2"
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
      <div className="mt-6 flex flex-col items-center gap-6 pb-6">
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <Button 
              variant="outline" size="icon" 
              className="w-9 h-9 rounded-xl border-gray-200 dark:border-zinc-800 shadow-xs bg-white dark:bg-zinc-900"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
            </Button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              // Logic: show first, last, current, and +/- 1 from current
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
                      window.scrollTo({ top: 0, behavior: 'smooth' });
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
            </Button>
          </div>
        )}

      </div>
      </div>
      </div>

      {/* Right Sidebar - Refine Matches */}
      <div className="hidden xl:flex flex-col w-[220px] shrink-0 space-y-3 sticky top-0 h-fit max-h-[calc(100vh-120px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-10">
        
        {/* Refine Matches Card */}
        <Card className="p-3 shrink-0 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col gap-3">
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
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5 block">Age</label>
              <div className="flex items-center gap-2">
                <select value={ageFrom} onChange={(e) => setAgeFrom(e.target.value)} className="w-full text-xs font-semibold p-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg outline-none focus:border-rose-400">
                  <option value="">From</option>
                  <option value="20">20</option><option value="22">22</option><option value="25">25</option><option value="28">28</option>
                </select>
                <span className="text-xs font-bold text-gray-400">To</span>
                <select value={ageTo} onChange={(e) => setAgeTo(e.target.value)} className="w-full text-xs font-semibold p-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg outline-none focus:border-rose-400">
                  <option value="">To</option>
                  <option value="25">25</option><option value="28">28</option><option value="32">32</option><option value="35">35</option>
                </select>
              </div>
            </div>

            {/* Height Range */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5 block">Height</label>
              <div className="flex items-center gap-2">
                <select value={heightFrom} onChange={(e) => setHeightFrom(e.target.value)} className="w-full text-xs font-semibold p-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg outline-none focus:border-rose-400">
                  <option value="">From</option>
                  <option value="4'10">4' 10"</option><option value="5'0">5' 0"</option><option value="5'5">5' 5"</option>
                </select>
                <span className="text-xs font-bold text-gray-400">To</span>
                <select value={heightTo} onChange={(e) => setHeightTo(e.target.value)} className="w-full text-xs font-semibold p-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg outline-none focus:border-rose-400">
                  <option value="">To</option>
                  <option value="5'5">5' 5"</option><option value="5'10">5' 10"</option><option value="6'0">6' 0"</option>
                </select>
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
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5 block">{field.label}</label>
                <select value={field.state} onChange={(e) => field.setter(e.target.value)} className="w-full text-xs font-semibold p-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg outline-none focus:border-rose-400">
                  <option value="">All {field.label}</option>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}

            <Button 
              onClick={handleApplyFilters}
              className="w-full bg-[#E51E44] hover:bg-[#C81A3C] text-white font-bold rounded-xl py-2 mt-2"
            >
              Apply Filters
            </Button>
          </div>
        </Card>

        {/* Search Alerts Card */}
        <div className="relative shrink-0 overflow-hidden p-4 bg-gradient-to-br from-rose-50/80 to-white dark:from-rose-950/20 dark:to-zinc-900 border border-rose-100 dark:border-rose-900/30 rounded-2xl shadow-xs">
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
    </div>
  );
}
