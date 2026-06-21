export const dynamic = "force-dynamic";

import { getUserById } from "@/action/users";
import { getProfileEditHistory } from "@/action/adminProfileEdit";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, Calendar, Hash, ShieldAlert, ShieldCheck, Users, Ruler, Book, Heart, MapPin, ExternalLink, Crown, BadgeCheck, Star, Copy, CheckCircle2, Clock, MessageSquare, BrainCircuit, UserCog, Check, Bell, PauseCircle, Trash2, Edit, Activity, Building2, UserX } from "lucide-react";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import UserProfileClient, {
  CopyableComponent,
  FieldRowWithCopy,
} from "./userProfileClient";
import { cn } from "@/lib/utils";
import ImageViewClient from "./imageViewClient";
import ProfileCopyClient from "./profileCopyClient";
import MarkButtonClient from "./markButtonClient";
import SidebarEditButtonClient from "./sidebarEditButtonClient";
import UpdateProfileClient from "./updateProfileClient";
import { SectionHistory } from "./sectionHistoryClient";
import { Section, FieldRow } from "./profileGridComponents";

export default async function UserProfileId({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  await checkAuthAndGetSession(await headers());
  const { profileId } = await params;
  const data = await getUserById(profileId);
  const editHistory = data?.profile?.id
    ? await getProfileEditHistory(data.profile.id)
    : [];

  // Helper to get history for a specific section
  const historyFor = (sectionName: string) =>
    editHistory.filter((h) => h.sectionName === sectionName);

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-base">User not found</span>
      </div>
    );
  }

  const formatDate = (d?: string | Date | null) => {
    if (!d) return "—";
    try {
      const dt = typeof d === "string" ? new Date(d) : d;
      if (Number.isNaN(dt.getTime())) return "—";
      return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
        dt
      );
    } catch {
      return "—";
    }
  };

  const formatINR = (val?: number | string | null) => {
    if (val === null || val === undefined || val === "") return "—";
    const num = typeof val === "string" ? Number(val) : val;
    if (Number.isNaN(num)) return String(val);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const isEmpty = (v: unknown) =>
    v === null || v === undefined || (typeof v === "string" && v.trim() === "");

  // function Value({ children }: { children: React.ReactNode }) {
  //   return <span className="text-sm">{children ?? "—"}</span>;
  // }

  function Placeholder() {
    return <span className="text-muted-foreground italic">—</span>;
  }

  // Little status badge builder
  function StatusBadge({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <Badge className={`rounded-full px-2 py-0.5 ${className}`}>
        {children}
      </Badge>
    );
  }

  const fullName = `${data.title} ${data.firstName}${
    data.middleName ? ` ${data.middleName}` : ""
  } ${data.lastName}`.trim();

  // Collect missing/null/empty fields to surface to admins
  const missing: { label: string }[] = [];
  const addIfMissing = (label: string, v: unknown) => {
    if (isEmpty(v)) missing.push({ label });
  };

  const calculateCompletion = (p: any) => {
    if (!p) return 0;
    const fields = [
      data.firstName, data.lastName, data.gender, p.dob, p.maritalStatus, p.religion, p.caste,
      p.height, p.weight, p.education, p.profession, p.state, p.dist, p.aboutMyself,
      p.fatherProfession, p.mothersOccupation, p.noOfBrothers, p.noOfSisters
    ];
    const filled = fields.filter((f) => f !== null && f !== undefined && f !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  // Check key profile fields for empties
  const p = data.profile;
  addIfMissing("Alternate Phone", p?.alternatePhone);
  addIfMissing("WhatsApp Number", p?.whatsappNumber);
  addIfMissing("Height", p?.height);
  addIfMissing("Weight", p?.weight);
  addIfMissing("Skin Tone", p?.skinTone);
  addIfMissing("Body Type", p?.bodyType);
  addIfMissing("Hobbies", p?.hobbies);
  addIfMissing("Monthly Income", p?.monthlyIncome);
  addIfMissing("Primary Language", p?.language);
  addIfMissing("Family Members", p?.familyMembers);
  addIfMissing("Father's Profession", p?.fatherProfession);
  addIfMissing("Candidate Preference", p?.candidatePreference);
  addIfMissing("Location Preference", p?.locationPreference);
  addIfMissing("Address Line 2", p?.addressLine2);

  return (
    <div className="w-full flex flex-col xl:flex-row gap-4 lg:gap-6 pl-3 pr-1 py-4 sm:pl-6 sm:pr-4 sm:py-6">
      {/* Left Column (Main Content) */}
      <div className="flex-1 space-y-4 sm:space-y-6 min-w-0">
      {/* ================= HEADER ================= */}
      <Card className="rounded-2xl border shadow-sm bg-card text-card-foreground overflow-hidden mb-6">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Column - Media */}
          <div className="w-full lg:w-[160px] 2xl:w-[220px] p-5 border-b lg:border-b-0 lg:border-r border-border flex flex-col gap-3 shrink-0">
            <div className="w-full aspect-[4/5] relative rounded-xl overflow-hidden bg-muted border border-border">
              {data.avatar ? (
                <img src={data.avatar} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-muted-foreground/30">
                  {data.firstName?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            
            {data.profileImages && data.profileImages.length > 0 && (
              <div className="flex gap-2 mt-1">
                {data.profileImages.slice(0, 4).map((img: any, i: number) => (
                  <div key={i} className="aspect-square flex-1 relative rounded-lg overflow-hidden border border-border bg-muted">
                    <img src={img.url} className="w-full h-full object-cover" alt="Thumbnail" />
                  </div>
                ))}
              </div>
            )}
            
            <button className="w-full py-2 mt-1 text-[12px] font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
              View All Photos ({data.profileImages?.length ? data.profileImages.length + (data.avatar ? 1 : 0) : (data.avatar ? 1 : 0)})
            </button>
          </div>

          {/* Middle Column - Core Info */}
          <div className="flex-1 p-5 lg:p-6 flex flex-col min-w-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 h-full">
              <div className="flex flex-col h-full w-full">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl lg:text-2xl font-bold text-foreground truncate">{fullName}</h1>
                  {data.blocked ? (
                    <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                      <Ban className="w-3 h-3" /> Blocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400" /> Active
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-3">
                  <span className="font-medium">Profile ID:</span>
                  <span className="font-bold text-foreground">{data.publicId}</span>
                  <CopyableComponent copyText={data.publicId}>
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      <Copy className="w-3.5 h-3.5" />
                    </span>
                  </CopyableComponent>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {data.isProfileComplete && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                  {data.type === "PAID" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-bold border border-purple-100 dark:border-purple-800">
                      <Crown className="w-3.5 h-3.5" /> Premium
                    </span>
                  )}
                  {data.isGhotokOwned && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-bold border border-orange-100 dark:border-orange-800">
                      <Star className="w-3.5 h-3.5" /> Featured
                    </span>
                  )}
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 py-3 border-y border-border mb-3">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Age</span>
                    </div>
                    <span className="font-semibold text-[13px] text-foreground leading-tight">{p?.dob ? `${new Date().getFullYear() - new Date(p.dob).getFullYear()} Yrs` : "—"}</span>
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                      <Ruler className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Height</span>
                    </div>
                    <span className="font-semibold text-[13px] text-foreground leading-tight">{p?.height || "—"}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                      <Book className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Religion</span>
                    </div>
                    <span className="font-semibold text-[13px] text-foreground leading-tight">{p?.religion || "—"}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                      <Heart className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Marital</span>
                    </div>
                    <span className="font-semibold text-[13px] text-foreground leading-tight">{p?.maritalStatus || "—"}</span>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between mt-auto">
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Mother Tongue</span>
                      <span className="font-semibold text-[13px] text-foreground leading-tight">{p?.language || "—"}</span>
                    </div>
                    
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Location</span>
                      <span className="font-semibold text-[13px] text-foreground leading-tight line-clamp-1">
                        {p?.dist || p?.state ? [p?.dist, p?.state].filter(Boolean).join(", ") : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Profile Completion */}
                  <div className="flex flex-col gap-1.5 min-w-[150px]">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground font-medium uppercase tracking-wider">Profile Completion</span>
                      <span className="font-bold text-foreground">{calculateCompletion(p)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${calculateCompletion(p)}%` }} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column - Meta Details */}
          <div className="w-full lg:w-[240px] 2xl:w-[280px] p-5 lg:p-6 border-t lg:border-t-0 lg:border-l border-border bg-muted/30 flex flex-col shrink-0">
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Registration Date</span>
                <span className="text-sm font-semibold text-foreground">{formatDate(data.createdAt)}</span>
              </div>
              
              {(data as any).lastLogin && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Last Login</span>
                  <span className="text-sm font-semibold text-foreground">{formatDate((data as any).lastLogin)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Membership Plan</span>
                <span className="text-sm font-semibold text-foreground">{data.type === "PAID" ? "Premium" : "Free"}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Plan Expiry Date</span>
                <span className="text-sm font-semibold text-foreground">{data.planExpiryDate ? formatDate(data.planExpiryDate) : "—"}</span>
              </div>
              
              {(data as any).assignedMatchmaker && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Assigned Matchmaker</span>
                  <span className="text-sm font-semibold text-foreground">{(data as any).assignedMatchmaker}</span>
                </div>
              )}
              
              {(data as any).viewsCount !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Profile Views</span>
                  <span className="text-sm font-semibold text-foreground">{(data as any).viewsCount}</span>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <a href={`https://bibahobandhan.com/profile/${data.publicId}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-semibold text-sm rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors">
                View Public Profile <ExternalLink className="w-4 h-4" />
              </a>
              
              {/* Action Buttons for Superadmin */}
              <div className="flex gap-2 w-full mt-2 border-t border-border pt-4">
                <div className="flex-1">
                  <MarkButtonClient />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </Card>

      {/* ================= SECTIONS ================= */}
      <div className="flex flex-col gap-6">
        {/* CONTACT & LOCATION */}
        <Section
          title="Contact & Location"
          sectionName="Contact & Location"
          groupKeys={["phone", "email", "whatsappNumber", "alternatePhone", "country", "citizenship", "addressLine1", "addressLine2", "postOffice", "policeStation", "location", "pinCode", "ancestralOrigin", "relationshipWithBrideGroom"]}
          currentValues={{ whatsappNumber: p?.whatsappNumber, alternatePhone: p?.alternatePhone, country: p?.country, citizenship: p?.citizenship, addressLine1: p?.addressLine1, addressLine2: p?.addressLine2, postOffice: p?.postOffice, policeStation: p?.policeStation, dist: p?.dist, state: p?.state, pinCode: p?.pinCode, ancestralOrigin: p?.ancestralOrigin, relationshipWithBrideGroom: p?.relationshipWithBrideGroom }}
          history={historyFor("Contact & Location")}
        >
          <FieldRowWithCopy label="Phone" value={data.phone} copyText={data.phone} />
          {data.email?.endsWith("@example.com") || !data.email ? (
            <FieldRow label="Email" value={""} />
          ) : (
            <FieldRowWithCopy label="Email" value={data.email} copyText={data.email ?? ""} />
          )}
          <FieldRow label="WhatsApp" value={p?.whatsappNumber} copyKey="whatsappNumber" editKey="whatsappNumber" />
          <FieldRow label="Alternate Phone" value={p?.alternatePhone} copyKey="alternatePhone" editKey="alternatePhone" />
          <FieldRow label="Country" value={p?.country} copyKey="country" editKey="country" />
          <FieldRow label="Citizenship" value={p?.citizenship} copyKey="citizenship" editKey="citizenship" />
          <FieldRow label="Address Line 1" value={p?.addressLine1} copyKey="addressLine1" editKey="addressLine1" />
          <FieldRow label="Address Line 2" value={p?.addressLine2} copyKey="addressLine2" editKey="addressLine2" />
          <FieldRow label="Post Office" value={p?.postOffice} copyKey="postOffice" editKey="postOffice" />
          <FieldRow label="Police Station" value={p?.policeStation} copyKey="policeStation" editKey="policeStation" />
          <FieldRow label="District & State" value={`${p?.dist ?? ""}, ${p?.state ?? ""}`} copyKey="location" />
          <FieldRow label="PIN Code" value={p?.pinCode} copyKey="pinCode" editKey="pinCode" />
          <FieldRow label="Ancestral Origin" value={p?.ancestralOrigin} copyKey="ancestralOrigin" editKey="ancestralOrigin" />
          <FieldRow label="Relationship with Bride/Groom" value={p?.relationshipWithBrideGroom} copyKey="relationshipWithBrideGroom" editKey="relationshipWithBrideGroom" />
        </Section>

        {/* PERSONAL & ASTROLOGICAL */}
        <Section
          title="Personal & Astrological"
          sectionName="Personal & Astrological"
          groupKeys={["age", "gender", "maritalStatus", "children", "speciallyAble", "disabilityDetails", "healthScreening", "rashi", "nakshatra", "birthTime", "cityOfBirth", "countryOfBirth", "bloodGroup", "height", "weight", "skinTone", "bodyType", "eatingHabits", "drinkingHabits", "smokingHabits", "aboutMyself", "personalityTraits", "lifeGoals"]}
          currentValues={{ maritalStatus: p?.maritalStatus, disabilityDetails: p?.disabilityDetails, healthScreening: p?.healthScreening, rashi: p?.rashi, nakshatra: p?.nakshatra, birthTime: p?.birthTime, cityOfBirth: p?.cityOfBirth, countryOfBirth: p?.countryOfBirth, bloodGroup: p?.bloodGroup, height: p?.height, weight: p?.weight, skinTone: p?.skinTone, bodyType: p?.bodyType, eatingHabits: p?.eatingHabits, drinkingHabits: p?.drinkingHabits, smokingHabits: p?.smokingHabits, aboutMyself: p?.aboutMyself, personalityTraits: p?.personalityTraits, lifeGoals: p?.lifeGoals }}
          history={historyFor("Personal & Astrological")}
        >
          <FieldRow label="Gender" value={data.gender} copyKey="gender" />
          <FieldRow label="DOB / Age" value={`${formatDate(p?.dob)}`} copyKey="age" />
          <FieldRow label="Marital Status" value={p?.maritalStatus} copyKey="maritalStatus" editKey="maritalStatus" options={["Unmarried", "Married", "Divorced", "Widowed", "Separated"]} />
          <FieldRow label="Children" value={p?.children ? (p.children === 0 ? "No Children" : p.children) : <Placeholder />} copyKey="children" />
          <FieldRow label="Specially Able" value={p?.speciallyAble === undefined ? <Placeholder /> : p.speciallyAble ? "Yes" : "No"} copyKey="speciallyAble" />
          <FieldRow label="Disability Details" value={p?.disabilityDetails} copyKey="disabilityDetails" editKey="disabilityDetails" options={["None", "Physical", "Visual", "Hearing", "Other"]} />
          <FieldRow label="Health Screening" value={p?.healthScreening} copyKey="healthScreening" editKey="healthScreening" options={["No Issues", "Minor Issues", "Major Issues"]} />
          <FieldRow label="Rashi" value={p?.rashi} copyKey="rashi" editKey="rashi" />
          <FieldRow label="Nakshatra" value={p?.nakshatra} copyKey="nakshatra" editKey="nakshatra" />
          <FieldRow label="Birth Time" value={p?.birthTime} copyKey="birthTime" editKey="birthTime" />
          <FieldRow label="City of Birth" value={p?.cityOfBirth} copyKey="cityOfBirth" editKey="cityOfBirth" />
          <FieldRow label="Country of Birth" value={p?.countryOfBirth} copyKey="countryOfBirth" editKey="countryOfBirth" />
          <FieldRow label="Blood Group" value={p?.bloodGroup} copyKey="bloodGroup" editKey="bloodGroup" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Don't Know"]} />
          <FieldRow label="Height" value={p?.height} copyKey="height" editKey="height" options={["4ft 5in", "4ft 6in", "4ft 7in", "4ft 8in", "4ft 9in", "4ft 10in", "4ft 11in", "5ft 0in", "5ft 1in", "5ft 2in", "5ft 3in", "5ft 4in", "5ft 5in", "5ft 6in", "5ft 7in", "5ft 8in", "5ft 9in", "5ft 10in", "5ft 11in", "6ft 0in", "6ft 1in", "6ft 2in", "6ft 3in", "6ft 4in", "6ft 5in"]} />
          <FieldRow label="Weight" value={p?.weight} copyKey="weight" editKey="weight" />
          <FieldRow label="Skin Tone" value={p?.skinTone} copyKey="skinTone" editKey="skinTone" options={["Very Fair", "Fair", "Wheatish", "Dark"]} />
          <FieldRow label="Body Type" value={p?.bodyType} copyKey="bodyType" editKey="bodyType" options={["Slim", "Average", "Athletic", "Heavy"]} />
          <FieldRow label="Eating Habits" value={p?.eatingHabits} copyKey="eatingHabits" editKey="eatingHabits" options={["Vegetarian", "Non-Vegetarian", "Eggetarian"]} />
          <FieldRow label="Drinking Habits" value={p?.drinkingHabits} copyKey="drinkingHabits" editKey="drinkingHabits" options={["No", "Yes", "Occasionally"]} />
          <FieldRow label="Smoking Habits" value={p?.smokingHabits} copyKey="smokingHabits" editKey="smokingHabits" options={["No", "Yes", "Occasionally"]} />
          <FieldRow label="About Myself" value={p?.aboutMyself} copyKey="aboutMyself" editKey="aboutMyself" />
          <FieldRow label="Personality Traits" value={p?.personalityTraits} copyKey="personalityTraits" editKey="personalityTraits" />
          <FieldRow label="Life Goals" value={p?.lifeGoals} copyKey="lifeGoals" editKey="lifeGoals" />
        </Section>

        {/* RELIGION & COMMUNITY */}
        <Section
          title="Religion & Community"
          sectionName="Religion & Community"
          groupKeys={["religion", "caste", "subCaste", "gotra", "manglikDosh", "language"]}
          currentValues={{ religion: p?.religion, caste: p?.caste, subCaste: p?.subCaste, gotra: p?.gotra, language: p?.language }}
          history={historyFor("Religion & Community")}
        >
          <FieldRow label="Religion" value={p?.religion} copyKey="religion" editKey="religion" options={["Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Other"]} />
          <FieldRow label="Caste" value={p?.caste} copyKey="caste" editKey="caste" options={["Brahmin", "Kayastha", "Baidya", "Mahishya", "Namasudra", "Sadgop", "Tili", "Karmakar", "SC", "ST", "Other"]} />
          <FieldRow label="Sub-caste" value={p?.subCaste} copyKey="subCaste" editKey="subCaste" />
          <FieldRow label="Gotra" value={p?.gotra} copyKey="gotra" editKey="gotra" />
          <FieldRow label="Manglik" value={p?.manglikDosh ? "Yes" : "No"} copyKey="manglikDosh" />
          <FieldRow label="Language" value={p?.language} copyKey="language" editKey="language" />
        </Section>

        {/* EDUCATION & CAREER */}
        <Section
          title="Education & Career"
          sectionName="Education & Career"
          groupKeys={["education", "collegeInstitution", "fieldOfStudy", "passingYear", "employmentType", "profession", "occupationDetails", "designation", "workExperience", "organizationName", "companyName", "monthlyIncome", "hobbies"]}
          currentValues={{ education: p?.education, collegeInstitution: p?.collegeInstitution, fieldOfStudy: p?.fieldOfStudy, passingYear: p?.passingYear, employmentType: p?.employmentType, profession: p?.profession, occupationDetails: p?.occupationDetails, designation: p?.designation, workExperience: p?.workExperience, organizationName: p?.organizationName, companyName: p?.companyName, monthlyIncome: p?.monthlyIncome, hobbies: p?.hobbies }}
          history={historyFor("Education & Career")}
        >
          <FieldRow label="Education" value={p?.education} copyKey="education" editKey="education" />
          <FieldRow label="College / Institution" value={p?.collegeInstitution} copyKey="collegeInstitution" editKey="collegeInstitution" />
          <FieldRow label="Field of Study" value={p?.fieldOfStudy} copyKey="fieldOfStudy" editKey="fieldOfStudy" />
          <FieldRow label="Passing Year" value={p?.passingYear} copyKey="passingYear" editKey="passingYear" />
          <FieldRow label="Employment Type" value={p?.employmentType} copyKey="employmentType" editKey="employmentType" options={["Private Job", "Government / PSU", "Business", "Self Employed", "Not Working"]} />
          <FieldRow label="Profession" value={p?.profession} copyKey="profession" editKey="profession" />
          <FieldRow label="Occupation Details" value={p?.occupationDetails} copyKey="occupationDetails" editKey="occupationDetails" />
          <FieldRow label="Designation" value={p?.designation} copyKey="designation" editKey="designation" />
          <FieldRow label="Work Experience" value={p?.workExperience} copyKey="workExperience" editKey="workExperience" />
          <FieldRow label="Organization / Company" value={p?.organizationName} copyKey="organizationName" editKey="organizationName" />
          <FieldRow label="Company Name" value={p?.companyName} copyKey="companyName" editKey="companyName" />
          <FieldRow label="Monthly Income" value={formatINR(p?.monthlyIncome)} copyKey="monthlyIncome" editKey="monthlyIncome" options={["No Income", "Under ₹10,000", "₹10,000 - ₹25,000", "₹25,000 - ₹50,000", "₹50,000 - ₹1,00,000", "₹1,00,000+"]} />
          <FieldRow label="Hobbies" value={p?.hobbies} copyKey="hobbies" editKey="hobbies" />
        </Section>

        {/* FAMILY */}
        <Section
          title="Family Details"
          sectionName="Family Details"
          groupKeys={["fatherProfession", "mothersOccupation", "noOfBrothers", "brothersMarriedCount", "noOfSisters", "sistersMarriedCount", "myFamilyStatus", "familyType", "familyValues", "familyMembers", "familyDescription", "familyBackground", "culturalValues"]}
          currentValues={{ fatherProfession: p?.fatherProfession, mothersOccupation: p?.mothersOccupation, noOfBrothers: p?.noOfBrothers, brothersMarriedCount: p?.brothersMarriedCount, noOfSisters: p?.noOfSisters, sistersMarriedCount: p?.sistersMarriedCount, myFamilyStatus: p?.myFamilyStatus, familyType: p?.familyType, familyValues: p?.familyValues, familyMembers: p?.familyMembers, familyDescription: p?.familyDescription, familyBackground: p?.familyBackground, culturalValues: p?.culturalValues }}
          history={historyFor("Family Details")}
        >
          <FieldRow label="Father's Profession" value={p?.fatherProfession} copyKey="fatherProfession" editKey="fatherProfession" />
          <FieldRow label="Mother's Occupation" value={p?.mothersOccupation} copyKey="mothersOccupation" editKey="mothersOccupation" />
          <FieldRow label="No. of Brothers" value={p?.noOfBrothers} copyKey="noOfBrothers" editKey="noOfBrothers" options={["0", "1", "2", "3", "4", "5+"]} />
          <FieldRow label="Brothers Married" value={p?.brothersMarriedCount} copyKey="brothersMarriedCount" editKey="brothersMarriedCount" options={["0", "1", "2", "3", "4", "5+"]} />
          <FieldRow label="No. of Sisters" value={p?.noOfSisters} copyKey="noOfSisters" editKey="noOfSisters" options={["0", "1", "2", "3", "4", "5+"]} />
          <FieldRow label="Sisters Married" value={p?.sistersMarriedCount} copyKey="sistersMarriedCount" editKey="sistersMarriedCount" options={["0", "1", "2", "3", "4", "5+"]} />
          <FieldRow label="Family Status" value={p?.myFamilyStatus} copyKey="myFamilyStatus" editKey="myFamilyStatus" options={["Middle Class", "Upper Middle Class", "Rich", "Affluent"]} />
          <FieldRow label="Family Type" value={p?.familyType} copyKey="familyType" editKey="familyType" options={["Nuclear", "Joint", "Extended"]} />
          <FieldRow label="Family Values" value={p?.familyValues} copyKey="familyValues" editKey="familyValues" options={["Orthodox", "Traditional", "Moderate", "Liberal"]} />
          <FieldRow label="Family Members" value={p?.familyMembers} copyKey="familyMembers" editKey="familyMembers" />
          <FieldRow label="Family Description" value={p?.familyDescription} copyKey="familyDescription" editKey="familyDescription" />
          <FieldRow label="Family Background" value={p?.familyBackground} copyKey="familyBackground" editKey="familyBackground" />
          <FieldRow label="Cultural Values" value={p?.culturalValues} copyKey="culturalValues" editKey="culturalValues" />
        </Section>

        {/* PARTNER PREFERENCES */}
        <Section
          title="Partner Preferences"
          sectionName="Partner Preferences"
          groupKeys={["partnerAgeRange", "partnerHeightRange", "partnerWeightRange", "partnerMaritalStatus", "partnerSpokenLanguages", "partnerReligion", "partnerCaste", "partnerSubCaste", "partnerGothra", "partnerPreferredCountry", "partnerPreferredState", "partnerPreferredDistrict", "partnerEducation", "partnerEmploymentType", "partnerProfession", "partnerIncome", "partnerLocation", "partnerDiet", "partnerDrinkingHabit", "partnerSmokingHabit", "partnerComplexion", "partnerMotherTongue", "partnerDisabilityAcceptable", "partnerDescription", "partnerPersonalityExpectation", "partnerFamilyExpectation", "partnerFamilyDetails", "familyStatusPreference", "familyTypePreference", "familyValuesPreference", "candidatePreference", "locationPreference", "maritalPreference"]}
          currentValues={{ partnerAgeRange: p?.partnerAgeRange, partnerHeightRange: p?.partnerHeightRange, partnerWeightRange: p?.partnerWeightRange, partnerMaritalStatus: p?.partnerMaritalStatus, partnerSpokenLanguages: p?.partnerSpokenLanguages, partnerReligion: p?.partnerReligion, partnerCaste: p?.partnerCaste, partnerSubCaste: p?.partnerSubCaste, partnerGothra: p?.partnerGothra, partnerPreferredCountry: p?.partnerPreferredCountry, partnerPreferredState: p?.partnerPreferredState, partnerPreferredDistrict: p?.partnerPreferredDistrict, partnerEducation: p?.partnerEducation, partnerEmploymentType: p?.partnerEmploymentType, partnerProfession: p?.partnerProfession, partnerIncome: p?.partnerIncome, partnerLocation: p?.partnerLocation, partnerDiet: p?.partnerDiet, partnerDrinkingHabit: p?.partnerDrinkingHabit, partnerSmokingHabit: p?.partnerSmokingHabit, partnerComplexion: p?.partnerComplexion, partnerMotherTongue: p?.partnerMotherTongue, partnerDisabilityAcceptable: p?.partnerDisabilityAcceptable, partnerDescription: p?.partnerDescription, partnerPersonalityExpectation: p?.partnerPersonalityExpectation, partnerFamilyExpectation: p?.partnerFamilyExpectation, partnerFamilyDetails: p?.partnerFamilyDetails, familyStatusPreference: p?.familyStatusPreference, familyTypePreference: p?.familyTypePreference, familyValuesPreference: p?.familyValuesPreference, candidatePreference: p?.candidatePreference, locationPreference: p?.locationPreference, aboutMyPartner: p?.aboutMyPartner }}
          history={historyFor("Partner Preferences")}
        >
          <FieldRow label="Age Range" value={p?.partnerAgeRange} copyKey="partnerAgeRange" editKey="partnerAgeRange" />
          <FieldRow label="Height Range" value={p?.partnerHeightRange} copyKey="partnerHeightRange" editKey="partnerHeightRange" />
          <FieldRow label="Weight Range" value={p?.partnerWeightRange} copyKey="partnerWeightRange" editKey="partnerWeightRange" />
          <FieldRow label="Marital Status" value={p?.partnerMaritalStatus} copyKey="partnerMaritalStatus" editKey="partnerMaritalStatus" options={["Unmarried", "Divorced", "Widowed", "Separated", "Any"]} />
          <FieldRow label="Spoken Languages" value={p?.partnerSpokenLanguages} copyKey="partnerSpokenLanguages" editKey="partnerSpokenLanguages" />
          <FieldRow label="Religion" value={p?.partnerReligion} copyKey="partnerReligion" editKey="partnerReligion" options={["Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Other", "Any"]} />
          <FieldRow label="Caste" value={p?.partnerCaste} copyKey="partnerCaste" editKey="partnerCaste" />
          <FieldRow label="Sub-Caste" value={p?.partnerSubCaste} copyKey="partnerSubCaste" editKey="partnerSubCaste" />
          <FieldRow label="Gothra" value={p?.partnerGothra} copyKey="partnerGothra" editKey="partnerGothra" />
          <FieldRow label="Preferred Country" value={p?.partnerPreferredCountry} copyKey="partnerPreferredCountry" editKey="partnerPreferredCountry" />
          <FieldRow label="Preferred State" value={p?.partnerPreferredState} copyKey="partnerPreferredState" editKey="partnerPreferredState" />
          <FieldRow label="Preferred District" value={p?.partnerPreferredDistrict} copyKey="partnerPreferredDistrict" editKey="partnerPreferredDistrict" />
          <FieldRow label="Education" value={p?.partnerEducation} copyKey="partnerEducation" editKey="partnerEducation" />
          <FieldRow label="Employment Type" value={p?.partnerEmploymentType} copyKey="partnerEmploymentType" editKey="partnerEmploymentType" options={["Private Job", "Government / PSU", "Business", "Self Employed", "Not Working", "Any"]} />
          <FieldRow label="Profession" value={p?.partnerProfession} copyKey="partnerProfession" editKey="partnerProfession" />
          <FieldRow label="Income" value={p?.partnerIncome} copyKey="partnerIncome" editKey="partnerIncome" />
          <FieldRow label="Location" value={p?.partnerLocation} copyKey="partnerLocation" editKey="partnerLocation" />
          <FieldRow label="Diet" value={p?.partnerDiet} copyKey="partnerDiet" editKey="partnerDiet" options={["Vegetarian", "Non-Vegetarian", "Eggetarian", "Any"]} />
          <FieldRow label="Drinking Habit" value={p?.partnerDrinkingHabit} copyKey="partnerDrinkingHabit" editKey="partnerDrinkingHabit" options={["No", "Yes", "Occasionally", "Any"]} />
          <FieldRow label="Smoking Habit" value={p?.partnerSmokingHabit} copyKey="partnerSmokingHabit" editKey="partnerSmokingHabit" options={["No", "Yes", "Occasionally", "Any"]} />
          <FieldRow label="Complexion" value={p?.partnerComplexion} copyKey="partnerComplexion" editKey="partnerComplexion" options={["Very Fair", "Fair", "Wheatish", "Dark", "Any"]} />
          <FieldRow label="Mother Tongue" value={p?.partnerMotherTongue} copyKey="partnerMotherTongue" editKey="partnerMotherTongue" />
          <FieldRow label="Disability Acceptable" value={p?.partnerDisabilityAcceptable} copyKey="partnerDisabilityAcceptable" editKey="partnerDisabilityAcceptable" options={["Yes", "No", "Does not matter"]} />
          <FieldRow label="Description" value={p?.partnerDescription} copyKey="partnerDescription" editKey="partnerDescription" />
          <FieldRow label="Personality Expectation" value={p?.partnerPersonalityExpectation} copyKey="partnerPersonalityExpectation" editKey="partnerPersonalityExpectation" />
          <FieldRow label="Family Expectation" value={p?.partnerFamilyExpectation} copyKey="partnerFamilyExpectation" editKey="partnerFamilyExpectation" />
          <FieldRow label="Family Details" value={p?.partnerFamilyDetails} copyKey="partnerFamilyDetails" editKey="partnerFamilyDetails" />
          <FieldRow label="Family Status Preference" value={p?.familyStatusPreference} copyKey="familyStatusPreference" editKey="familyStatusPreference" options={["Middle Class", "Upper Middle Class", "Rich", "Affluent", "Any"]} />
          <FieldRow label="Family Type Preference" value={p?.familyTypePreference} copyKey="familyTypePreference" editKey="familyTypePreference" options={["Nuclear", "Joint", "Extended", "Any"]} />
          <FieldRow label="Family Values Preference" value={p?.familyValuesPreference} copyKey="familyValuesPreference" editKey="familyValuesPreference" options={["Orthodox", "Traditional", "Moderate", "Liberal", "Any"]} />
          <FieldRow label="Candidate Preference" value={p?.candidatePreference} copyKey="candidatePreference" editKey="candidatePreference" />
          <FieldRow label="Location Preference" value={p?.locationPreference} copyKey="locationPreference" editKey="locationPreference" />
          <FieldRow label="About My Partner" value={p?.aboutMyPartner} copyKey="maritalPreference" editKey="aboutMyPartner" />
        </Section>

        {/* ADMIN FLAGS */}
        <Section title="Admin Flags">
          <FieldRow label="Profile Visibility" value={data.isProfilePublic ? "Public" : "Private"} />
          <FieldRow label="Ghotok Owned" value={data.isGhotokOwned ? "Yes" : "No"} />
          <FieldRow label="Social Publish" value={data.allowSocialPublish ? "Yes" : "No"} />
        </Section>

        <div className={cn("bg-card flex flex-col gap-2 rounded-2xl border p-3 sm:gap-3 sm:p-4 md:gap-4 md:p-5 lg:col-span-2")}>
          <h1 className="p-1 text-lg font-semibold sm:p-2 md:p-3">Images</h1>
          <div className="grid grid-cols-1 gap-3">
            {data.profileImages.length === 0 && !data.avatar ? (
              <p className="text-muted-foreground text-sm">No images ☹️</p>
            ) : (
              <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <ImageViewClient key={data.id} id={data.id} image={data.avatar || ""} canDelete={false} />
                {data.profileImages.map((image, i) => (
                  <ImageViewClient key={i} id={image.id} image={image.url} canDelete={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MISSING FIELDS ================= */}
      <Card className="rounded-2xl border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Missing / Null Fields</CardTitle>
        </CardHeader>
        <CardContent>
          {missing.length === 0 ? (
            <p className="text-muted-foreground text-sm">No empty fields 🎉</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missing.map((m, i) => (
                <Badge key={i} variant="secondary" className="rounded-full">
                  {m.label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UserProfileClient userId={profileId} blockStatus={data?.blocked} />

      <ProfileCopyClient user={data} allowSocialPublish={data.allowSocialPublish} />

      {/* Floating save button — shows when a section is being edited */}
      <UpdateProfileClient profileId={p?.id ?? ""} />
      
      </div> {/* End Left Column */}

      {/* Right Column (Sidebar) */}
      <div className="w-full xl:w-[260px] 2xl:w-[320px] shrink-0 space-y-6 xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Top Buttons */}
        <div className="flex flex-col gap-3">
          <SidebarEditButtonClient />
        </div>

        {/* Verification Center */}
        <Card className="rounded-2xl border shadow-sm bg-card text-card-foreground overflow-hidden">
          <CardHeader className="pb-3 border-b border-border bg-muted/20">
            <CardTitle className="text-[15px] flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck className="w-5 h-5 text-indigo-500" /> Verification Center
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5 pt-4">
            <div className="flex justify-between items-center text-sm font-medium text-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mobile Verified
              </div>
              <span className="text-muted-foreground">{data.phone ? "Verified" : "Pending"}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium text-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Email Verified
              </div>
              <span className="text-muted-foreground">{data.email ? "Verified" : "Pending"}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium text-foreground">
              <div className="flex items-center gap-2">
                {data.avatar ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-orange-500" />} Photo Verified
              </div>
              <span className={data.avatar ? "text-muted-foreground" : "text-orange-500 font-semibold"}>{data.avatar ? "Verified" : "Pending"}</span>
            </div>
            {(data as any).isAadhaarVerified !== undefined && (
              <div className="flex justify-between items-center text-sm font-medium text-foreground">
                <div className="flex items-center gap-2">
                  {(data as any).isAadhaarVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-orange-500" />} Aadhaar Verified
                </div>
                <span className={(data as any).isAadhaarVerified ? "text-muted-foreground" : "text-orange-500 font-semibold"}>{(data as any).isAadhaarVerified ? "Verified" : "Pending"}</span>
              </div>
            )}
            {(data as any).isPanVerified !== undefined && (
              <div className="flex justify-between items-center text-sm font-medium text-foreground">
                <div className="flex items-center gap-2">
                  {(data as any).isPanVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-orange-500" />} PAN Verified
                </div>
                <span className={(data as any).isPanVerified ? "text-muted-foreground" : "text-orange-500 font-semibold"}>{(data as any).isPanVerified ? "Verified" : "Pending"}</span>
              </div>
            )}
            {(data as any).isAddressVerified !== undefined && (
              <div className="flex justify-between items-center text-sm font-medium text-foreground">
                <div className="flex items-center gap-2">
                  {(data as any).isAddressVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-orange-500" />} Address Verified
                </div>
                <span className={(data as any).isAddressVerified ? "text-muted-foreground" : "text-orange-500 font-semibold"}>{(data as any).isAddressVerified ? "Verified" : "Pending"}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Intelligence (Dynamic) */}
        {(data as any).profileQualityScore !== undefined && (
          <Card className="rounded-2xl border shadow-sm bg-card text-card-foreground overflow-hidden">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between bg-muted/20">
              <CardTitle className="text-[15px] flex items-center gap-2 font-bold text-foreground">
                <BrainCircuit className="w-5 h-5 text-indigo-500" /> AI Intelligence
              </CardTitle>
              <span className="text-xs text-muted-foreground font-medium">Updated: Today</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Profile Quality Score</span>
                <span className="text-emerald-600 font-bold">{(data as any).profileQualityScore}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Trust Score</span>
                <span className="text-emerald-600 font-bold">{(data as any).trustScore || '94'}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Risk Score</span>
                <span className="text-emerald-600 font-bold">{(data as any).riskScore || '06'}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Engagement Score</span>
                <span className="text-emerald-600 font-bold">High</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Marriage Readiness</span>
                <span className="text-emerald-600 font-bold">High</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Premium Upgrade Chance</span>
                <span className="text-emerald-600 font-bold">{(data as any).premiumUpgradeChance || '78'}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Matchmaker (Dynamic) */}
        {(data as any).assignedMatchmaker && (
          <Card className="rounded-2xl border shadow-sm bg-card text-card-foreground overflow-hidden">
            <CardHeader className="pb-3 border-b border-border bg-muted/20">
              <CardTitle className="text-[15px] flex items-center gap-2 font-bold text-foreground">
                <UserCog className="w-5 h-5 text-indigo-500" /> Assigned Matchmaker
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                  <img src="https://ui-avatars.com/api/?name=Match+Maker&background=random" alt="Matchmaker" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-foreground text-sm">{(data as any).assignedMatchmaker}</span>
                  <span className="text-xs text-muted-foreground font-medium">Support Team</span>
                  <div className="text-xs mt-1">
                    <span className="text-muted-foreground">Success Rate: </span><span className="text-emerald-600 font-bold">92%</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Total Matches: </span><span className="font-bold text-foreground">245</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-2 bg-transparent text-indigo-600 dark:text-indigo-400 font-semibold text-sm rounded-lg border border-indigo-200 dark:border-indigo-800/50 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                View Matchmaker Profile
              </button>
            </CardContent>
          </Card>
        )}

        {/* Action Menus */}
        <Card className="rounded-2xl border shadow-sm bg-card text-card-foreground overflow-hidden">
          <CardHeader className="pb-3 border-b border-border bg-muted/20">
            <CardTitle className="text-[15px] flex items-center gap-2 font-bold text-foreground">
              <Activity className="w-5 h-5 text-indigo-500" /> Action Menus
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-4">
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs rounded border border-emerald-200 dark:border-emerald-800 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Profile
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 px-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold text-xs rounded border border-blue-200 dark:border-blue-800 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/40">
                <ShieldCheck className="w-3.5 h-3.5" /> Verify Profile
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 px-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-semibold text-xs rounded border border-indigo-200 dark:border-indigo-800 transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/40">
                <Users className="w-3.5 h-3.5" /> Assign Matchmaker
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 px-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-semibold text-xs rounded border border-orange-200 dark:border-orange-800 transition-colors hover:bg-orange-100 dark:hover:bg-orange-900/40">
                <Bell className="w-3.5 h-3.5" /> Send Notification
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 px-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold text-xs rounded border border-red-200 dark:border-red-800 transition-colors hover:bg-red-100 dark:hover:bg-red-900/40">
                <PauseCircle className="w-3.5 h-3.5" /> Suspend Profile
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 px-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold text-xs rounded border border-red-200 dark:border-red-800 transition-colors hover:bg-red-100 dark:hover:bg-red-900/40">
                <Ban className="w-3.5 h-3.5" /> Block Profile
              </button>
            </div>
            <button className="w-full flex items-center justify-center gap-1.5 mt-1 py-2 px-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold text-xs rounded border border-red-200 dark:border-red-800 transition-colors hover:bg-red-100 dark:hover:bg-red-900/40">
              <Trash2 className="w-3.5 h-3.5" /> Delete Profile
            </button>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}
