export interface UserProfileSelf {
  id: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  isProfilePublic: boolean;
  allowSocialPublish: boolean;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  dob: string; // ISO date string (use Date if you prefer strict typing)
  maritalStatus: "SINGLE" | "DIVORCED" | "WIDOWED" | "MARRIED"; // restrict to allowed values
  children: number;
  bloodGroup: string; // could also be narrowed to a union type e.g. "A+VE" | "O+VE" | ...
  religion: string;
  gotra: string;
  caste: string;
  subCaste: string;
  manglikDosh: boolean;
  speciallyAble: boolean;
  height: string;
  weight: string;
  skinTone: string;
  bodyType: string | null;
  eatingHabits: string | null;
  drinkingHabits: string | null;
  smokingHabits: string | null;
  addressLine1: string;
  addressLine2: string;
  postOffice: string;
  policeStation: string;
  dist: string;
  state: string;
  pinCode: string;
  whatsappNumber: string;
  alternatePhone: string;
  aboutMyself: string | null;
  profession: string;
  employmentType?: string | null;
  designation?: string | null;
  occupationDetails?: string | null;
  companyName?: string | null;
  education: string;
  hobbies: string;
  monthlyIncome: string;
  language: string | null;
  familyMembers: string;
  fatherProfession: string;
  candidatePreference: string;
  locationPreference: string | null;
  aboutMyPartner: string | null;
  rashi: string | null;
  nakshatra: string | null;
  birthTime: string | null;
  cityOfBirth: string | null;
  countryOfBirth: string | null;

  familyType?: string | null;
  mothersOccupation?: string | null;
  noOfBrothers?: string | null;
  noOfSisters?: string | null;
  familyValues?: string | null;

  workExperience?: string | null;
  collegeInstitution?: string | null;
  fieldOfStudy?: string | null;
  passingYear?: string | null;
  organizationName?: string | null;

  partnerAgeRange?: string | null;
  partnerHeightRange?: string | null;
  partnerMaritalStatus?: string | null;
  partnerReligion?: string | null;
  partnerCaste?: string | null;
  partnerEducation?: string | null;
  partnerProfession?: string | null;
  partnerIncome?: string | null;
  partnerLocation?: string | null;
  partnerDiet?: string | null;
  partnerComplexion?: string | null;
  partnerMotherTongue?: string | null;

  healthScreening?: string | null;
  country?: string | null;
  citizenship?: string | null;
  ancestralOrigin?: string | null;
  myFamilyStatus?: string | null;
  partnerSpokenLanguages?: string | null;
  partnerPreferredCountry?: string | null;
  partnerPreferredState?: string | null;
  partnerPreferredDistrict?: string | null;
  partnerDescription?: string | null;
  motherTongue?: string | null;
  spokenLanguages?: string | null;
  childrenLivingWith?: string | null;
  relationshipWithBrideGroom?: string | null;
  brothersMarriedCount?: string | null;
  sistersMarriedCount?: string | null;
  familyDescription?: string | null;
  familyBackground?: string | null;
  culturalValues?: string | null;
  partnerPersonalityExpectation?: string | null;
  partnerFamilyExpectation?: string | null;
  partnerFamilyDetails?: string | null;
  familyStatusPreference?: string | null;
  familyTypePreference?: string | null;
  familyValuesPreference?: string | null;

  // Missing fields causing TS errors
  lifeGoals?: string | null;
  personalityTraits?: string | null;
  partnerWeightRange?: string | null;
  partnerEmploymentType?: string | null;
  partnerSubCaste?: string | null;
  partnerGothra?: string | null;
  partnerDrinkingHabit?: string | null;
  partnerSmokingHabit?: string | null;
  partnerDisabilityAcceptable?: string | null;
  partnerEatingHabit?: string | null;
}

