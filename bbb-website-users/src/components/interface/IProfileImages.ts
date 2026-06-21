export interface IProfileImageData {
  isProfileComplete: boolean;
  profileImages: IProfileImage[];
}

export interface IProfileImage {
  id: string;
  url: string;
}
