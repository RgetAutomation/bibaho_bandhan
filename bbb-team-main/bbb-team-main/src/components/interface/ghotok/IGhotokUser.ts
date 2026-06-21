import { IGhotokUserProfileImage } from "./IGhotokUserStatus";
export interface IGhotokUser {
  id: string;
  publicId?: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  phone: string;
  avatar: string | null;
  isProfileComplete: boolean;
  blocked: boolean;
}

export interface IGhotokUserProfile {
  id: string;
  publicId: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  age: number;
  phone: string;
  type: string;
  avatar: string;
  isProfilePublic: boolean;
  allowSocialPublish: boolean;

  profile: {
    dist: string;
    state: string;
    maritalStatus: string;
    religion: string;
    gotra: string;
    caste: string;
    subCaste: string;
    manglikDosh: boolean;
    language: string;
    profileImages: IGhotokUserProfileImage[];

    children: number | null;
    speciallyAble: boolean | null;
    bloodGroup: string;
    height: string | null;
    weight: string | null;
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
    familyMembers: string | null;
    fatherProfession: string | null;
    candidatePreference: string | null;
    locationPreference: string | null;
    aboutMyPartner: string | null;
  };
}

export interface IGhotokUserProfileEdit {
  id: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  dob: string;
  type: string;
  avatar: string;
  isProfilePublic: boolean;
  allowSocialPublish: boolean;

  addressLine1: string;
  addressLine2: string;
  postOffice: string;
  policeStation: string;
  dist: string;
  state: string;
  pinCode: string;
  whatsappNumber: string;
  alternatePhone: string;

  maritalStatus: string;
  religion: string;
  gotra: string;
  caste: string;
  subCaste: string;
  manglikDosh: boolean;
  language: string;
  profileImages: IGhotokUserProfileImage[];

  children: number | null;
  speciallyAble: boolean | null;
  bloodGroup: string;
  height: string | null;
  weight: string | null;
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
  familyMembers: string | null;
  fatherProfession: string | null;
  candidatePreference: string | null;
  locationPreference: string | null;
  aboutMyPartner: string | null;
}
