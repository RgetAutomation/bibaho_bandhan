"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/schema/updateProfileSchema";
import { useEffect, useState } from "react";
import api from "@/lib/axiosInstance";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingButton } from "@/components/loadingButton";
import { ProfileProps } from "@/actions/getProfileDetails";

import { Step0AboutMeEdit } from "@/app/users/(all)/(main)/account/edit/profile/components/Step0AboutMeEdit";
import { Step1BasicEdit } from "@/app/users/(all)/(main)/account/edit/profile/components/Step1BasicEdit";
import { Step2CareerEdit } from "@/app/users/(all)/(main)/account/edit/profile/components/Step2CareerEdit";
import { Step3ReligionEdit } from "@/app/users/(all)/(main)/account/edit/profile/components/Step3ReligionEdit";
import { Step4PhysicalEdit } from "@/app/users/(all)/(main)/account/edit/profile/components/Step4PhysicalEdit";
import { Step5FamilyEdit } from "@/app/users/(all)/(main)/account/edit/profile/components/Step5FamilyEdit";
import { Step6PartnerBasicEdit } from "@/app/users/(all)/(main)/account/edit/profile/components/Step6PartnerBasicEdit";
import { Step7PartnerAdvancedEdit } from "@/app/users/(all)/(main)/account/edit/profile/components/Step7PartnerAdvancedEdit";
import { AxiosResponse } from "@/components/interface/AxiosResponse";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string | null;
  data: ProfileProps;
}

export function ProfileEditModal({ isOpen, onClose, sectionId, data }: ProfileEditModalProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const getValidationSchema = () => {
    switch (sectionId) {
      case "about-me":
        return updateProfileSchema.pick({ aboutMyself: true });
      case "basic-info":
        return updateProfileSchema.pick({ firstName: true, middleName: true, lastName: true, dob: true, maritalStatus: true, children: true, speciallyAble: true, disabilityDetails: true, bloodGroup: true, motherTongue: true, spokenLanguages: true, whatsappNumber: true, alternatePhone: true });
      case "career-education":
        return updateProfileSchema.pick({ employmentType: true, profession: true, occupationDetails: true, designation: true, workExperience: true, organizationName: true, companyName: true, monthlyIncome: true, education: true, collegeInstitution: true, fieldOfStudy: true, passingYear: true });
      case "religion-background":
        return updateProfileSchema.pick({ religion: true, caste: true, subCaste: true, gotra: true, manglik: true, rashi: true, nakshatra: true, timeOfBirth: true, cityOfBirth: true, countryOfBirth: true, country: true, state: true, dist: true, addressLine1: true, citizenship: true, ancestralOrigin: true, pinCode: true });
      case "physical-attributes":
        return updateProfileSchema.pick({ height: true, weight: true, skinTone: true, bodyType: true, eatingHabits: true, drinkingHabits: true, smokingHabits: true, healthScreening: true, hobbies: true, personalityTraits: true, lifeGoals: true });
      case "family-details":
        return updateProfileSchema.pick({ myFamilyType: true, myFamilyStatus: true, myFamilyValues: true, fathersOccupation: true, mothersOccupation: true, noOfBrothers: true, brothersMarriedCount: true, noOfSisters: true, sistersMarriedCount: true, familyMembers: true, familyDescription: true, familyBackground: true, culturalValues: true });
      case "partner-basic":
        return updateProfileSchema.pick({ partnerAgeRange: true, partnerHeightRange: true, partnerWeightRange: true, partnerMaritalStatus: true, partnerReligion: true, partnerCaste: true, partnerMotherTongue: true, partnerSpokenLanguages: true });
      case "partner-advanced":
        return updateProfileSchema.pick({ partnerMinimumQualification: true, partnerOccupation: true, partnerAnnualIncome: true, partnerEmploymentType: true, partnerEatingHabit: true, partnerDrinkingHabit: true, partnerSmokingHabit: true, partnerDisabilityAcceptable: true, partnerPreferredCountry: true, partnerPreferredState: true, partnerPreferredDistrict: true, partnerDescription: true, partnerPersonalityExpectation: true, partnerFamilyExpectation: true });
      default:
        return updateProfileSchema.partial();
    }
  };

  const form = useForm<any>({
    resolver: zodResolver(getValidationSchema()),
    defaultValues: {
      // Basic
      firstName: "",
      middleName: "",
      lastName: "",
      dob: "",
      maritalStatus: "",
      children: 0,
      bloodGroup: "",
      speciallyAble: false,
      disabilityDetails: "",
      motherTongue: "",
      spokenLanguages: "",
      childrenLivingWith: "",
      whatsappNumber: "",
      alternatePhone: "",
      emailId: "",
      phoneNumber: "",
      relationshipWithBrideGroom: "",
      // Career
      employmentType: "",
      profession: "",
      occupationDetails: "",
      designation: "",
      companyName: "",
      workExperience: "",
      organizationName: "",
      monthlyIncome: "",
      education: "",
      collegeInstitution: "",
      fieldOfStudy: "",
      passingYear: "",
      // Religion
      religion: "",
      caste: "",
      subCaste: "",
      gotra: "",
      manglik: false,
      rashi: "",
      nakshatra: "",
      timeOfBirth: "",
      cityOfBirth: "",
      countryOfBirth: "",
      country: "",
      state: "",
      dist: "",
      addressLine1: "",
      addressLine2: "",
      citizenship: "",
      ancestralOrigin: "",
      pinCode: "",
      // Physical
      height: "",
      weight: "",
      skinTone: "",
      bodyType: "",
      eatingHabits: "",
      drinkingHabits: "",
      smokingHabits: "",
      healthScreening: "",
      hobbies: "",
      personalityTraits: "",
      lifeGoals: "",
      // Family
      myFamilyType: "",
      myFamilyStatus: "",
      myFamilyValues: "",
      fathersOccupation: "",
      mothersOccupation: "",
      noOfBrothers: "",
      brothersMarriedCount: "",
      noOfSisters: "",
      sistersMarriedCount: "",
      familyMembers: "",
      familyDescription: "",
      familyBackground: "",
      culturalValues: "",
      // Partner Basic
      partnerAgeRange: "",
      partnerHeightRange: "",
      partnerWeightRange: "",
      partnerMaritalStatus: "",
      partnerReligion: "",
      partnerCaste: "",
      partnerMotherTongue: "",
      partnerSpokenLanguages: "",
      // Partner Advanced
      partnerMinimumQualification: "",
      partnerOccupation: "",
      partnerAnnualIncome: "",
      partnerEmploymentType: "",
      partnerEatingHabit: "",
      partnerPreferredCountry: "",
      partnerPreferredState: "",
      partnerPreferredDistrict: "",
      partnerDrinkingHabit: "",
      partnerSmokingHabit: "",
      partnerDisabilityAcceptable: "",
      partnerDescription: "",
      partnerPersonalityExpectation: "",
      partnerFamilyExpectation: "",
      // Other
      aboutMyself: "",
      aboutMyPartner: "",
      candidatePreferences: "",
      locationPreferences: "",
    },
  });

  useEffect(() => {
    if (!data) return;

    const formData = {
      ...data,
      // Basic
      firstName: data.firstName || "",
      middleName: data.middleName || "",
      lastName: data.lastName || "",
      dob: data.dob ?? "",
      maritalStatus: data.maritalStatus ?? "",
      bloodGroup: data.bloodGroup ?? "",
      children: data.children ?? 0,
      speciallyAble: data.speciallyAble || false,
      disabilityDetails: (data as any).disabilityDetails || "",
      motherTongue: data.motherTongue || "",
      spokenLanguages: data.spokenLanguages || "",
      childrenLivingWith: (data as any).childrenLivingWith || "",
      whatsappNumber: (data as any).whatsappNumber || "",
      alternatePhone: (data as any).alternatePhone || "",
      emailId: data.email || "",
      phoneNumber: data.phone || "",
      relationshipWithBrideGroom: (data as any).relationshipWithBrideGroom || "",
      // Career
      employmentType: data.employmentType || "",
      profession: data.profession || "",
      occupationDetails: (data as any).occupationDetails || "",
      designation: data.designation || "",
      companyName: (data as any).companyName || "",
      workExperience: data.workExperience || "",
      organizationName: data.organizationName || "",
      monthlyIncome: data.monthlyIncome ?? "",
      education: data.education || "",
      collegeInstitution: data.collegeInstitution || "",
      fieldOfStudy: data.fieldOfStudy || "",
      passingYear: data.passingYear || "",
      // Religion / Background
      religion: data.religion ?? "",
      caste: data.caste ?? "",
      subCaste: data.subCaste || "",
      gotra: data.gotra || "",
      manglik: data.manglikDosh || false,
      rashi: data.rashi || "",
      nakshatra: data.nakshatra || "",
      timeOfBirth: data.birthTime || "",
      cityOfBirth: data.cityOfBirth || "",
      countryOfBirth: data.countryOfBirth || "",
      country: data.country || "",
      state: data.state || "",
      dist: data.dist || "",
      addressLine1: data.addressLine1 || "",
      addressLine2: data.addressLine2 || "",
      citizenship: data.citizenship || "",
      ancestralOrigin: (data as any).ancestralOrigin || "",
      pinCode: data.pinCode || "",
      // Physical
      height: data.height || "",
      weight: data.weight || "",
      skinTone: data.skinTone ?? "",
      bodyType: data.bodyType ?? "",
      eatingHabits: data.eatingHabits || "",
      drinkingHabits: data.drinkingHabits || "",
      smokingHabits: data.smokingHabits || "",
      healthScreening: (data as any).healthScreening || "",
      hobbies: data.hobbies || "",
      personalityTraits: (data as any).personalityTraits || "",
      lifeGoals: (data as any).lifeGoals || "",
      // Family - use my* form names to match Step5 component
      myFamilyType: data.familyType || "",
      myFamilyStatus: (data as any).myFamilyStatus || "",
      myFamilyValues: data.familyValues || "",
      fathersOccupation: data.fatherProfession || "",
      mothersOccupation: data.mothersOccupation || "",
      noOfBrothers: data.noOfBrothers || "",
      brothersMarriedCount: (data as any).brothersMarriedCount || "",
      noOfSisters: data.noOfSisters || "",
      sistersMarriedCount: (data as any).sistersMarriedCount || "",
      familyMembers: data.familyMembers || "",
      familyDescription: (data as any).familyDescription || "",
      familyBackground: (data as any).familyBackground || "",
      culturalValues: (data as any).culturalValues || "",
      // Other
      aboutMyself: data.aboutMyself || "",
      aboutMyPartner: data.aboutMyPartner || "",
      candidatePreferences: data.candidatePreference || "",
      locationPreferences: data.locationPreference || "",
      // Partner Basic - use the schema names that Step6 uses
      partnerAgeRange: data.partnerAgeRange || "",
      partnerHeightRange: data.partnerHeightRange || "",
      partnerWeightRange: (data as any).partnerWeightRange || "",
      partnerMaritalStatus: data.partnerMaritalStatus || "",
      partnerReligion: data.partnerReligion || "",
      partnerCaste: data.partnerCaste || "",
      partnerMotherTongue: data.partnerMotherTongue || "",
      partnerSpokenLanguages: (data as any).partnerSpokenLanguages || "",
      // Partner Advanced - use schema names (Step7 uses these)
      partnerMinimumQualification: data.partnerEducation || "",
      partnerOccupation: data.partnerProfession || "",
      partnerAnnualIncome: data.partnerIncome || "",
      partnerEmploymentType: (data as any).partnerEmploymentType || "",
      partnerEatingHabit: (data as any).partnerDiet || (data as any).partnerEatingHabit || "",
      partnerPreferredCountry: (data as any).partnerPreferredCountry || "",
      partnerPreferredState: (data as any).partnerPreferredState || "",
      partnerPreferredDistrict: (data as any).partnerPreferredDistrict || "",
      partnerDrinkingHabit: (data as any).partnerDrinkingHabit || "",
      partnerSmokingHabit: (data as any).partnerSmokingHabit || "",
      partnerDisabilityAcceptable: (data as any).partnerDisabilityAcceptable || "",
      partnerDescription: (data as any).partnerDescription || "",
      partnerPersonalityExpectation: (data as any).partnerPersonalityExpectation || "",
      partnerFamilyExpectation: (data as any).partnerFamilyExpectation || "",
    };

    form.reset(formData);
  }, [data, form, isOpen]);

  async function onSubmit(formDataToSubmit: any) {
    setLoading(true);

    let allowedFields: string[] = [];
    switch (sectionId) {
      case "about-me":
        allowedFields = ["aboutMyself"];
        break;
      case "basic-info":
        allowedFields = ["firstName", "middleName", "lastName", "dob", "maritalStatus", "children", "speciallyAble", "disabilityDetails", "bloodGroup", "motherTongue", "spokenLanguages", "whatsappNumber", "alternatePhone", "relationshipWithBrideGroom"];
        break;
      case "career-education":
        allowedFields = ["employmentType", "profession", "occupationDetails", "designation", "workExperience", "organizationName", "companyName", "monthlyIncome", "education", "collegeInstitution", "fieldOfStudy", "passingYear"];
        break;
      case "religion-background":
        allowedFields = ["religion", "caste", "subCaste", "gotra", "manglik", "rashi", "nakshatra", "timeOfBirth", "cityOfBirth", "countryOfBirth", "country", "state", "dist", "addressLine1", "citizenship", "ancestralOrigin", "pinCode"];
        break;
      case "physical-attributes":
        allowedFields = ["height", "weight", "skinTone", "bodyType", "eatingHabits", "drinkingHabits", "smokingHabits", "healthScreening", "hobbies", "personalityTraits", "lifeGoals"];
        break;
      case "family-details":
        allowedFields = ["myFamilyType", "myFamilyStatus", "myFamilyValues", "fathersOccupation", "mothersOccupation", "noOfBrothers", "brothersMarriedCount", "noOfSisters", "sistersMarriedCount", "familyMembers", "familyDescription", "familyBackground", "culturalValues"];
        break;
      case "partner-basic":
        allowedFields = ["partnerAgeRange", "partnerHeightRange", "partnerWeightRange", "partnerMaritalStatus", "partnerReligion", "partnerCaste", "partnerMotherTongue", "partnerSpokenLanguages"];
        break;
      case "partner-advanced":
        allowedFields = ["partnerMinimumQualification", "partnerOccupation", "partnerAnnualIncome", "partnerEmploymentType", "partnerEatingHabit", "partnerDrinkingHabit", "partnerSmokingHabit", "partnerDisabilityAcceptable", "partnerPreferredCountry", "partnerPreferredState", "partnerPreferredDistrict", "partnerDescription", "partnerPersonalityExpectation", "partnerFamilyExpectation"];
        break;
      default:
        allowedFields = Object.keys(formDataToSubmit);
    }

    const filteredData: Record<string, any> = {};
    allowedFields.forEach(field => {
      if (formDataToSubmit[field] !== undefined && formDataToSubmit[field] !== "") {
        filteredData[field] = formDataToSubmit[field];
      }
    });

    // Translate form field names → DB column names, then remove the original key
    if (filteredData.myFamilyType !== undefined) { filteredData.familyType = filteredData.myFamilyType; delete filteredData.myFamilyType; }
    if (filteredData.myFamilyStatus !== undefined) { filteredData.familyStatus = filteredData.myFamilyStatus; delete filteredData.myFamilyStatus; }
    if (filteredData.myFamilyValues !== undefined) { filteredData.familyValues = filteredData.myFamilyValues; delete filteredData.myFamilyValues; }
    if (filteredData.fathersOccupation !== undefined) { filteredData.fatherProfession = filteredData.fathersOccupation; delete filteredData.fathersOccupation; }
    if (filteredData.partnerMinimumQualification !== undefined) { filteredData.partnerEducation = filteredData.partnerMinimumQualification; delete filteredData.partnerMinimumQualification; }
    if (filteredData.partnerOccupation !== undefined) { filteredData.partnerProfession = filteredData.partnerOccupation; delete filteredData.partnerOccupation; }
    if (filteredData.partnerAnnualIncome !== undefined) { filteredData.partnerIncome = filteredData.partnerAnnualIncome; delete filteredData.partnerAnnualIncome; }
    if (filteredData.partnerEatingHabit !== undefined) { filteredData.partnerDiet = filteredData.partnerEatingHabit; delete filteredData.partnerEatingHabit; }

    console.log("SUBMITTING PAYLOAD:", filteredData);

    try {
      const response = await api.patch<AxiosResponse<null>>(
        "/users/profile/update-partial",
        filteredData,
      );
      if (response.data.success) {
        toast.success("Profile updated successfully");
        queryClient.invalidateQueries({ queryKey: ["profileDetails"] });
        queryClient.invalidateQueries({ queryKey: ["self-profile"] });
        onClose();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log("UPDATE ERROR RESPONSE:", error.response?.data);
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || "Failed to update profile"
        : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const renderSection = () => {
    switch (sectionId) {
      case "about-me":
        return <Step0AboutMeEdit form={form} />;
      case "basic-info":
        return <Step1BasicEdit form={form} />;
      case "career-education":
        return <Step2CareerEdit form={form} />;
      case "religion-background":
        return <Step3ReligionEdit form={form} />;
      case "physical-attributes":
        return <Step4PhysicalEdit form={form} />;
      case "family-details":
        return <Step5FamilyEdit form={form} />;
      case "partner-basic":
        return <Step6PartnerBasicEdit form={form} />;
      case "partner-advanced":
        return <Step7PartnerAdvancedEdit form={form} />;
      default:
        return null;
    }
  };

  const getSectionTitle = () => {
    switch (sectionId) {
      case "about-me": return "Edit About Me";
      case "basic-info": return "Edit Basic Information";
      case "career-education": return "Edit Education & Career";
      case "religion-background": return "Edit Religion & Astrology Details";
      case "physical-attributes": return "Edit Physical Attributes & Lifestyle";
      case "family-details": return "Edit Family Details";
      case "partner-basic": return "Edit Partner Preferences (Basic)";
      case "partner-advanced": return "Edit Partner Preferences (Advanced)";
      default: return "Edit Profile";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col gap-0 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 outline-none">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-zinc-200">
            {getSectionTitle()}
          </DialogTitle>
          <DialogDescription className="hidden">Edit your profile information</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 w-full">
              <div className="p-6">
                {renderSection()}
              </div>
            </ScrollArea>
            
            <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-zinc-900/50 shrink-0 mt-auto">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold">
                Cancel
              </Button>
              {loading ? (
                <Button disabled className="rounded-xl font-bold px-8 bg-[#9B1C31] hover:bg-[#801426] text-white">
                  <LoadingButton title="Saving..." />
                </Button>
              ) : (
                <Button type="submit" className="rounded-xl font-bold px-8 bg-[#9B1C31] hover:bg-[#801426] text-white shadow-sm shadow-[#9B1C31]/20">
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
