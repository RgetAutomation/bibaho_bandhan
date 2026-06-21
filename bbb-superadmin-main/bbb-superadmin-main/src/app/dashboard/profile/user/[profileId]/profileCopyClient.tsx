"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { IFullUserWithImages } from "@/components/interface/IUsers";
import { useProfileCopyStore } from "@/hooks/useProfileCopyStore";
import toast from "react-hot-toast";

interface Props {
  user: IFullUserWithImages;
  allowSocialPublish: boolean;
}

export default function ProfileCopyClient({ user, allowSocialPublish }: Props) {
  const { selectedFields, toggleField, selectMultiple, deselectMultiple } =
    useProfileCopyStore();

  // 🔹 Calculate Age from DOB
  const calculateAge = (dob?: Date | null) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // 🔹 Custom Labels + Values
  const groupedFields = {
    "Contact & Location": {
      phone: { label: "Phone", value: user.phone },
      email: { label: "Email", value: user.email },
      whatsappNumber: { label: "WhatsApp", value: user.profile?.whatsappNumber },
      alternatePhone: { label: "Alternate Phone", value: user.profile?.alternatePhone },
      country: { label: "Country", value: user.profile?.country },
      citizenship: { label: "Citizenship", value: user.profile?.citizenship },
      addressLine1: { label: "Address Line 1", value: user.profile?.addressLine1 },
      addressLine2: { label: "Address Line 2", value: user.profile?.addressLine2 },
      postOffice: { label: "Post Office", value: user.profile?.postOffice },
      policeStation: { label: "Police Station", value: user.profile?.policeStation },
      location: { label: "District & State", value: `${user.profile?.dist ?? ""}, ${user.profile?.state ?? ""}` },
      pinCode: { label: "PIN Code", value: user.profile?.pinCode },
      ancestralOrigin: { label: "Ancestral Origin", value: user.profile?.ancestralOrigin },
      relationshipWithBrideGroom: { label: "Relationship with Bride/Groom", value: user.profile?.relationshipWithBrideGroom },
    },
    "Personal & Astrological": {
      publicId: { label: "Public Id", value: user.publicId },
      title: { label: "Title", value: user.title },
      firstName: { label: "First Name", value: user.firstName },
      middleName: { label: "Middle Name", value: user.middleName },
      lastName: { label: "Last Name", value: user.lastName },
      age: { label: "Age", value: calculateAge(user.profile?.dob) },
      gender: { label: "Gender", value: user.gender },
      maritalStatus: { label: "Marital Status", value: user.profile?.maritalStatus },
      children: { label: "Children", value: user.profile?.children },
      speciallyAble: { label: "Specially Able", value: user.profile?.speciallyAble ? "Yes" : "No" },
      disabilityDetails: { label: "Disability Details", value: user.profile?.disabilityDetails },
      healthScreening: { label: "Health Screening", value: user.profile?.healthScreening },
      rashi: { label: "Rashi", value: user.profile?.rashi },
      nakshatra: { label: "Nakshatra", value: user.profile?.nakshatra },
      birthTime: { label: "Birth Time", value: user.profile?.birthTime },
      cityOfBirth: { label: "City of Birth", value: user.profile?.cityOfBirth },
      countryOfBirth: { label: "Country of Birth", value: user.profile?.countryOfBirth },
      bloodGroup: { label: "Blood Group", value: user.profile?.bloodGroup },
      height: { label: "Height", value: user.profile?.height },
      weight: { label: "Weight", value: `${user.profile?.weight ?? ""} kg` },
      skinTone: { label: "Skin Tone", value: user.profile?.skinTone },
      bodyType: { label: "Body Type", value: user.profile?.bodyType },
      eatingHabits: { label: "Eating Habits", value: user.profile?.eatingHabits },
      drinkingHabits: { label: "Drinking Habits", value: user.profile?.drinkingHabits },
      smokingHabits: { label: "Smoking Habits", value: user.profile?.smokingHabits },
      aboutMyself: { label: "About Myself", value: user.profile?.aboutMyself },
      personalityTraits: { label: "Personality Traits", value: user.profile?.personalityTraits },
      lifeGoals: { label: "Life Goals", value: user.profile?.lifeGoals },
    },
    "Religion & Community": {
      religion: { label: "Religion", value: user.profile?.religion },
      caste: { label: "Caste", value: user.profile?.caste },
      subCaste: { label: "Sub-Caste", value: user.profile?.subCaste },
      gotra: { label: "Gotra", value: user.profile?.gotra },
      manglikDosh: { label: "Manglik", value: user.profile?.manglikDosh ? "Yes" : "No" },
      language: { label: "Language", value: user.profile?.language },
    },
    "Education & Career": {
      education: { label: "Education", value: user.profile?.education },
      collegeInstitution: { label: "College / Institution", value: user.profile?.collegeInstitution },
      fieldOfStudy: { label: "Field of Study", value: user.profile?.fieldOfStudy },
      passingYear: { label: "Passing Year", value: user.profile?.passingYear },
      employmentType: { label: "Employment Type", value: user.profile?.employmentType },
      profession: { label: "Profession", value: user.profile?.profession },
      occupationDetails: { label: "Occupation Details", value: user.profile?.occupationDetails },
      designation: { label: "Designation", value: user.profile?.designation },
      workExperience: { label: "Work Experience", value: user.profile?.workExperience },
      organizationName: { label: "Organization / Company", value: user.profile?.organizationName },
      companyName: { label: "Company Name", value: user.profile?.companyName },
      monthlyIncome: { label: "Monthly Income", value: user.profile?.monthlyIncome },
      hobbies: { label: "Hobbies", value: user.profile?.hobbies },
    },
    "Family Details": {
      fatherProfession: { label: "Father Profession", value: user.profile?.fatherProfession },
      mothersOccupation: { label: "Mother's Occupation", value: user.profile?.mothersOccupation },
      noOfBrothers: { label: "No. of Brothers", value: user.profile?.noOfBrothers },
      brothersMarriedCount: { label: "Brothers Married", value: user.profile?.brothersMarriedCount },
      noOfSisters: { label: "No. of Sisters", value: user.profile?.noOfSisters },
      sistersMarriedCount: { label: "Sisters Married", value: user.profile?.sistersMarriedCount },
      myFamilyStatus: { label: "Family Status", value: user.profile?.myFamilyStatus },
      familyType: { label: "Family Type", value: user.profile?.familyType },
      familyValues: { label: "Family Values", value: user.profile?.familyValues },
      familyMembers: { label: "Family Members", value: user.profile?.familyMembers },
      familyDescription: { label: "Family Description", value: user.profile?.familyDescription },
      familyBackground: { label: "Family Background", value: user.profile?.familyBackground },
      culturalValues: { label: "Cultural Values", value: user.profile?.culturalValues },
    },
    "Partner Preferences": {
      partnerAgeRange: { label: "Age Range", value: user.profile?.partnerAgeRange },
      partnerHeightRange: { label: "Height Range", value: user.profile?.partnerHeightRange },
      partnerWeightRange: { label: "Weight Range", value: user.profile?.partnerWeightRange },
      partnerMaritalStatus: { label: "Marital Status", value: user.profile?.partnerMaritalStatus },
      partnerSpokenLanguages: { label: "Spoken Languages", value: user.profile?.partnerSpokenLanguages },
      partnerReligion: { label: "Religion", value: user.profile?.partnerReligion },
      partnerCaste: { label: "Caste", value: user.profile?.partnerCaste },
      partnerSubCaste: { label: "Sub-Caste", value: user.profile?.partnerSubCaste },
      partnerGothra: { label: "Gothra", value: user.profile?.partnerGothra },
      partnerPreferredCountry: { label: "Preferred Country", value: user.profile?.partnerPreferredCountry },
      partnerPreferredState: { label: "Preferred State", value: user.profile?.partnerPreferredState },
      partnerPreferredDistrict: { label: "Preferred District", value: user.profile?.partnerPreferredDistrict },
      partnerEducation: { label: "Education", value: user.profile?.partnerEducation },
      partnerEmploymentType: { label: "Employment Type", value: user.profile?.partnerEmploymentType },
      partnerProfession: { label: "Profession", value: user.profile?.partnerProfession },
      partnerIncome: { label: "Income", value: user.profile?.partnerIncome },
      partnerLocation: { label: "Location", value: user.profile?.partnerLocation },
      partnerDiet: { label: "Diet", value: user.profile?.partnerDiet },
      partnerDrinkingHabit: { label: "Drinking Habit", value: user.profile?.partnerDrinkingHabit },
      partnerSmokingHabit: { label: "Smoking Habit", value: user.profile?.partnerSmokingHabit },
      partnerComplexion: { label: "Complexion", value: user.profile?.partnerComplexion },
      partnerMotherTongue: { label: "Mother Tongue", value: user.profile?.partnerMotherTongue },
      partnerDisabilityAcceptable: { label: "Disability Acceptable", value: user.profile?.partnerDisabilityAcceptable },
      partnerDescription: { label: "Description", value: user.profile?.partnerDescription },
      partnerPersonalityExpectation: { label: "Personality Expectation", value: user.profile?.partnerPersonalityExpectation },
      partnerFamilyExpectation: { label: "Family Expectation", value: user.profile?.partnerFamilyExpectation },
      partnerFamilyDetails: { label: "Family Details", value: user.profile?.partnerFamilyDetails },
      familyStatusPreference: { label: "Family Status Preference", value: user.profile?.familyStatusPreference },
      familyTypePreference: { label: "Family Type Preference", value: user.profile?.familyTypePreference },
      familyValuesPreference: { label: "Family Values Preference", value: user.profile?.familyValuesPreference },
      candidatePreference: { label: "Candidate Preference", value: user.profile?.candidatePreference },
      locationPreference: { label: "Location Preference", value: user.profile?.locationPreference },
      maritalPreference: { label: "About My Partner", value: user.profile?.aboutMyPartner },
    },
  };

  const handleGroupToggle = (keys: string[], checked: boolean) => {
    if (checked) selectMultiple(keys);
    else deselectMultiple(keys);
  };

  const handleCopy = () => {
    let textToCopy = "";

    // 🔹 Handle Name Separately
    const nameParts: string[] = [];

    if (selectedFields.includes("title") && user.title)
      nameParts.push(user.title);

    if (selectedFields.includes("firstName") && user.firstName)
      nameParts.push(user.firstName);

    if (selectedFields.includes("middleName") && user.middleName)
      nameParts.push(user.middleName);

    if (selectedFields.includes("lastName") && user.lastName)
      nameParts.push(user.lastName);

    if (nameParts.length > 0) {
      textToCopy += `Name :- ${nameParts.join(" ")}\n`;
    }

    Object.values(groupedFields).forEach((group) => {
      Object.entries(group).forEach(([key, field]) => {
        if (
          !["title", "firstName", "middleName", "lastName"].includes(key) &&
          selectedFields.includes(key) &&
          field.value
        ) {
          textToCopy += `${field.label} :- ${field.value}\n`;
        }
      });
    });

    navigator.clipboard.writeText(textToCopy.trim());
    toast.success("Profile Copied");
  };

  const { isMarkingMode } = useProfileCopyStore();

  if (!isMarkingMode) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl rounded-xl w-full max-w-sm px-4">
      <Button 
        onClick={handleCopy} 
        className="w-full text-base font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-12"
      >
        Copy Selected Profile Fields
      </Button>
    </div>
  );
}
