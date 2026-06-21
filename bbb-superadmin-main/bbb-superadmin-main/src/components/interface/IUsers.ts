import { UserGender } from "../enum/userGender";

export interface IUsers {
  id: string;
  publicId: string | null;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string | null;
  avatar: string | null;
  phone: string;
  email?: string | null;
  type: string;
  blocked: boolean;
  planExpiryDate: Date | null;
  isProfileComplete: boolean;
  isGhotokOwned: boolean;
  allowSocialPublish?: boolean;
}

export interface IFullUserWithImages extends IUsers {
  gender: UserGender;
  type: string;
  createdAt: Date;
  isProfilePublic: boolean;
  allowSocialPublish: boolean;
  profile: Profile | null;
  publicId: string;
  profileImages: {
    id: string;
    url: string;
  }[];
}

export interface Profile {
  id: string;
  dob: Date;
  maritalStatus: string;
  children: number | null;
  speciallyAble: boolean;
  whatsappNumber: string | null;
  alternatePhone: string | null;
  religion: string;
  gotra: string | null;
  caste: string;
  subCaste: string | null;
  manglikDosh: boolean | null;
  height: string | null;
  weight: string | null;
  bloodGroup: string | null;
  addressLine1: string;
  addressLine2: string | null;
  postOffice: string;
  policeStation: string;
  dist: string;
  state: string;
  pinCode: string;
  skinTone: string | null;
  bodyType: string | null;
  eatingHabits: string | null;
  drinkingHabits: string | null;
  smokingHabits: string | null;
  aboutMyself: string | null;
  profession: string;
  education: string;
  hobbies: string | null;
  monthlyIncome: string | null;
  language: string | null;
  familyMembers: string | null;
  fatherProfession: string | null;
  candidatePreference: string | null;
  locationPreference: string | null;
  aboutMyPartner: string | null;

  // Astrological
  rashi?: string | null;
  nakshatra?: string | null;
  birthTime?: string | null;
  cityOfBirth?: string | null;
  countryOfBirth?: string | null;

  // Family details
  familyType?: string | null;
  mothersOccupation?: string | null;
  noOfBrothers?: string | null;
  noOfSisters?: string | null;
  familyValues?: string | null;

  // Career details
  workExperience?: string | null;
  collegeInstitution?: string | null;
  fieldOfStudy?: string | null;
  passingYear?: string | null;
  organizationName?: string | null;

  // Partner Preferences
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

  // Additional Missing Fields
  disabilityDetails?: string | null;
  healthScreening?: string | null;
  country?: string | null;
  citizenship?: string | null;
  ancestralOrigin?: string | null;
  relationshipWithBrideGroom?: string | null;

  personalityTraits?: string | null;
  lifeGoals?: string | null;
  employmentType?: string | null;
  occupationDetails?: string | null;
  designation?: string | null;
  companyName?: string | null;

  brothersMarriedCount?: string | null;
  sistersMarriedCount?: string | null;
  myFamilyStatus?: string | null;
  familyDescription?: string | null;
  familyBackground?: string | null;
  culturalValues?: string | null;

  partnerWeightRange?: string | null;
  partnerSpokenLanguages?: string | null;
  partnerEmploymentType?: string | null;
  partnerSubCaste?: string | null;
  partnerGothra?: string | null;
  partnerPreferredCountry?: string | null;
  partnerPreferredState?: string | null;
  partnerPreferredDistrict?: string | null;
  partnerDrinkingHabit?: string | null;
  partnerSmokingHabit?: string | null;
  partnerDisabilityAcceptable?: string | null;
  partnerDescription?: string | null;
  partnerPersonalityExpectation?: string | null;
  partnerFamilyExpectation?: string | null;
  partnerFamilyDetails?: string | null;
  familyStatusPreference?: string | null;
  familyTypePreference?: string | null;
  familyValuesPreference?: string | null;
}

export interface IGroomForChat {
  id: string;
  publicId: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
  conversationId: string;
  isGhotokOwned: boolean;
  lastMessage: {
    id: string | undefined;
    content: string | undefined;
    senderId: string | undefined;
    type: string | undefined;
  } | null;
}

export interface IMatchedUsers {
  id: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string | null;
  avatar: string | null;
  type: string;
  isGhotokOwned: boolean;
  matchingStartDate: Date;
  matchingExpiryDate: Date;
  isExipired: boolean;
}

export interface IBrideProfileForChat {
  id: string;
  publicId: string | null;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  avatar: string | null;
}
