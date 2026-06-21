export interface IPublicProfile {
  id: string;
  title: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  avatar: string;
  profile: IPublicProfileOther | null;
}

export interface IPublicProfileOther {
  dob: string;
  dist: string;
  state: string;
}
