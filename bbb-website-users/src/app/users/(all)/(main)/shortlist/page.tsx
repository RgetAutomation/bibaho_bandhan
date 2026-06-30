"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthSession } from "@/hooks/useAuthSession";
import LoadingPage from "@/components/loader";
import { isPaidUser } from "@/lib/utils";
import { UserType } from "@/components/enum/userType";
import { useQuery } from "@tanstack/react-query";
import { sendConnectionRequest } from "@/actions/userConnections";
import api from "@/lib/axiosInstance";
import { PaginationResponse } from "@/components/interface/AxiosResponse";
import { AllUsers } from "@/components/interface/user";
import Image from "next/image";
import Link from "next/link";
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
  Users,
  Bookmark,
  Target,
  Flame,
  BookmarkMinus,
  Star,
  Camera,
  MessageSquare,
  Edit3,
  MoreVertical,
  ChevronDown,
  Trash2,
  Clock,
  Send,
  LineChart,
  Lightbulb,
  Eye,
  Ruler,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ShortlistPage() {
  const { user, isPending } = useAuthSession();
  const router = useRouter();
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("Shortlisted by Me");
  const [visibleCount, setVisibleCount] = useState(4);
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setVisibleCount(4);
  }, [activeTab]);

  const [savedUserData, setSavedUserData] = useState<Record<string, any>>({});

  // Note editing state
  const [editingNoteUser, setEditingNoteUser] = useState<{id: string, name: string} | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [privateNotes, setPrivateNotes] = useState<Record<string, string>>({});

  // Fetch private notes from API
  const { data: dbNotes } = useQuery({
    queryKey: ["privateNotes"],
    queryFn: async () => {
      const res = await api.get<{ data: { targetId: string, note: string }[] }>("/users/notes");
      return res.data.data;
    },
    enabled: !!user && user.type === UserType.PAID_USER
  });

  // Sync DB notes to local state
  useEffect(() => {
    if (dbNotes && Array.isArray(dbNotes)) {
      const notesMap: Record<string, string> = {};
      dbNotes.forEach(n => {
        notesMap[n.targetId] = n.note;
      });
      setPrivateNotes(notesMap);
      // Migrate legacy localStorage notes if any
      const legacy = localStorage.getItem("shortlistedUserNotes");
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          // Only sync those that don't exist in DB to prevent overrides
          Object.keys(parsed).forEach(async (tid) => {
            if (!notesMap[tid]) {
               await api.put(`/users/notes/${tid}`, { note: parsed[tid] });
            }
          });
          localStorage.removeItem("shortlistedUserNotes");
        } catch(e) {}
      }
    }
  }, [dbNotes]);

  const handleSaveNote = async () => {
    if (!editingNoteUser) return;
    setSavingNote(true);
    try {
      const res = await api.put(`/users/notes/${editingNoteUser.id}`, { note: noteText });
      if (res.data.success) {
        setPrivateNotes(prev => ({
          ...prev,
          [editingNoteUser.id]: noteText
        }));
        toast.success("Private note saved successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save private note");
    } finally {
      setSavingNote(false);
      setEditingNoteUser(null);
      setNoteText("");
    }
  };

  // Load saved user data (from interests page shortlist)
  useEffect(() => {
    const loadSaved = () => {
      const saved = localStorage.getItem("shortlistedUsers");
      if (saved) {
        try { setShortlistedIds(JSON.parse(saved)); } catch (e) {}
      }
      const savedData = localStorage.getItem("shortlistedUserData");
      if (savedData) {
        try { setSavedUserData(JSON.parse(savedData)); } catch (e) {}
      }
    };
    loadSaved();
    window.addEventListener("shortlistUpdated", loadSaved);
    return () => window.removeEventListener("shortlistUpdated", loadSaved);
  }, []);


  const handleRemoveShortlist = (id: string) => {
    const updated = shortlistedIds.filter(savedId => savedId !== id);
    setShortlistedIds(updated);
    localStorage.setItem("shortlistedUsers", JSON.stringify(updated));
    // Also remove from saved user data
    const savedData = localStorage.getItem("shortlistedUserData");
    if (savedData) {
      try {
        const dataMap = JSON.parse(savedData);
        delete dataMap[id];
        localStorage.setItem("shortlistedUserData", JSON.stringify(dataMap));
      } catch(e) {}
    }
    setSavedUserData(prev => { const next = {...prev}; delete next[id]; return next; });
    toast.success("Removed from shortlist");
  };

  const handleSendInterest = async (receiverId: string) => {
    const data = await sendConnectionRequest(receiverId);
    if (data.success) {
      toast.success(data.message || "Interest sent successfully");
      
      // Update local storage and state so the user doesn't disappear if backend filters them out
      const savedData = localStorage.getItem("shortlistedUserData");
      if (savedData) {
        try {
          const dataMap = JSON.parse(savedData);
          if (dataMap[receiverId]) {
            dataMap[receiverId].isInterestSent = true;
            localStorage.setItem("shortlistedUserData", JSON.stringify(dataMap));
          } else {
             // If not in local storage but in API, try to find in allUsers and save
             const userFromApi = allUsers?.find(u => u.id === receiverId);
             if (userFromApi) {
                dataMap[receiverId] = {
                  ...userFromApi,
                  isInterestSent: true,
                  isInterestReceived: false
                };
                localStorage.setItem("shortlistedUserData", JSON.stringify(dataMap));
             }
          }
          setSavedUserData(dataMap);
        } catch(e) {}
      }
      
      refetch();
    } else {
      toast.error(data.message || "Failed to send interest");
    }
  };

  // Fetch all users
  const { data: allUsers, isLoading, refetch } = useQuery({
    queryKey: ["allProfilesForShortlist"],
    queryFn: async () => {
      const res = await api.get<PaginationResponse<AllUsers>>("/users/profiles?page=1&limit=50");
      return res.data.data.data;
    },
    enabled: !!user && user.type === UserType.PAID_USER
  });

  const { data: apiShortlistedByMeUsers, isPending: isShortlistedByMeLoading } = useQuery({
    queryKey: ["shortlistedByMeProfiles"],
    queryFn: async () => {
      const res = await api.get<{ data: AllUsers[] }>("/users/shortlist/by-me");
      return res.data.data;
    },
    enabled: !!user
  });


  const shortlistedUsers = useMemo(() => {
    const localSaved = [...shortlistedIds];
    const userMap = new Map<string, AllUsers>();

    // Start with API users that match local saved IDs
    if (allUsers) {
      allUsers.forEach(u => {
        if (u.id && localSaved.includes(u.id)) {
          userMap.set(u.id, u);
        }
      });
    }

    // Add local offline user data
    localSaved.forEach(id => {
      if (!userMap.has(id) && savedUserData[id]) {
        userMap.set(id, savedUserData[id]);
      }
    });

    // Add database synced users (from other devices)
    if (apiShortlistedByMeUsers) {
      apiShortlistedByMeUsers.forEach(u => {
        if (u && u.id) {
          userMap.set(u.id, u);
        }
      });
    }

    return Array.from(userMap.values());
  }, [allUsers, shortlistedIds, savedUserData, apiShortlistedByMeUsers]);

  const { data: apiShortlistedMeUsers, isPending: isShortlistedMeLoading } = useQuery({
    queryKey: ["shortlistedMeProfiles"],
    queryFn: async () => {
      const res = await api.get<{ data: AllUsers[] }>("/users/shortlist/me");
      return res.data.data;
    },
    enabled: !!user && user.type === UserType.PAID_USER
  });

  const shortlistedMeUsers = apiShortlistedMeUsers || [];

  const displayUsers = activeTab === "Shortlisted by Me" ? shortlistedUsers : shortlistedMeUsers;
  const isCurrentTabLoading = activeTab === "Shortlisted by Me" ? (isLoading || isShortlistedByMeLoading) : isShortlistedMeLoading;

  const sortedDisplayUsers = useMemo(() => {
    let users = [...displayUsers];
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      users = users.filter(u => {
        const fullName = `${u.title || ""} ${u.lastName || ""}`.toLowerCase();
        return fullName.includes(q);
      });
    }

    if (sortBy === "match") {
       users.sort((a, b) => {
          const getScore = (u: any) => {
            if (!(user as any)?.profile || !u.profile) return 0;
            let score = 55;
            const up = (user as any).profile as any;
            const p = u.profile as any;
            if (up.religion === p.religion) score += 15;
            if (up.maritalStatus === p.maritalStatus) score += 10;
            if (up.state === p.state) score += 8;
            if (up.education === p.education) score += 5;
            return score;
          };
          return getScore(b) - getScore(a);
       });
    } else if (sortBy === "new") {
       users.sort((a, b) => (b.id || "").localeCompare(a.id || ""));
    } else {
       // recent
       if (activeTab === "Shortlisted by Me") {
         users.sort((a, b) => shortlistedIds.indexOf(b.id!) - shortlistedIds.indexOf(a.id!));
       }
    }
    return users;
  }, [displayUsers, sortBy, user, shortlistedIds, activeTab, searchQuery]);

  if (isPending) return <LoadingPage />;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50/50 dark:bg-zinc-950">
      
      {/* Static Header Section */}
      <div className="w-full px-4 pt-4 pb-2 shrink-0 z-30 relative bg-gray-50/50 dark:bg-zinc-950 border-b border-transparent">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4 relative justify-center">
          
          {/* Left: Heading & Desktop Sort */}
          <div className="hidden md:flex w-full md:w-auto md:absolute md:left-0 z-0 flex-row items-center gap-3 text-center md:text-left">
            <h1 className="text-xl md:text-[22px] font-extrabold text-gray-900 dark:text-white flex items-center gap-2 justify-center md:justify-start">
              <Star className="w-6 h-6 md:w-7 md:h-7 stroke-[#E51E44] fill-none stroke-[2.5px]" />
              My Shortlist
            </h1>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto h-auto p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm focus:ring-0 flex items-center justify-center [&>svg:last-child]:hidden">
                <Filter className="w-[18px] h-[18px] text-gray-500 dark:text-gray-400 shrink-0" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent" className="text-[12px] font-bold">Recent</SelectItem>
                <SelectItem value="match" className="text-[12px] font-bold">Match Score</SelectItem>
                <SelectItem value="new" className="text-[12px] font-bold">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Center: Tabs */}
          <div className="flex bg-gray-100/80 dark:bg-zinc-800/80 p-1 rounded-xl w-full md:w-auto shrink-0 shadow-inner z-10 relative">
            <button
              onClick={() => setActiveTab("Shortlisted by Me")}
              className={`flex-1 md:flex-none text-center px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "Shortlisted by Me"
                ? "bg-white dark:bg-zinc-900 text-[#E51E44] shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Shortlisted by Me
            </button>
            <button
              onClick={() => setActiveTab("Shortlisted Me")}
              className={`flex-1 md:flex-none text-center px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "Shortlisted Me"
                ? "bg-white dark:bg-zinc-900 text-[#E51E44] shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Shortlisted Me
            </button>
          </div>

          {/* Right: Search & Sort By */}
          <div className="w-full xl:hidden md:absolute md:right-0 md:w-[240px] z-10">
            <div className="flex gap-2 items-center w-full justify-between md:justify-end">
              <div className="relative flex-1 md:flex-none w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div className="flex items-center shrink-0 md:hidden">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-auto h-auto p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm focus:ring-0 flex items-center justify-center [&>svg:last-child]:hidden">
                    <Filter className="w-[18px] h-[18px] text-gray-500 dark:text-gray-400 shrink-0" />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent" className="text-[12px] font-bold">Recent</SelectItem>
                  <SelectItem value="match" className="text-[12px] font-bold">Match Score</SelectItem>
                  <SelectItem value="new" className="text-[12px] font-bold">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Scrolling Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 md:pb-6 flex flex-col items-center relative z-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        <div className="w-full max-w-6xl flex flex-col xl:flex-row items-start gap-6">
          
          {/* Main Column */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0 pt-2 w-full">

        {/* Content List */}
        {isCurrentTabLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[200px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs animate-pulse" />
            ))}
          </div>
        ) : sortedDisplayUsers.length === 0 ? (
          <motion.div 
            key={`empty-${activeTab}-${searchQuery ? "search" : "all"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800/80 shadow-sm min-h-[40vh]"
          >
            <div className="p-4 bg-rose-50 dark:bg-[#E51E44]/10 rounded-full mb-4">
              <Star className="w-8 h-8 text-[#E51E44]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery.trim() !== "" 
                ? "No matching profiles found"
                : activeTab === "Shortlisted by Me" 
                  ? "Your shortlist is empty" 
                  : "No one has shortlisted you yet"}
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
              {searchQuery.trim() !== ""
                ? "We couldn't find anyone matching your search query. Try a different name."
                : activeTab === "Shortlisted by Me" 
                  ? "You haven't saved any profiles yet. Go to your matches and click the Shortlist button to save profiles you like."
                  : "Keep your profile updated and send interests to get noticed by more matches!"}
            </p>
            {activeTab === "Shortlisted by Me" && searchQuery.trim() === "" && (
              <Button 
                onClick={() => router.push('/users/matching')}
                className="bg-[#E51E44] hover:bg-[#C81A3C] text-white rounded-xl font-bold px-6"
              >
                Discover Matches
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
            {sortedDisplayUsers.slice(0, visibleCount).map((match, idx) => {
              const p = match.profile as any || {};
              const age = p.age || 27;
              const education = p.education || "B.Sc in CSE";
              const profession = p.profession || "Software Engineer";
              const height = p.height || "5'4\"";
              const religion = p.religion || "Muslim";
              const maritalStatus = p.maritalStatus || "Never Married";
              const dist = p.dist || "Dhaka";
              
              // Dynamic Match Percentage
              let matchScore = 0;
              if ((user as any)?.profile && p) {
                let score = 55;
                if (((user as any).profile as any).religion === p.religion) score += 15;
                if (((user as any).profile as any).maritalStatus === p.maritalStatus) score += 10;
                if (((user as any).profile as any).state === p.state) score += 8;
                if (((user as any).profile as any).education === p.education) score += 5;
                matchScore = Math.min(99, Math.max(55, score));
              } else {
                // Stable fallback if profile data is incomplete
                let hash = 0;
                for (let i = 0; i < (match.id || "").length; i++) hash = (match.id || "").charCodeAt(i) + ((hash << 5) - hash);
                matchScore = 80 + (Math.abs(hash) % 20);
              }

              const daysAgo = (idx * 2) + 1;
              const photoCount = 1 + (idx % 4);
              
              let statusObj = { text: "New", icon: Star, color: "text-blue-600", bg: "bg-blue-50" };
              if (match.isInterestSent && match.isInterestReceived) {
                statusObj = { text: "Mutual Interest", icon: Heart, color: "text-[#E51E44]", bg: "bg-rose-50" };
              } else if (match.isInterestSent) {
                statusObj = { text: "Interest Sent", icon: Send, color: "text-purple-600", bg: "bg-purple-50" };
              } else if (match.isInterestReceived) {
                statusObj = { text: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" };
              }

              return (
                <motion.div 
                  layout
                  key={match.id} 
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.25, layout: { duration: 0.25, ease: "easeInOut" } }}
                  className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-0 md:p-4 flex flex-col md:flex-row gap-0 md:gap-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden md:overflow-visible"
                >
                  {/* Mobile View */}
                  <div className="flex md:hidden items-center justify-between p-3 w-full gap-3">
                    {/* Mobile Left: Avatar */}
                    <div className="relative w-[52px] h-[52px] shrink-0" onClick={() => router.push(`/users/profile/${match.id}`)}>
                      <div className="relative w-full h-full rounded-full overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm cursor-pointer">
                        <Image
                          src={match.avatar || (match.gender === "MALE" ? "/groom.webp" : "/bride.webp")}
                          alt="avatar" fill className="object-cover"
                        />
                      </div>
                      {match.isGhotokOwned && (
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 via-emerald-600/80 to-transparent backdrop-blur-[2px] text-white text-[6px] font-bold py-0.5 px-1.5 rounded-sm z-10 pointer-events-none shadow-sm whitespace-nowrap">
                          Matchmaker
                        </div>
                      )}
                    </div>

                    {/* Mobile Middle: Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                      <div className="flex items-center gap-1.5 mb-0.5 cursor-pointer" onClick={() => router.push(`/users/profile/${match.id}`)}>
                        {idx < 2 && <span className="bg-rose-100 text-[#E51E44] text-[8px] font-bold px-1.5 py-0.5 rounded-sm shrink-0">NEW</span>}
                        <h1 className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                          {match.title} {match.lastName}
                        </h1>
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 truncate">{age ? `${age} Years, ` : ""}{dist}</span>
                      {(education || height) && (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                          {education && (
                            <div className="flex items-center gap-1 text-[9px] font-medium text-gray-500 truncate max-w-[120px]">
                              <GraduationCap className="w-2.5 h-2.5 shrink-0" /> {education}
                            </div>
                          )}
                          {height && (
                            <div className="flex items-center gap-1 text-[9px] font-medium text-gray-500 shrink-0">
                              <Ruler className="w-2.5 h-2.5 shrink-0" /> {height}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-400 mt-0.5">
                        <Clock className="w-2.5 h-2.5" /> {daysAgo} days ago
                      </div>
                    </div>

                    {/* Mobile Right: Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0 w-[100px]">
                      <Button variant="outline" size="sm" asChild className="h-7 px-2 text-[9px] font-bold text-[#E51E44] border-[#E51E44]/30 hover:bg-rose-50 rounded-md flex items-center justify-center gap-1 w-full">
                        <Link href={`/users/profile/${match.id}`}><Eye className="w-3 h-3" /> Profile</Link>
                      </Button>

                      {statusObj.text === 'Mutual Interest' ? (
                        <Button size="sm" onClick={() => router.push(`/users/chat?userId=${match.id}`)} className="h-7 px-2 text-[9px] font-bold bg-[#E51E44] hover:bg-[#C81A3C] text-white rounded-md shadow-sm flex items-center justify-center gap-1 w-full">
                          <MessageSquare className="w-3 h-3" /> Message
                        </Button>
                      ) : match.isInterestSent ? (
                        <Button disabled size="sm" className="h-7 px-2 text-[9px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-50 rounded-md flex items-center justify-center gap-1 w-full shrink-0 cursor-not-allowed">
                          <Send className="w-3 h-3" /> Sent
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleSendInterest(match.id!)} className="h-7 px-2 text-[9px] font-bold bg-[#E51E44] hover:bg-[#C81A3C] text-white rounded-md shadow-sm flex items-center justify-center gap-1 w-full">
                          <Heart className="w-3 h-3 fill-current" /> Interest
                        </Button>
                      )}

                      <Button variant="outline" size="sm" className="h-7 px-2 text-[9px] font-bold text-amber-600 border-amber-200 hover:bg-amber-50 rounded-md flex items-center justify-center gap-1 w-full">
                        <Bookmark className="w-3 h-3" /> Notes
                      </Button>
                    </div>
                  </div>

                  {/* Desktop View Wrapper */}
                  <div className="hidden md:flex flex-row gap-5 relative w-full">
                  
                  {/* Left: Image */}
                  <div className="relative w-[130px] h-[170px] shrink-0 rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={match.avatar || (match.gender === "MALE" ? "/groom.webp" : "/bride.webp")}
                      alt={match.lastName}
                      fill
                      className="object-cover object-top"
                    />
                    {/* Matchmaker Banner */}
                    {match.isGhotokOwned && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-emerald-600 via-emerald-600/80 to-transparent backdrop-blur-[2px] text-white text-[7px] md:text-[8px] font-bold py-0.5 px-1.5 rounded-sm shadow-sm">
                        Matchmaker
                      </div>
                    )}
                  </div>

                  {/* Middle: Details */}
                  <div className="flex flex-col flex-1 min-w-0 py-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white truncate">
                          {match.title} {match.lastName}, {age}
                        </h3>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                      </div>
                      
                      <div className="text-[13px] font-bold text-gray-700 dark:text-zinc-300 mb-3 truncate">
                        {profession} <span className="text-gray-300 mx-1">•</span> {education}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-bold text-gray-500 dark:text-zinc-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-gray-400" /> {height}
                        </div>
                        <span className="text-gray-300">|</span>
                        <span>{dist}</span>
                        <span className="text-gray-300">|</span>
                        <span>{religion}</span>
                        <span className="text-gray-300">|</span>
                        <span>{maritalStatus}</span>
                      </div>

                      <div className="flex items-center gap-6 text-[12px] font-bold mb-4">
                        <div className="flex items-center gap-1 text-[#E51E44]">
                          <Heart className="w-4 h-4 fill-[#E51E44]" /> {matchScore}% Match
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          Active {daysAgo === 1 ? 'today' : `${daysAgo} hours ago`}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex items-center gap-6 px-3 py-2 bg-amber-50/50 dark:bg-zinc-800/50 rounded-lg text-[11px] font-bold text-amber-700 dark:text-amber-500">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" /> {activeTab === "Shortlisted by Me" ? `Added to shortlist ${daysAgo} days ago` : `Shortlisted you ${daysAgo} days ago`}
                      </div>
                      <div 
                        className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setNoteText(privateNotes[match.id] || "");
                          setEditingNoteUser({
                            id: match.id,
                            name: `${(match as any).title || ""} ${match.lastName}`.trim()
                          });
                        }}
                      >
                        <Edit3 className="w-3.5 h-3.5 shrink-0" /> 
                        <span className="truncate">
                          {privateNotes[match.id] 
                            ? `${privateNotes[match.id].split(" ").slice(0, 3).join(" ")}${privateNotes[match.id].split(" ").length > 3 ? "..." : ""}`
                            : "Add a note"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col w-full md:w-[180px] shrink-0 justify-between gap-3">
                    <div className="flex items-center justify-between md:justify-end gap-2 w-full">
                      <div className={`flex items-center gap-1.5 ${statusObj.bg} ${statusObj.color} text-[10px] font-black px-2.5 py-1.5 rounded-full`}>
                        <statusObj.icon className={`w-3 h-3 ${statusObj.text === 'Mutual Interest' ? 'fill-current' : ''}`} />
                        {statusObj.text}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-gray-400">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {activeTab === "Shortlisted by Me" ? (
                            <DropdownMenuItem 
                              className="text-red-600 font-bold cursor-pointer flex items-center gap-2 whitespace-nowrap text-[12px]"
                              onClick={() => handleRemoveShortlist(match.id!)}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove from Shortlist
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="font-bold cursor-pointer flex items-center gap-2 whitespace-nowrap text-[12px]"
                              disabled={shortlistedIds.includes(match.id!)}
                              onClick={() => {
                                 const existing = JSON.parse(localStorage.getItem("shortlistedUsers") || "[]");
                                 if (!existing.includes(match.id)) {
                                   existing.push(match.id);
                                   localStorage.setItem("shortlistedUsers", JSON.stringify(existing));
                                   setShortlistedIds(existing);
                                   toast.success('Added to shortlist');
                                 } else {
                                   toast.error('Already in shortlist');
                                 }
                              }}
                            >
                              {shortlistedIds.includes(match.id!) ? (
                                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> <span className="text-emerald-600">Shortlisted</span></>
                              ) : (
                                <><Star className="w-3.5 h-3.5" /> Shortlist Back</>
                              )}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col gap-2 mt-auto">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/users/profile/${match.id}`)}
                        className="w-full rounded-xl h-9 text-[12px] font-bold text-[#E51E44] border-[#E51E44]/30 hover:bg-rose-50"
                      >
                        View Profile
                      </Button>
                      {statusObj.text === 'Mutual Interest' ? (
                        <Button
                          onClick={() => router.push(`/users/chat?userId=${match.id}`)}
                          className="w-full rounded-xl h-9 text-[12px] font-bold bg-[#E51E44] hover:bg-[#C81A3C] text-white flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message
                        </Button>
                      ) : (
                        <Button
                          disabled={match.isInterestSent}
                          onClick={() => handleSendInterest(match.id!)}
                          className={`w-full rounded-xl h-9 text-[12px] font-bold flex items-center justify-center gap-1.5 ${
                            match.isInterestSent 
                            ? "bg-purple-50 text-purple-600 hover:bg-purple-50 cursor-not-allowed" 
                            : "bg-[#E51E44] hover:bg-[#C81A3C] text-white"
                          }`}
                        >
                          {match.isInterestSent ? (
                            <><Send className="w-3.5 h-3.5" /> Interest Sent</>
                          ) : (
                            <><Heart className="w-3.5 h-3.5" /> Interest</>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full rounded-xl h-9 text-[12px] font-bold text-amber-600 border-amber-200 hover:bg-amber-50 flex items-center justify-center gap-1.5"
                        onClick={() => {
                          setNoteText(privateNotes[match.id] || "");
                          setEditingNoteUser({
                            id: match.id,
                            name: `${(match as any).title || ""} ${match.lastName}`.trim()
                          });
                        }}
                      >
                        <Bookmark className="w-3.5 h-3.5" /> 
                        {privateNotes[match.id] ? "Edit Note" : "Notes"}
                      </Button>
                    </div>
                  </div>
                  
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        )}

        {/* Edit Note Dialog */}
        <Dialog open={!!editingNoteUser} onOpenChange={(open) => !open && setEditingNoteUser(null)}>
          <DialogContent className="bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl w-[92vw] max-w-[300px] p-4 !top-[20%] !translate-y-0 sm:!top-[50%] sm:!translate-y-[-50%] sm:max-w-md sm:p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-gray-500" />
                Private Note
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                Add a private note about {editingNoteUser?.name}. Only you can see this.
              </DialogDescription>
            </DialogHeader>
            <div className="py-1">
              <Textarea
                placeholder="E.g., I shortlisted this user because..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[80px] sm:min-h-[120px] resize-none border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-[13px] font-medium rounded-xl p-3 focus-visible:ring-rose-500 focus-visible:border-rose-500 text-gray-900 dark:text-white"
              />
            </div>
            <DialogFooter className="mt-1 sm:space-x-2 flex flex-row justify-end gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => setEditingNoteUser(null)}
                className="flex-1 sm:flex-initial rounded-xl border-gray-200 dark:border-zinc-800 font-bold hover:bg-gray-50 dark:hover:bg-zinc-900 text-[12px] h-9"
                disabled={savingNote}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveNote}
                disabled={savingNote}
                className="flex-1 sm:flex-initial rounded-xl bg-[#E51E44] hover:bg-[#c9183b] text-white font-bold text-[12px] h-9 shadow-sm shadow-[#E51E44]/20"
              >
                {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Load More Button */}
        {!isLoading && displayUsers.length > visibleCount && (
          <div className="flex justify-center pt-4 pb-10">
            <Button 
              variant="outline" 
              onClick={() => setVisibleCount(prev => prev + 4)}
              className="rounded-xl border-[#E51E44]/30 text-[#E51E44] hover:bg-rose-50 font-bold px-8 flex items-center gap-2"
            >
              Load More Profiles <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}

        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:flex flex-col w-[250px] shrink-0 space-y-4 sticky top-0 h-fit max-h-[calc(100vh-120px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-6 pt-2">
          
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search profiles..."
              className="w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-xl pl-8 pr-3 py-2 text-[13px] focus:outline-none transition-all shadow-xs font-medium text-gray-900 dark:text-white"
            />
          </div>

          <ShortlistOverviewSidebar users={displayUsers} />
          <SmartTipsSidebar />
        </div>

        </div>
      </div>
      
      {/* --- WATERMARK SECTION (DELETE THIS TO REMOVE THE WATERMARK) --- */}
      <div className="fixed inset-0 z-[999999] pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] dark:opacity-5">
        <div className="transform -rotate-45 text-[75px] sm:text-[90px] md:text-[180px] font-black text-black dark:text-white whitespace-nowrap select-none">
          COMPLETED
        </div>
      </div>
    </div>
  );
}

function ShortlistOverviewSidebar({ users }: { users: AllUsers[] }) {
  let newCount = 0;
  let mutualCount = 0;
  let sentCount = 0;
  let pendingCount = 0;
  let acceptedCount = 0;

  users.forEach(match => {
    if (match.status === "ACCEPTED") {
      acceptedCount++;
    } else if (match.isInterestSent && match.isInterestReceived) {
      mutualCount++;
    } else if (match.isInterestSent) {
      sentCount++;
    } else if (match.isInterestReceived) {
      pendingCount++;
    } else {
      newCount++;
    }
  });

  return (
    <Card className="p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col gap-4">
      <h3 className="font-extrabold text-[15px] text-gray-900 dark:text-white">
        Shortlist Overview
      </h3>

      <div className="flex flex-col items-center justify-center mt-1">
        <div className="text-3xl font-black text-gray-900 dark:text-white leading-none">
          {users.length}
        </div>
        <div className="text-xs font-bold text-gray-500 mt-1">
          Total Shortlisted
        </div>
      </div>

      <div className="space-y-3 mt-2 border-t border-gray-50 dark:border-zinc-800/80 pt-4">
        {[
          { label: "New", count: newCount, dotColor: "bg-rose-500", bgColor: "bg-rose-50 dark:bg-rose-900/20", textColor: "text-rose-700 dark:text-rose-400" },
          { label: "Mutual Interest", count: mutualCount, dotColor: "bg-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", textColor: "text-emerald-700 dark:text-emerald-400" },
          { label: "Interest Sent", count: sentCount, dotColor: "bg-purple-500", bgColor: "bg-purple-50 dark:bg-purple-900/20", textColor: "text-purple-700 dark:text-purple-400" },
          { label: "Pending", count: pendingCount, dotColor: "bg-amber-500", bgColor: "bg-amber-50 dark:bg-amber-900/20", textColor: "text-amber-700 dark:text-amber-400" },
          { label: "Accepted", count: acceptedCount, dotColor: "bg-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-900/20", textColor: "text-emerald-700 dark:text-emerald-400" },
        ].map((stat, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stat.dotColor}`} />
              <span className="text-[13px] font-bold text-gray-700 dark:text-zinc-300">{stat.label}</span>
            </div>
            <div className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${stat.bgColor} ${stat.textColor}`}>
              {stat.count}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SmartTipsSidebar() {
  return (
    <Card className="p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col gap-3">
      <h3 className="font-extrabold text-[14px] text-gray-900 dark:text-white flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500/20" /> Smart Tips
      </h3>
      
      <div className="flex flex-col gap-3">
        
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <Bookmark className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-[11px] font-bold text-gray-600 dark:text-zinc-400 leading-snug mt-0.5">
            Add notes to remember important things about them.
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
            <Heart className="w-3.5 h-3.5 text-[#E51E44]" />
          </div>
          <p className="text-[11px] font-bold text-gray-600 dark:text-zinc-400 leading-snug mt-0.5">
            Check mutual interests for better compatibility.
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <Send className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-[11px] font-bold text-gray-600 dark:text-zinc-400 leading-snug mt-0.5">
            Send interest to start a conversation.
          </p>
        </div>

      </div>
    </Card>
  );
}
