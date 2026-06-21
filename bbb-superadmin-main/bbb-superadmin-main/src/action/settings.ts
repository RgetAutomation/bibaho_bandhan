"use server";

import { IServerResponse } from "@/components/interface/IServerResponse";
import { prisma } from "@/lib/prisma";

export async function getSystemSettings() {
  try {
    const settings = await prisma.systemSettings.findFirst();
    return settings;
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return null;
  }
}

export async function saveSystemSettings(data: any): Promise<IServerResponse> {
  try {
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      await prisma.systemSettings.create({
        data: {
          smtpHost: data.smtpHost,
          smtpPort: data.smtpPort ? parseInt(data.smtpPort) : null,
          smtpUser: data.smtpUser,
          smtpPass: data.smtpPass,
          smsGatewayUrl: data.smsGatewayUrl,
          smsApiKey: data.smsApiKey,
        },
      });
    } else {
      await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          smtpHost: data.smtpHost,
          smtpPort: data.smtpPort ? parseInt(data.smtpPort) : null,
          smtpUser: data.smtpUser,
          smtpPass: data.smtpPass,
          smsGatewayUrl: data.smsGatewayUrl,
          smsApiKey: data.smsApiKey,
        },
      });
    }

    return {
      success: true,
      message: "Settings saved successfully.",
    } as IServerResponse;
  } catch (error) {
    console.error("Error saving system settings:", error);
    return {
      success: false,
      message: "Failed to save settings.",
    } as IServerResponse;
  }
}
