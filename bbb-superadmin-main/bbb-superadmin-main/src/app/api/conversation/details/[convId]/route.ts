import { UserRole } from "@/components/enum/userRole";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ convId: string }> }
) {
  try {
    const { convId } = await params;

    if (!convId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
          data: null,
        },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (session?.user?.role !== UserRole.SUPERADMIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          data: null,
        },
        { status: 401 }
      );
    }

    const conversation = await prisma.teamConversation.findFirst({
      where: {
        id: convId,
      },
      select: {
        id: true,
        participants: {
          where: { NOT: { id: session.user.id } },
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            gender: true,
            avatar: true,
          },
          take: 1,
        },
        messages: {
          select: {
            id: true,
            content: true,
            senderTeamId: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          message: "Conversation not found",
          data: null,
        },
        { status: 404 }
      );
    }

    const formattedData = {
      id: conversation.id,
      participants: conversation.participants[0],
      messages: conversation.messages,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: formattedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get conversation",
        data: null,
      },
      { status: 500 }
    );
  }
}
