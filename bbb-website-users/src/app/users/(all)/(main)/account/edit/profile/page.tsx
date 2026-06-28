"use client";

import { UserType } from "@/components/enum/userType";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import LoadingPage from "@/components/loader";
import { LoadingButton } from "@/components/loadingButton";
import ApiErrorPage from "@/components/apiErrorPage";
import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { fetchSelfProfileDetails } from "@/actions/users";
import toast from "react-hot-toast";
import api from "@/lib/axiosInstance";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import { useAuthSession } from "@/hooks/useAuthSession";

import { updateProfileSchema } from "@/schema/updateProfileSchema";

import { Step1BasicEdit } from "./components/Step1BasicEdit";
import { Step2CareerEdit } from "./components/Step2CareerEdit";
import { Step3ReligionEdit } from "./components/Step3ReligionEdit";
import { Step4PhysicalEdit } from "./components/Step4PhysicalEdit";
import { Step5FamilyEdit } from "./components/Step5FamilyEdit";
import { Step6PartnerBasicEdit } from "./components/Step6PartnerBasicEdit";
import { Step7PartnerAdvancedEdit } from "./components/Step7PartnerAdvancedEdit";

export default function ProfileEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, user, isPending } = useAuthSession();
  const hasResetRef = useRef(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'basic-info': true,
    'career-education': false,
    'religion-background': false,
    'physical-attributes': false,
    'family-details': false,
    'partner-basic': false,
    'partner-advanced': false,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const role = user?.type as UserType;

  const { data, isLoading, error } = useQuery({
    queryKey: ["self-profile"],
    queryFn: () => fetchSelfProfileDetails(),
    staleTime: 1000 * 60 * 5,
    enabled: !!session,
  });

  const form = useForm<any>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      motherTongue: "",
      spokenLanguages: "",
      childrenLivingWith: "",
      emailId: "",
      phoneNumber: "",
      relationshipWithBrideGroom: "",
      employmentType: "",
      occupationDetails: "",
      designation: "",
      companyName: "",
      passingYear: "",
      familyType: "",
      familyStatus: "",
      familyValues: "",
      fathersOccupation: "",
      mothersOccupation: "",
      noOfBrothers: "",
      noOfMarriedBrothers: "",
      noOfSisters: "",
      noOfMarriedSisters: "",
      familyLocation: "",
      partnerAgeRange: "",
      partnerHeightRange: "",
      partnerMaritalStatus: "",
      partnerChildren: "",
      partnerReligion: "",
      partnerCaste: "",
      partnerMotherTongue: "",
      partnerManglik: "",
      partnerEducation: "",
      partnerProfession: "",
      partnerIncome: "",
      partnerLocation: "",
      partnerDiet: "",
      partnerComplexion: "",
      partnerBodyType: "",
      partnerFamilyValues: "",
      partnerFamilyType: "",

      // Add existing defaults
      dob: "",
      maritalStatus: "",
      bloodGroup: "",
      children: 0,
      speciallyAble: false,
      religion: "",
      gotra: "",
      caste: "",
      subCaste: "",
      manglik: false,
      height: "",
      weight: "",
      skinTone: "",
      bodyType: "",
      eatingHabits: "",
      drinkingHabits: "",
      smokingHabits: "",
      addressLine1: "",
      addressLine2: "",
      dist: "",
      state: "",
      pinCode: "",
      whatsappNumber: "",
      alternatePhone: "",
      aboutMyself: "",
      profession: "",
      education: "",
      hobbies: "",
      monthlyIncome: "",
      languages: "",
      familyMembers: "",
      fatherProfession: "",
      candidatePreferences: "",
      locationPreferences: "",
      aboutMyPartner: "",
      rashi: "",
      nakshatra: "",
      timeOfBirth: "",
      cityOfBirth: "",
      countryOfBirth: "",
      workExperience: "",
      collegeInstitution: "",
      fieldOfStudy: "",
      organizationName: "",
    },
  });

  useEffect(() => {
    if (!data || hasResetRef.current) return;
    hasResetRef.current = true;

    // Use everything from data that matches
    const formData = {
      ...data,
      dob: data.dob ?? "",
      maritalStatus: data.maritalStatus ?? "",
      bloodGroup: data.bloodGroup ?? "",
      children: data.children ?? 0,
      speciallyAble: data.speciallyAble || false,
      religion: data.religion ?? "",
      gotra: data.gotra || "",
      caste: data.caste ?? "",
      subCaste: data.subCaste || "",
      manglik: data.manglikDosh || false,
      height: data.height || "",
      weight: data.weight || "",
      skinTone: data.skinTone ?? "",
      bodyType: data.bodyType ?? "",
      eatingHabits: data.eatingHabits || "",
      drinkingHabits: data.drinkingHabits || "",
      smokingHabits: data.smokingHabits || "",
      addressLine1: data.addressLine1 || "",
      addressLine2: data.addressLine2 || "",
      dist: data.dist || "",
      state: data.state || "",
      pinCode: data.pinCode || "",
      whatsappNumber: data.whatsappNumber || "",
      alternatePhone: data.alternatePhone || "",
      aboutMyself: data.aboutMyself || "",
      profession: data.profession || "",
      education: data.education || "",
      hobbies: data.hobbies || "",
      monthlyIncome: data.monthlyIncome ?? "",
      languages: data.language || "",
      familyMembers: data.familyMembers || "",
      fatherProfession: data.fatherProfession || "",
      candidatePreferences: data.candidatePreference || "",
      locationPreferences: data.locationPreference || "",
      aboutMyPartner: data.aboutMyPartner || "",
      rashi: data.rashi || "",
      nakshatra: data.nakshatra || "",
      timeOfBirth: data.birthTime || "",
      cityOfBirth: data.cityOfBirth || "",
      countryOfBirth: data.countryOfBirth || "",
      familyType: data.familyType || "",
      mothersOccupation: data.mothersOccupation || "",
      noOfBrothers: data.noOfBrothers || "",
      noOfSisters: data.noOfSisters || "",
      familyValues: data.familyValues || "",
      workExperience: data.workExperience || "",
      collegeInstitution: data.collegeInstitution || "",
      fieldOfStudy: data.fieldOfStudy || "",
      organizationName: data.organizationName || "",
      partnerAgeRange: data.partnerAgeRange || "",
      partnerHeightRange: data.partnerHeightRange || "",
      partnerMaritalStatus: data.partnerMaritalStatus || "",
      partnerReligion: data.partnerReligion || "",
      partnerCaste: data.partnerCaste || "",
      partnerEducation: data.partnerEducation || "",
      partnerProfession: data.partnerProfession || "",
      partnerIncome: data.partnerIncome || "",
      partnerLocation: data.partnerLocation || "",
      partnerDiet: data.partnerDiet || "",
      partnerComplexion: data.partnerComplexion || "",
      partnerMotherTongue: data.partnerMotherTongue || "",
    };

    form.reset(formData);
    setDataLoaded(true);
  }, [data, form]);

  useEffect(() => {
    if (dataLoaded) {
      const section = searchParams.get("scrollTo");
      if (section) {
        setTimeout(() => {
          const element = document.getElementById(section);
          if (element) {
            const scrollContainer = document.querySelector('form.overflow-y-auto');
            if (scrollContainer) {
              const elementTop = element.getBoundingClientRect().top;
              const containerTop = scrollContainer.getBoundingClientRect().top;
              const currentScroll = scrollContainer.scrollTop;
              
              scrollContainer.scrollTo({
                top: currentScroll + elementTop - containerTop - 24,
                behavior: 'smooth'
              });
            } else {
              element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        }, 300);
      }
    }
  }, [dataLoaded, searchParams]);

  async function onSubmit(data: any) {
    setLoading(true);
    try {
      const response = await api.post<AxiosResponse<null>>(
        "/users/profile/update",
        data,
      );
      if (response.data.success) {
        toast.success("Profile updated successfully");
        router.back();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to update profile"
        : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const errorMessage = isAxiosError(error)
    ? error.response?.data.message
    : "Failed to fetch profile details";

  return (
    <div className="flex flex-col w-full min-h-full">
      {isLoading || isPending ? (
        <LoadingPage />
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <ApiErrorPage title={"Failed to load"} description={errorMessage} />
        </div>
      ) : (
        <div className="pb-10">
          <Form {...form} key={dataLoaded ? "loaded" : "loading"}>
            <form
              onSubmit={form.handleSubmit(onSubmit as any)}
              className="space-y-4 bg-card p-4 md:p-6 scroll-smooth border-2 border-primary/20 dark:border-primary/20 rounded-xl shadow-sm"
            >
              <div className="hidden md:flex items-center gap-3 border-b-2 border-primary/20 pb-4 mb-8">
                <div className="w-1 h-7 rounded-full bg-primary"></div>
                <h1 className="text-xl font-bold text-primary">
                  Personal Details
                </h1>
              </div>

              {/* Sections mapped from Step components */}
              <div id="basic-info" className="flex flex-col py-2 md:p-3 md:rounded-xl border-b md:border md:border-border md:bg-card md:hover:border-rose-300 dark:md:hover:border-rose-800 md:hover:shadow-sm transition-all group scroll-mt-6 mb-2 md:mb-4">
                <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('basic-info')}>
                  <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    
                    Basic Information
                  </h2>
                  <ChevronDown className={cn("w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-all duration-200", !openSections['basic-info'] && "-rotate-90")} />
                </div>
                <div className={cn("transition-all duration-300 overflow-hidden", openSections['basic-info'] ? "block opacity-100 mt-4" : "hidden opacity-0")}>
                  <Step1BasicEdit form={form} />
                </div>
              </div>

              <div id="career-education" className="flex flex-col py-2 md:p-3 md:rounded-xl border-b md:border md:border-border md:bg-card md:hover:border-rose-300 dark:md:hover:border-rose-800 md:hover:shadow-sm transition-all group scroll-mt-6 mb-2 md:mb-4">
                <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('career-education')}>
                  <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    
                    Education & Career
                  </h2>
                  <ChevronDown className={cn("w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-all duration-200", !openSections['career-education'] && "-rotate-90")} />
                </div>
                <div className={cn("transition-all duration-300 overflow-hidden", openSections['career-education'] ? "block opacity-100 mt-4" : "hidden opacity-0")}>
                  <Step2CareerEdit form={form} />
                </div>
              </div>

              <div id="religion-background" className="flex flex-col py-2 md:p-3 md:rounded-xl border-b md:border md:border-border md:bg-card md:hover:border-rose-300 dark:md:hover:border-rose-800 md:hover:shadow-sm transition-all group scroll-mt-6 mb-2 md:mb-4">
                <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('religion-background')}>
                  <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    
                    Religion & Astrology Details
                  </h2>
                  <ChevronDown className={cn("w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-all duration-200", !openSections['religion-background'] && "-rotate-90")} />
                </div>
                <div className={cn("transition-all duration-300 overflow-hidden", openSections['religion-background'] ? "block opacity-100 mt-4" : "hidden opacity-0")}>
                  <Step3ReligionEdit form={form} />
                </div>
              </div>

              <div id="physical-attributes" className="flex flex-col py-2 md:p-3 md:rounded-xl border-b md:border md:border-border md:bg-card md:hover:border-rose-300 dark:md:hover:border-rose-800 md:hover:shadow-sm transition-all group scroll-mt-6 mb-2 md:mb-4">
                <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('physical-attributes')}>
                  <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    
                    Physical Attributes & Lifestyle
                  </h2>
                  <ChevronDown className={cn("w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-all duration-200", !openSections['physical-attributes'] && "-rotate-90")} />
                </div>
                <div className={cn("transition-all duration-300 overflow-hidden", openSections['physical-attributes'] ? "block opacity-100 mt-4" : "hidden opacity-0")}>
                  <Step4PhysicalEdit form={form} />
                </div>
              </div>

              <div id="family-details" className="flex flex-col py-2 md:p-3 md:rounded-xl border-b md:border md:border-border md:bg-card md:hover:border-rose-300 dark:md:hover:border-rose-800 md:hover:shadow-sm transition-all group scroll-mt-6 mb-2 md:mb-4">
                <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('family-details')}>
                  <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    
                    Family Details
                  </h2>
                  <ChevronDown className={cn("w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-all duration-200", !openSections['family-details'] && "-rotate-90")} />
                </div>
                <div className={cn("transition-all duration-300 overflow-hidden", openSections['family-details'] ? "block opacity-100 mt-4" : "hidden opacity-0")}>
                  <Step5FamilyEdit form={form} />
                </div>
              </div>

              <div id="partner-basic" className="flex flex-col py-2 md:p-3 md:rounded-xl border-b md:border md:border-border md:bg-card md:hover:border-rose-300 dark:md:hover:border-rose-800 md:hover:shadow-sm transition-all group scroll-mt-6 mb-2 md:mb-4">
                <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('partner-basic')}>
                  <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    
                    Partner Preferences (Basic)
                  </h2>
                  <ChevronDown className={cn("w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-all duration-200", !openSections['partner-basic'] && "-rotate-90")} />
                </div>
                <div className={cn("transition-all duration-300 overflow-hidden", openSections['partner-basic'] ? "block opacity-100 mt-4" : "hidden opacity-0")}>
                  <Step6PartnerBasicEdit form={form} />
                </div>
              </div>

              <div id="partner-advanced" className="flex flex-col py-2 md:p-3 md:rounded-xl border-b md:border md:border-border md:bg-card md:hover:border-rose-300 dark:md:hover:border-rose-800 md:hover:shadow-sm transition-all group scroll-mt-6 mb-2 md:mb-4">
                <div className="flex items-center justify-between cursor-pointer mb-2" onClick={() => toggleSection('partner-advanced')}>
                  <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    
                    Partner Preferences (Advanced)
                  </h2>
                  <ChevronDown className={cn("w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-all duration-200", !openSections['partner-advanced'] && "-rotate-90")} />
                </div>
                <div className={cn("transition-all duration-300 overflow-hidden", openSections['partner-advanced'] ? "block opacity-100 mt-4" : "hidden opacity-0")}>
                  <Step7PartnerAdvancedEdit form={form} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-[120px]"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingButton title="Saving..." />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
