export interface IPublicUserProfile {
  id: string;
  publicId: string;
  title: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  avatar: string | null;
  age: number;
  profileImages: IPublicUserProfileImages[];

  dist: string | null;
  state: string | null;

  maritalStatus: string;
  children: number | null;
  speciallyAble: boolean;

  religion: string | null;
  gotra: string | null;
  caste: string | null;
  subCaste: string | null;
  manglikDosh: boolean;

  height: string | null;
  weight: string | null;
  bloodGroup: string | null;

  skinTone: string | null;
  bodyType: string | null;
  eatingHabits: string | null;
  drinkingHabits: string | null;
  smokingHabits: string | null;

  profession: string | null;
  education: string | null;
  hobbies: string | null;

  monthlyIncome: string | null;
  language: string | null;
  familyMembers: number | null;
  fatherProfession: string | null;

  candidatePreference: string | null;
  locationPreference: string | null;
  aboutMyself: string | null;
  aboutMyPartner: string | null;

  isGhotokOwned: boolean;
  ghotokPublicId: string | null;
}

export interface IPublicUserProfileImages {
  id: string;
  url: string;
}
