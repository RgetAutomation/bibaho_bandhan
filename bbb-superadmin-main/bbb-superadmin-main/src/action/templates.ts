"use server";

import { redisService } from "@/components/helper/RedisService";
import {
  IMessageTemplate,
  IMessageTemplateCreate,
  IMessageTemplateUpdate,
  IRejectMessageTemplate,
  IRejectMessageTemplateCreate,
  IRejectMessageTemplateUpdate,
} from "@/components/interface/IMessageTemplate";
import { IServerResponse } from "@/components/interface/IServerResponse";
import { prisma } from "@/lib/prisma";

export async function getAllMessageTemplates(): Promise<IMessageTemplate[]> {
  try {
    const templates = await prisma.messageTemplate.findMany({
      where: { category: "ADMIN_MODERATOR" },
      select: {
        id: true,
        name: true,
        content: true,
        category: true,
        roles: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return templates;
  } catch (error) {
    console.error("Error fetching message templates:", error);
    return [];
  }
}

export async function getMessageTemplateById(
  id: string
): Promise<IMessageTemplate | null> {
  try {
    const template = await prisma.messageTemplate.findUnique({
      where: { id, category: "ADMIN_MODERATOR" },
    });
    return template as IMessageTemplate;
  } catch (error) {
    console.error("Error fetching plan:", error);
    return null;
  }
}

export async function createMessageTemplate(
  data: IMessageTemplateCreate
): Promise<IServerResponse> {
  try {
    await prisma.messageTemplate.create({
      data: {
        name: data.name,
        content: data.content,
        category: "ADMIN_MODERATOR",
        roles: data.roles,
      },
    });

    return {
      success: true,
      message: "Message template saved successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error saving message template:", error);
    return {
      success: false,
      message: "Failed to save message template.",
    } as IServerResponse;
  }
}

export async function updateMessageTemplate(
  mt: IMessageTemplateUpdate
): Promise<IServerResponse> {
  try {
    await prisma.messageTemplate.update({
      where: { id: mt.id, category: "ADMIN_MODERATOR" },
      data: mt,
    });

    return {
      success: true,
      message: "Message template updated successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error updating message template:", error);
    return {
      success: false,
      message: "Failed to update message template.",
    } as IServerResponse;
  }
}

export async function updateMessageTemplateStatus(
  id: string,
  status: boolean
): Promise<IServerResponse> {
  try {
    await prisma.messageTemplate.update({
      where: { id, category: "ADMIN_MODERATOR" },
      data: {
        isActive: status,
      },
    });
    const activeState = status ? "activated" : "deactivated";
    return {
      success: true,
      message: `Message template ${activeState} successfully.`,
    } as IServerResponse;
  } catch (error) {
    console.error("Error updating message template status:", error);
    return {
      success: false,
      message: "Failed to update message template status.",
    } as IServerResponse;
  }
}

export async function deleteMessageTemplate(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.messageTemplate.delete({ where: { id } });

    return {
      success: true,
      message: "Message template deleted successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error deleting message template:", error);
    return {
      success: false,
      message: "Failed to delete message template.",
    } as IServerResponse;
  }
}

//========================================================================

export async function getAllRejectMessageTemplates(): Promise<
  IRejectMessageTemplate[]
> {
  try {
    const templates = await prisma.messageTemplate.findMany({
      where: {
        category: "MODERATOR_MODERATION",
      },
      select: {
        id: true,
        name: true,
        content: true,
        category: true,
        roles: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return templates;
  } catch (error) {
    console.error("Error fetching message templates:", error);
    return [];
  }
}

export async function getRejectMessageTemplateById(
  id: string
): Promise<IRejectMessageTemplate | null> {
  try {
    const template = await prisma.messageTemplate.findUnique({
      where: { id, category: "MODERATOR_MODERATION" },
    });
    return template as IMessageTemplate;
  } catch (error) {
    console.error("Error fetching plan:", error);
    return null;
  }
}

export async function createRejectMessageTemplate(
  data: IRejectMessageTemplateCreate
): Promise<IServerResponse> {
  try {
    await prisma.messageTemplate.create({
      data: {
        name: data.name,
        content: data.content,
        roles: data.roles,
        category: "MODERATOR_MODERATION",
      },
    });

    return {
      success: true,
      message: "Template saved successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error saving message template:", error);
    return {
      success: false,
      message: "Failed to save template.",
    } as IServerResponse;
  }
}

export async function updateRejectMessageTemplate(
  mt: IRejectMessageTemplateUpdate
): Promise<IServerResponse> {
  try {
    await prisma.messageTemplate.update({
      where: { id: mt.id, category: "MODERATOR_MODERATION" },
      data: mt,
    });

    return {
      success: true,
      message: "Template updated successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error updating message template:", error);
    return {
      success: false,
      message: "Failed to update message template.",
    } as IServerResponse;
  }
}

export async function updateRejectMessageTemplateStatus(
  id: string,
  status: boolean
): Promise<IServerResponse> {
  try {
    const template = await prisma.messageTemplate.update({
      where: { id, category: "MODERATOR_MODERATION" },
      data: {
        isActive: status,
      },
      select: {
        name: true,
        content: true,
      },
    });

    if (status) {
      await redisService.setTemplate(id, template.name, template.content);
    } else {
      await redisService.deleteTemplate(id);
    }

    const activeState = status ? "activated" : "deactivated";
    return {
      success: true,
      message: `Template ${activeState} successfully.`,
    } as IServerResponse;
  } catch (error) {
    console.error("Error updating message template status:", error);
    return {
      success: false,
      message: "Failed to update message template status.",
    } as IServerResponse;
  }
}

export async function deleteRejectMessageTemplate(
  id: string
): Promise<IServerResponse> {
  try {
    await prisma.messageTemplate.delete({ where: { id } });
    await redisService.deleteTemplate(id);

    return {
      success: true,
      message: "Template deleted successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error deleting message template:", error);
    return {
      success: false,
      message: "Failed to delete message template.",
    } as IServerResponse;
  }
}
