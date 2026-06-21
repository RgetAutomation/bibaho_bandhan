import HelpRequestStatusClient from "./statusClient";

export default async function RequestedSuccessPage({
  params,
}: Readonly<{
  params: Promise<{ requestId: string }>;
}>) {
  const { requestId } = await params;
  return <HelpRequestStatusClient requestId={requestId} />;
}
