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
      partnerPreferredState: "",
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
    if (!data) return;

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
      whatsappNumber: (data as any).whatsappNumber || "",
      alternatePhone: (data as any).alternatePhone || "",
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
  }, [data, form, isOpen]);

  async function onSubmit(formDataToSubmit: any) {
    setLoading(true);
    try {
      const response = await api.post<AxiosResponse<null>>(
        "/users/profile/update",
        formDataToSubmit,
      );
      if (response.data.success) {
        toast.success("Profile updated successfully");
        queryClient.invalidateQueries({ queryKey: ["profileDetails"] });
        queryClient.invalidateQueries({ queryKey: ["self-profile"] });
        onClose();
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

  const renderSection = () => {
    switch (sectionId) {
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
      case "basic-info": return "Edit Basic Information & About Me";
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
