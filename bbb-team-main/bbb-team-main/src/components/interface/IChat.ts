import { TeamRole } from "../enum/TeamRole";
import { IMessage } from "./IMessage";
import { ITemplate } from "./ITemplate";

export interface IChatParticipants {
  id: string;
  internalId: string;
  gender: string;
  role: TeamRole;
}

export interface IChat {
  messages: IMessage[];
  participant: IChatParticipants;
  templates: ITemplate[];
}
