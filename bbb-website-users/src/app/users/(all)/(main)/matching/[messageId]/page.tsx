import MatchingPaymentClient from "./matchingPaymentClient";

export default async function PaidMatchingPaymentPage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;
  return <MatchingPaymentClient messageId={messageId} />;
}
