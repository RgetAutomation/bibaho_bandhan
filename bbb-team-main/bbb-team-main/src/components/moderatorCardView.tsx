import { addIdPrefix } from "@/lib/utils";
import { IAdminModerator } from "./interface/IAdminModerator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { TeamRole } from "./enum/TeamRole";
import { Badge } from "./ui/badge";
import { useModeratorNotificationStore } from "@/hooks/moderator/useModeratorNotificationStore";

export function AdminModeratorCardView({
  team,
  onlyLoad = false,
}: {
  team: IAdminModerator;
  onlyLoad?: boolean;
}) {
  const { adminModeratorConversationIds } = useModeratorNotificationStore();
  return (
    <div className="bg-card flex items-center gap-4 rounded-2xl border p-4 shadow-md transition-all duration-150 hover:scale-102">
      <Avatar className="size-12">
        <AvatarImage
          src={
            onlyLoad
              ? "/groom.webp"
              : team.gender === "MALE"
                ? "/groom.webp"
                : "/bride.webp"
          }
          alt={team.id}
        />
        <AvatarFallback>{team.gender.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-base font-semibold">{team.internalId}</h1>
        {adminModeratorConversationIds.includes(team.conversationId) && (
          <Badge className="rounded-full text-xs">New Message</Badge>
        )}
      </div>
    </div>
  );
}
