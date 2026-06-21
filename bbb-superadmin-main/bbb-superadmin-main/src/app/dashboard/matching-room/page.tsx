export const dynamic = "force-dynamic";

import { getMatchingRoom } from "@/action/matching";
import { EpmptyList } from "@/components/emptyList";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import ConversationCard from "./matchingRoomClient";

export default async function MatchingRoomPage() {
  await checkAuthAndGetSession(await headers());
  const matchingRoom = await getMatchingRoom();

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-card flex flex-col items-center justify-between gap-4 border p-4 md:flex-row md:p-6">
        {/* Left: Title + Search */}
        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-gray-100">
            Matching Room
          </h1>
          {/* <Input
            placeholder="Search ghotok..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-64"
          /> */}
        </div>
      </div>
      {matchingRoom.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-6 lg:grid-cols-3">
          {matchingRoom.map((room) => (
            <ConversationCard key={room.id} data={room} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4">
          <EpmptyList
            title="No Matching Room Found"
            subtitle="No matching room found here. Please add some data to get started."
          />
        </div>
      )}
    </div>
  );
}
