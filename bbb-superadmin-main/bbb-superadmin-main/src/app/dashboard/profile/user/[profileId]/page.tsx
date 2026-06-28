export const dynamic = "force-dynamic";

import { getUserById } from "@/action/users";
import { getProfileEditHistory } from "@/action/adminProfileEdit";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, Calendar, Hash, ShieldAlert, ShieldCheck, Users, Ruler, Book, Heart, MapPin, ExternalLink, Crown, BadgeCheck, Star, Copy, CheckCircle2, Clock, MessageSquare, BrainCircuit, UserCog, Check, Bell, PauseCircle, Trash2, Edit, Activity, Building2, UserX, ChevronDown } from "lucide-react";
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
        <div className="flex flex-col sm:flex-row items-center sm:items-start p-4 sm:p-5 gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 relative rounded-full overflow-hidden bg-muted border border-border">
            {data.avatar ? (
              <img src={data.avatar} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground/30">
                {data.firstName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Title & Badges Row */}
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-3">
              
              {/* Left: Title & Badges */}
              <div className="flex flex-col gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{fullName}</h1>
                
                <div className="flex flex-wrap items-center gap-2">
                  {data.type === "PAID" && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] sm:text-xs font-bold tracking-wide">
                      PAID
                    </span>
                  )}
                  
                  {data.blocked ? (
                    <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] sm:text-xs font-bold tracking-wide flex items-center gap-1">
                      <Ban className="w-3 h-3" /> Blocked
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] sm:text-xs font-bold tracking-wide flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Active
                    </span>
                  )}

                  {data.isProfileComplete && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] sm:text-xs font-bold tracking-wide">
                      Profile Complete
                    </span>
                  )}

                  {data.gender && (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-100 dark:bg-zinc-700 text-[10px] sm:text-xs font-bold tracking-wide uppercase">
                      {data.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Meta Row with Buttons */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(data.createdAt)}</span>
              </div>
              
              {data.planExpiryDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Expires {formatDate(data.planExpiryDate)}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Hash className="w-4 h-4" />
                <span>{data.publicId}</span>
              </div>

              {(data as any).password && (
                <div className="flex items-center gap-1.5 font-mono text-xs opacity-60">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{(data as any).password}</span>
                </div>
              )}

              {/* Mark & Edit Buttons - Now inside the gap-x-6 gap-y-3 row */}
              <div className="flex items-center gap-2">
                <MarkButtonClient className="h-8 px-3 text-xs" />
                <div className="[&>button]:h-8 [&>button]:px-3 [&>button]:text-xs">
                  <SidebarEditButtonClient />
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

        <details className={cn("bg-card flex flex-col gap-2 rounded-2xl border p-3 sm:gap-3 sm:p-4 md:gap-4 md:p-5 lg:col-span-2 group")} open>
          <summary className="p-1 text-lg font-semibold sm:p-2 md:p-3 cursor-pointer flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-4 flex-1 overflow-hidden mr-4">
              <span className="shrink-0">Images</span>
              <div className="flex items-center gap-2 group-open:hidden flex-1 overflow-x-auto no-scrollbar">
                {data.avatar && (
                  <img src={data.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shrink-0 border-2 border-gray-200 dark:border-neutral-700 shadow-sm" alt="avatar" />
                )}
                {data.profileImages?.map((img, i) => (
                  <img key={i} src={img.url} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shrink-0 border-2 border-gray-200 dark:border-neutral-700 shadow-sm" alt="image" />
                ))}
              </div>
            </div>
            <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 shrink-0" />
          </summary>
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
        </details>
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
      
      </div>
    </div>
  );
}
