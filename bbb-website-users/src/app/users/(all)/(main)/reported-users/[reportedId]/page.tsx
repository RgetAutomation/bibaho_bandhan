import ReportedUserClientPage from "./clientPage";

export default async function SingleReportedUser({
  params,
}: {
  params: Promise<{ reportedId: string }>;
}) {
  const { reportedId } = await params;
  return <ReportedUserClientPage reportedId={reportedId} />;
}
