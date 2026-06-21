export interface IGhotokUserStatus {
  isProfileComplete: boolean;
  avatar: string;
  profileImages: IGhotokUserProfileImage[];
}

export interface IGhotokUserProfileImage {
  id: string;
  url: string;
}
