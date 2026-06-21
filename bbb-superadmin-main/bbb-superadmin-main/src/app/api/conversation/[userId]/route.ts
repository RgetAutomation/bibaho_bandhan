import { UserRole } from "@/components/enum/userRole";
import { RoleConversationType } from "@/components/utils/RoleConversationType";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
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

    const requestedUser = await prisma.team.findFirst({
      where: { id: userId },
      select: { id: true, role: true },
    });

    let messageType: RoleConversationType | undefined;

    if (requestedUser?.role === UserRole.ADMIN)
      messageType = RoleConversationType.SUPERADMIN_ADMIN;
    else if (requestedUser?.role === UserRole.MODERATOR)
      messageType = RoleConversationType.SUPERADMIN_MODERATOR;
    else if (requestedUser?.role === UserRole.GHOTOK)
      messageType = RoleConversationType.SUPERADMIN_GHOTOK;

    const conversation = await prisma.$transaction(async (tx) => {
      // 2️⃣ Try to find conversation
      let convo = await tx.teamConversation.findFirst({
        where: {
          AND: [
            { participants: { some: { id: requestedUser?.id } } },
            { participants: { some: { id: session.user.id } } },
          ],
        },
      });

      // 3️⃣ Create conversation if not exists
      if (!convo) {
        convo = await tx.teamConversation.create({
          data: {
            participants: {
              connect: [{ id: requestedUser?.id }, { id: session.user.id }],
            },
            type: messageType as RoleConversationType,
          },
        });
      }

      return convo;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Success",
        data: conversation.id,
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
