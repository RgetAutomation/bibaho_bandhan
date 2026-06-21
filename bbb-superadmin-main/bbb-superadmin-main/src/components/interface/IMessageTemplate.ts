import { TeamRole } from "@prisma/client";

export interface IMessageTemplate {
  id: string;
  name: string;
  content: string;
  //category: string;
  roles: TeamRole[];
  isActive: boolean;
  createdAt: Date;
}

export type IMessageTemplateCreate = Omit<
  IMessageTemplate,
  "id" | "isActive" | "createdAt"
>;

export type IMessageTemplateUpdate = Omit<
  IMessageTemplate,
  "isActive" | "createdAt"
>;

export interface IRejectMessageTemplate {
  id: string;
  name: string;
  content: string;
  roles: TeamRole[];
  isActive: boolean;
  createdAt: Date;
}

export type IRejectMessageTemplateCreate = Omit<
  IRejectMessageTemplate,
  "id" | "isActive" | "createdAt"
>;

export type IRejectMessageTemplateUpdate = Omit<
  IRejectMessageTemplate,
  "isActive" | "createdAt"
>;
