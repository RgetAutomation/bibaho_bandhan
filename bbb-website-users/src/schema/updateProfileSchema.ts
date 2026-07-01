import z, { boolean, coerce, object, string } from "zod";

export const updateProfileSchema = object({
  isGhotokOwned: boolean().optional(),
  isProfilePublic: boolean().optional(),
  allowSocialPublish: boolean().optional(),
  // profileImages: string({ message: "Image URL is required" })
  //   .optional()
  //   .default(""),
  profileImages: string().nullable().optional(),
  avatar: string().nullable().optional(),
  verificationSelfieUrl: string().nullable().optional(),
  
  // Basic Info additions
  firstName: string().nullable().optional(),
  middleName: string().nullable().optional(),
  lastName: string().nullable().optional(),
  motherTongue: string().nullable().optional(),
  spokenLanguages: string().nullable().optional(),
  childrenLivingWith: string().nullable().optional(),

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
  gotra: string().nullable().optional(),
  caste: string().min(2, {
    message: "Caste is required",
  }),
  subCaste: string().nullable().optional(),
  manglik: boolean().optional(),
  height: string().nullable().optional(),
  weight: string().nullable().optional(),
  bloodGroup: string().nullable().optional(),
  skinTone: string().nullable().optional(),
  bodyType: string().nullable().optional(),
  disabilityDetails: string().nullable().optional(),
  healthScreening: string().nullable().optional(),
  eatingHabits: string().nullable().optional(),
  smokingHabits: string().nullable().optional(),
  drinkingHabits: string().nullable().optional(),

  country: string().min(1, { message: "Country is required" }),
  addressLine1: string().nullable().optional(),
  addressLine2: string().nullable().optional(),
  postOffice: string().nullable().optional(),
  policeStation: string().nullable().optional(),
  ancestralOrigin: string().nullable().optional(),
  dist: string().min(3, {
    message: "District is required",
  }),
  state: string().min(2, {
    message: "State is required",
  }),
  pinCode: string().nullable().optional(),
  citizenship: string().nullable().optional(),
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
  aboutMyself: string().nullable().optional(),
  personalityTraits: string().nullable().optional(),
  lifeGoals: string().nullable().optional(),
  employmentType: string().min(1, { message: "Employment type is required" }),
  profession: string().min(1, {
    message: "Occupation is required",
  }),
  occupationDetails: string().nullable().optional(),
  designation: string().nullable().optional(),
  workExperience: string().nullable().optional(),
  organizationName: string().nullable().optional(),
  companyName: string().nullable().optional(),
  education: string().min(3, {
    message: "Highest Qualification is required",
  }),
  passingYear: string().nullable().optional(),
  collegeInstitution: string().nullable().optional(),
  fieldOfStudy: string().nullable().optional(),
  hobbies: string().nullable().optional(),
  monthlyIncome: string().min(1, { message: "Annual income is required" }),
  languages: string().nullable().optional(),
  fathersOccupation: string().nullable().optional(),
  mothersOccupation: string().nullable().optional(),
  noOfBrothers: string().nullable().optional(),
  brothersMarriedCount: string().nullable().optional(),
  noOfSisters: string().nullable().optional(),
  sistersMarriedCount: string().nullable().optional(),
  myFamilyStatus: string().min(1, { message: "Family Status is required" }),
  myFamilyType: string().min(1, { message: "Family Type is required" }),
  myFamilyValues: string().nullable().optional(),
  familyDescription: string().nullable().optional(),
  familyBackground: string().nullable().optional(),
  culturalValues: string().nullable().optional(),
  rashi: string().nullable().optional(),
  nakshatra: string().nullable().optional(),
  timeOfBirth: string().nullable().optional(),
  cityOfBirth: string().nullable().optional(),
  countryOfBirth: string().nullable().optional(),
  // Partner Basic
  partnerAgeRange: string().min(1, { message: "Age range is required" }),
  partnerHeightRange: string().nullable().optional(),
  partnerWeightRange: string().nullable().optional(),
  partnerMaritalStatus: string().nullable().optional(),
  partnerMotherTongue: string().nullable().optional(),
  partnerSpokenLanguages: string().nullable().optional(),

  // Partner Professional
  partnerEmploymentType: string().nullable().optional(),
  partnerOccupation: string().nullable().optional(),
  partnerAnnualIncome: string().nullable().optional(),

  // Partner Education
  partnerMinimumQualification: string().nullable().optional(),

  // Partner Religious
  partnerReligion: string().min(1, { message: "Religion is required" }),
  partnerCaste: string().nullable().optional(),
  partnerSubCaste: string().nullable().optional(),
  partnerGothra: string().nullable().optional(),

  // Partner Location
  partnerPreferredCountry: string().nullable().optional(),
  partnerPreferredState: string().nullable().optional(),
  partnerPreferredDistrict: string().nullable().optional(),

  // Partner Habits
  partnerEatingHabit: string().nullable().optional(),
  partnerDrinkingHabit: string().nullable().optional(),
  partnerSmokingHabit: string().nullable().optional(),

  // Partner Physical
  partnerDisabilityAcceptable: string().nullable().optional(),

  // About My Partner
  partnerDescription: string().nullable().optional(),
  partnerPersonalityExpectation: string().nullable().optional(),
  partnerFamilyExpectation: string().nullable().optional(),

  // Partner Family Details
  partnerFamilyDetails: string().nullable().optional(),
  familyStatusPreference: string().nullable().optional(),
  familyTypePreference: string().nullable().optional(),
  familyValuesPreference: string().nullable().optional(),
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
