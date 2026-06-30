import { ConnectionStatus } from "../enum/connectionStatus";

export interface IConnectionRequest {
  id?: string;
  status: ConnectionStatus;
  onlineStatus: string;
  createdAt: Date;
  sender: {
    id: string;
    publicId: string;
    title: string;
    lastName: string;
    avatar: string;
    gender: "MALE" | "FEMALE";
    isGhotokOwned: boolean;
    profile: {
      age?: number;
      education: string;
      height: string;
      profession: string;
      subCaste: string;
      caste?: string;
      religion?: string;
      dist: string;
      state: string;
    };
  };
  receiver?: {
    id: string;
    publicId: string;
    title: string;
    lastName: string;
    avatar: string;
    gender: "MALE" | "FEMALE";
    isGhotokOwned: boolean;
    profile: {
      age?: number;
      education: string;
      height: string;
      profession: string;
      subCaste: string;
      caste?: string;
      religion?: string;
      dist: string;
      state: string;
    };
  };
}
