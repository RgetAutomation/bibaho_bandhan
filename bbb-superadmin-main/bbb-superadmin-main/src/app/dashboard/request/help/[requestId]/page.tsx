import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";
import { headers } from "next/headers";
import RequestClientPage from "./requestClient";

export default async function HelpRequestDetailPage(props: {
  params: Promise<{ requestId: string }>;
}) {
  const user = await checkAuthAndGetSession(await headers());
  const params = await props.params;

  return (
    <div className="flex h-screen flex-1 flex-col items-center justify-center">
      <RequestClientPage requestId={params.requestId} currentUserId={user.id} />
    </div>
  );
}
