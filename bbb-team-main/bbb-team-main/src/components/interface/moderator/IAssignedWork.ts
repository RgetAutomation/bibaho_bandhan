export interface IAssignedWork {
  id: string;
  convId: string;
  participants: IAssignedWorkParticipant[];
}

export interface IAssignedWorkParticipant {
  id: string;
  title: string;
  lastName: string;
  gender: string;
}
