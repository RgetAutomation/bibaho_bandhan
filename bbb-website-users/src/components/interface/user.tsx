export interface CurrentUser {
  id: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  avatar: string;
  gender: "MALE" | "FEMALE";
  email: string;
  phone: string;
  type: "FREE" | "PAID";
  accessToken: string;
  refreshToken: string;
  planExpiryDate: Date;
}

export interface AllUsers {
  id: string;
  publicId: string;
  title: string;
  lastName: string;
  avatar?: string | null;
  gender: "MALE" | "FEMALE"; // Or use `Gender` enum if imported
  type: "FREE" | "PAID"; // Adjust based on your actual enum/string union
  isGhotokOwned: boolean;
  profile: {
    dist?: string | null;
    state?: string | null;
    age?: number | null; // Optional: added after dob is transformed
    height?: string | null;
    profession?: string | null;
    education?: string | null;
    subCaste?: string | null;
  };
  status: string;
  isInterestReceived: boolean;
  isInterestSent: boolean;
}
