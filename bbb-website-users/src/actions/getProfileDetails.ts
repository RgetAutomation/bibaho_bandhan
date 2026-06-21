import { ConnectionStatus } from "@/components/enum/connectionStatus";
import { AxiosResponse } from "@/components/interface/AxiosResponse";
import api from "@/lib/axiosInstance";

export interface ProfileProps {
  id: string;
  publicId: string;
  title: string;
  lastName: string;
  gender: string;
  age: number;
  avatar: string;
  dist: string;
  state: string;
  maritalStatus: string;
  religion: string;
  gotra: string;
  caste: string;
  subCaste: string;
  manglikDosh: boolean;
  language: string;
  receivedRequestId: string;
  receivedRequestStatus: ConnectionStatus;
  alreadySentRequest: boolean;
  alreadyBlocked: boolean;
  alreadyFriend: boolean;
  profileImages: IProfileImage[];

  children: number | null;
  speciallyAble: boolean | null;
  bloodGroup: string | null;
  height: string | null;
  weight: string | null;
  skinTone: string | null;
  bodyType: string | null;
  eatingHabits: string | null;
  drinkingHabits: string | null;
  smokingHabits: string | null;
  aboutMyself: string | null;
  profession: string | null;
  education: string | null;
  hobbies: string | null;
  monthlyIncome: string | null;
  
  firstName: string | null;
  middleName: string | null;
  dob: string | null;
  phone?: string | null;
  email?: string | null;
  motherTongue: string | null;
  spokenLanguages: string | null;

  employmentType: string | null;
  designation: string | null;
  workExperience: string | null;
  organizationName: string | null;
  
  collegeInstitution: string | null;
  fieldOfStudy: string | null;
  passingYear: string | null;

  country: string | null;
  townVillage: string | null;
  citizenship: string | null;
  ancestralOrigin: string | null;

  personalityTraits: string | null;
  lifeGoals: string | null;

  disabilityDetails: string | null;
  healthScreening: string | null;
  
  noOfBrothers: string | null;
  noOfSisters: string | null;
  familyStatus: string | null;
  familyType: string | null;
  familyValues: string | null;
  familyBackground: string | null;
  familyDescription: string | null;
  culturalValues: string | null;
  
  rashi: string | null;
  nakshatra: string | null;
  birthTime: string | null;
  cityOfBirth: string | null;
  countryOfBirth: string | null;

  partnerAgeRange: string | null;
  partnerHeightRange: string | null;
  partnerWeightRange: string | null;
  partnerMaritalStatus: string | null;
  partnerMotherTongue: string | null;
  partnerSpokenLanguages: string | null;
  partnerEmploymentType: string | null;
  partnerOccupation: string | null;
  partnerAnnualIncome: string | null;
  partnerMinimumQualification: string | null;
  partnerReligion: string | null;
  partnerCaste: string | null;
  partnerSubCaste: string | null;
  partnerGothra: string | null;
  partnerPreferredCountry: string | null;
  partnerPreferredState: string | null;
  partnerPreferredDistrict: string | null;
  partnerEatingHabit: string | null;
  partnerDrinkingHabit: string | null;
  partnerSmokingHabit: string | null;
  partnerDisabilityAcceptable: string | null;
  partnerDescription: string | null;
  partnerPersonalityExpectation: string | null;
  partnerFamilyExpectation: string | null;
  partnerFamilyDetails: string | null;
  familyStatusPreference: string | null;
  familyTypePreference: string | null;
  familyValuesPreference: string | null;

  familyMembers: string | null;
  fatherProfession: string | null;
  mothersOccupation: string | null;
  candidatePreference: string | null;
  locationPreference: string | null;
  aboutMyPartner: string | null;

  isGhotokOwned: boolean;
  ghotokPublicId: string;
  status: string;
}

export interface IProfileImage {
  id: string;
  url: string;
}

export async function getProfileDetails(
  profileId: string,
): Promise<ProfileProps> {
  const response = await api.get<AxiosResponse<ProfileProps>>(
    `/users/profile/${profileId}/view`,
    { withCredentials: true },
  );
  return response.data.data;
}
