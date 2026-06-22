export interface UserProfileSelf {
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
}
