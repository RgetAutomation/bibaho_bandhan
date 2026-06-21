export interface IAssignedAuditLogs {
  id: string;
  conversationId: string;
  convId: string;
  createdAt: Date;
  moderator: IAssignedAuditLogsModerator;
  participants: IAssignedAuditLogsParticipants[];
}

export interface IAssignedAuditLogsParticipants {
  id: string;
  title: string;
  lastName: string;
  gender: string;
  avatar?: string;
}

export interface IAssignedAuditLogsModerator {
  id: string;
  internalId: string;
  gender: string;
}
