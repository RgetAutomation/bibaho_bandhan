import z, { boolean, coerce, object, string } from "zod";

export const updateProfileSchema = object({
  isGhotokOwned: boolean().optional(),
  isProfilePublic: boolean().optional(),
  allowSocialPublish: boolean().optional(),
  // profileImages: string({ message: "Image URL is required" })
  //   .optional()
  //   .default(""),
  profileImages: string().optional(),
  
  // Basic Info additions
  firstName: string().optional(),
  middleName: string().optional(),
  lastName: string().optional(),
  motherTongue: string().min(1, { message: "Mother tongue is required" }),
  spokenLanguages: string().optional(),
  childrenLivingWith: string().optional(),

  dob: string({
    message: "Date of birth is required",
  }).min(10, {
    message: "Date must be a full ISO datetime string",
  }),
  maritalStatus: string().min(3, {
    message: "Marital status is required",
  }),
  children: coerce.number().optional(),
  speciallyAble: boolean().optional(),
  religion: string().min(3, {
    message: "Religion is required",
  }),
  gotra: string().optional(),
  caste: string().min(2, {
    message: "Caste is required",
  }),
  subCaste: string().optional(),
  manglik: boolean().optional(),
  height: string().optional(),
  weight: string().optional(),
  bloodGroup: string().optional(),
  skinTone: string().optional(),
  bodyType: string().optional(),
  disabilityDetails: string().optional(),
  healthScreening: string().optional(),
  eatingHabits: string().optional(),
  smokingHabits: string().optional(),
  drinkingHabits: string().optional(),

  country: string().min(1, { message: "Country is required" }),
  addressLine1: string().optional(),
  addressLine2: string().optional(),
  postOffice: string().optional(),
  policeStation: string().optional(),
  ancestralOrigin: string().optional(),
  dist: string().min(3, {
    message: "District is required",
  }),
  state: string().min(2, {
    message: "State is required",
  }),
  pinCode: string().optional(),
  citizenship: string().optional(),
  whatsappNumber: string()
    .trim()
    .optional()
    .refine((val) => !val || val.length === 10, {
      message: "WhatsApp number must be exactly 10 digits",
    }),

  alternatePhone: string()
    .trim()
    .optional()
    .refine((val) => !val || val.length === 10, {
      message: "Mobile number must be exactly 10 digits",
    }),
  emailId: string().email().optional().or(z.literal('')),
  phoneNumber: string().min(10, { message: "Phone number is required" }),
  relationshipWithBrideGroom: string().min(1, { message: "Relationship is required" }),
  aboutMyself: string().optional(),
  personalityTraits: string().optional(),
  lifeGoals: string().optional(),
  employmentType: string().min(1, { message: "Employment type is required" }),
  profession: string().min(1, {
    message: "Occupation is required",
  }),
  occupationDetails: string().optional(),
  designation: string().optional(),
  workExperience: string().optional(),
  organizationName: string().optional(),
  companyName: string().optional(),
  education: string().min(3, {
    message: "Highest Qualification is required",
  }),
  passingYear: string().optional(),
  collegeInstitution: string().optional(),
  fieldOfStudy: string().optional(),
  hobbies: string().optional(),
  monthlyIncome: string().min(1, { message: "Annual income is required" }),
  languages: string().optional(),
  fathersOccupation: string().optional(),
  mothersOccupation: string().optional(),
  noOfBrothers: string().optional(),
  brothersMarriedCount: string().optional(),
  noOfSisters: string().optional(),
  sistersMarriedCount: string().optional(),
  myFamilyStatus: string().min(1, { message: "Family Status is required" }),
  myFamilyType: string().min(1, { message: "Family Type is required" }),
  myFamilyValues: string().optional(),
  familyDescription: string().optional(),
  familyBackground: string().optional(),
  culturalValues: string().optional(),
  rashi: string().optional(),
  nakshatra: string().optional(),
  timeOfBirth: string().optional(),
  cityOfBirth: string().optional(),
  countryOfBirth: string().optional(),
  // Partner Basic
  partnerAgeRange: string().min(1, { message: "Age range is required" }),
  partnerHeightRange: string().optional(),
  partnerWeightRange: string().optional(),
  partnerMaritalStatus: string().optional(),
  partnerMotherTongue: string().optional(),
  partnerSpokenLanguages: string().optional(),

  // Partner Professional
  partnerEmploymentType: string().optional(),
  partnerOccupation: string().optional(),
  partnerAnnualIncome: string().optional(),

  // Partner Education
  partnerMinimumQualification: string().optional(),

  // Partner Religious
  partnerReligion: string().min(1, { message: "Religion is required" }),
  partnerCaste: string().optional(),
  partnerSubCaste: string().optional(),
  partnerGothra: string().optional(),

  // Partner Location
  partnerPreferredCountry: string().optional(),
  partnerPreferredState: string().optional(),
  partnerPreferredDistrict: string().optional(),

  // Partner Habits
  partnerEatingHabit: string().optional(),
  partnerDrinkingHabit: string().optional(),
  partnerSmokingHabit: string().optional(),

  // Partner Physical
  partnerDisabilityAcceptable: string().optional(),

  // About My Partner
  partnerDescription: string().optional(),
  partnerPersonalityExpectation: string().optional(),
  partnerFamilyExpectation: string().optional(),

  // Partner Family Details
  partnerFamilyDetails: string().optional(),
  familyStatusPreference: string().optional(),
  familyTypePreference: string().optional(),
  familyValuesPreference: string().optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const profilePersonalSchema = updateProfileSchema.pick({
  dob: true,
  maritalStatus: true,
  children: true,
  speciallyAble: true,
  religion: true,
  gotra: true,
  caste: true,
  subCaste: true,
  manglik: true,
  height: true,
  weight: true,
  bloodGroup: true,
  skinTone: true,
  bodyType: true,
  eatingHabits: true,
  smokingHabits: true,
  drinkingHabits: true,
  disabilityDetails: true,
  healthScreening: true,
  rashi: true,
  nakshatra: true,
  timeOfBirth: true,
  cityOfBirth: true,
  countryOfBirth: true,
}).superRefine((data, ctx) => {
  if (data.speciallyAble && (!data.disabilityDetails || data.disabilityDetails.trim() === "")) {
    ctx.addIssue({
      code: "custom",
      path: ["disabilityDetails"],
      message: "Please provide details about the disability",
    });
  }
});

export const profileContactSchema = updateProfileSchema.pick({
  addressLine1: true,
  addressLine2: true,
  postOffice: true,
  policeStation: true,
  ancestralOrigin: true,
  dist: true,
  state: true,
  country: true,
  pinCode: true,
  citizenship: true,
  whatsappNumber: true,
  alternatePhone: true,
  emailId: true,
  phoneNumber: true,
  relationshipWithBrideGroom: true,
});

export const profileOtherSchema = updateProfileSchema.pick({
  aboutMyself: true,
  personalityTraits: true,
  lifeGoals: true,
  employmentType: true,
  profession: true,
  occupationDetails: true,
  designation: true,
  workExperience: true,
  organizationName: true,
  companyName: true,
  education: true,
  passingYear: true,
  collegeInstitution: true,
  fieldOfStudy: true,
  hobbies: true,
  monthlyIncome: true,
  languages: true,
  fathersOccupation: true,
  mothersOccupation: true,
  noOfBrothers: true,
  brothersMarriedCount: true,
  noOfSisters: true,
  sistersMarriedCount: true,
  myFamilyStatus: true,
  myFamilyType: true,
  myFamilyValues: true,
  familyDescription: true,
  familyBackground: true,
  culturalValues: true,
  allowSocialPublish: true,
  isProfilePublic: true,
});

export const profilePartnerPreferenceSchema = updateProfileSchema.pick({
  partnerAgeRange: true,
  partnerHeightRange: true,
  partnerWeightRange: true,
  partnerMaritalStatus: true,
  partnerMotherTongue: true,
  partnerSpokenLanguages: true,
  partnerEmploymentType: true,
  partnerOccupation: true,
  partnerAnnualIncome: true,
  partnerMinimumQualification: true,
  partnerReligion: true,
  partnerCaste: true,
  partnerSubCaste: true,
  partnerGothra: true,
  partnerPreferredCountry: true,
  partnerPreferredState: true,
  partnerPreferredDistrict: true,
  partnerEatingHabit: true,
  partnerDrinkingHabit: true,
  partnerSmokingHabit: true,
  partnerDisabilityAcceptable: true,
  partnerDescription: true,
  partnerPersonalityExpectation: true,
  partnerFamilyExpectation: true,
  partnerFamilyDetails: true,
  familyStatusPreference: true,
  familyTypePreference: true,
  familyValuesPreference: true,
});

export type ProfilePartnerPreferenceSchema = z.infer<typeof profilePartnerPreferenceSchema>;

export const profileImageSchema = updateProfileSchema.pick({
  avatar: true,
  profileImages: true,
});

export type ProfileImageSchema = z.infer<typeof profileImageSchema>;
