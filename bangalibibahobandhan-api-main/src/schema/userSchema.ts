import { string, object, enum as ZodEnum, boolean, array, coerce } from "zod";

export const updateUserProfileSchema = object({
  isGhotokOwned: boolean().default(false),
  isProfilePublic: boolean().default(false),
  allowSocialPublish: boolean().default(false),

  dob: string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Date must be a valid ISO datetime string",
  }),
  maritalStatus: ZodEnum(["NEVER MARRIED", "DIVORCED", "WIDOWED", "WIDOWER"], {
    required_error: "Marital status is required",
  }),
  children: coerce.number().optional(),
  speciallyAble: boolean().default(false),
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
  religion: ZodEnum(
    [
      "HINDU",
      "CHRISTIAN",
      "MUSLIM",
      "SIKH",
      "BUDDHIST",
      "SARNAISM",
      "JAIN",
      "OTHER",
    ],
    {
      required_error: "Religion is required",
    }
  ),
  gotra: string().optional(),
  caste: ZodEnum(["GENERAL", "OBC", "SC", "ST", "OTHERS"], {
    required_error: "Caste is required",
  }),
  subCaste: string().optional(),
  manglik: boolean().default(false),
  height: string().optional(),
  weight: string().optional(),
  bloodGroup: string().optional(),
  skinTone: string().optional(),
  bodyType: string().optional(),
  eatingHabits: string().optional(),
  smokingHabits: string().optional(),
  drinkingHabits: string().optional(),
  addressLine1: string({
    required_error: "Address line 1 is required",
  }).min(3, { message: "Address line 1 must be at least 3 characters" }),
  addressLine2: string().optional(),
  postOffice: string({
    required_error: "Post office is required",
  }).min(3, { message: "Post office must be at least 3 characters" }),
  policeStation: string({
    required_error: "Police station is required",
  }).min(3, { message: "Police station must be at least 3 characters" }),
  dist: string({
    required_error: "District is required",
  }).min(3, { message: "District must be at least 3 characters" }),
  state: string({
    required_error: "State is required",
  }).min(2, { message: "State must be at least 2 characters" }),
  pinCode: string({
    required_error: "Pincode is required",
  }).min(6, { message: "Pin code must be 6 digits" }).max(6, { message: "Pin code must be 6 digits" }),
  aboutMyself: string().optional(),
  profession: string({
    required_error: "Profession is required",
  }).min(3, { message: "Profession must be at least 3 characters" }),
  education: string({
    required_error: "Education is required",
  }).min(3, { message: "Education must be at least 3 characters" }),
  hobbies: string().optional(),
  monthlyIncome: string().optional(),
  languages: string().optional(),
  familyMembers: string().optional(),
  fatherProfession: string().optional(),
  candidatePreferences: string().optional(),
  locationPreferences: string().optional(),
  aboutMyPartner: string().optional(),
  rashi: string().optional(),
  nakshatra: string().optional(),
  timeOfBirth: string().optional(),
  cityOfBirth: string().optional(),
  countryOfBirth: string().optional(),

  familyType: string().optional(),
  mothersOccupation: string().optional(),
  noOfBrothers: string().optional(),
  noOfSisters: string().optional(),
  familyValues: string().optional(),

  workExperience: string().optional(),
  collegeInstitution: string().optional(),
  fieldOfStudy: string().optional(),
  passingYear: string().optional(),
  organizationName: string().optional(),

  partnerAgeRange: string().optional(),
  partnerHeightRange: string().optional(),
  partnerMaritalStatus: string().optional(),
  partnerReligion: string().optional(),
  partnerCaste: string().optional(),
  partnerEducation: string().optional(),
  partnerProfession: string().optional(),
  partnerIncome: string().optional(),
  partnerLocation: string().optional(),
  partnerDiet: string().optional(),
  partnerComplexion: string().optional(),
  partnerMotherTongue: string().optional(),

  // Additional Missing Fields
  disabilityDetails: string().optional(),
  healthScreening: string().optional(),
  country: string().optional(),
  citizenship: string().optional(),
  ancestralOrigin: string().optional(),
  relationshipWithBrideGroom: string().optional(),

  personalityTraits: string().optional(),
  lifeGoals: string().optional(),
  employmentType: string().optional(),
  occupationDetails: string().optional(),
  designation: string().optional(),
  companyName: string().optional(),

  brothersMarriedCount: string().optional(),
  sistersMarriedCount: string().optional(),
  myFamilyStatus: string().optional(),
  familyDescription: string().optional(),
  familyBackground: string().optional(),
  culturalValues: string().optional(),

  partnerWeightRange: string().optional(),
  partnerSpokenLanguages: string().optional(),
  partnerEmploymentType: string().optional(),
  partnerSubCaste: string().optional(),
  partnerGothra: string().optional(),
  partnerPreferredCountry: string().optional(),
  partnerPreferredState: string().optional(),
  partnerPreferredDistrict: string().optional(),
  partnerDrinkingHabit: string().optional(),
  partnerSmokingHabit: string().optional(),
  partnerDisabilityAcceptable: string().optional(),
  partnerDescription: string().optional(),
  partnerPersonalityExpectation: string().optional(),
  partnerFamilyExpectation: string().optional(),
  partnerFamilyDetails: string().optional(),
  familyStatusPreference: string().optional(),
  familyTypePreference: string().optional(),
  familyValuesPreference: string().optional(),
});
