export const dynamic = "force-dynamic";

import { getAllFeedbacks } from "@/action/feedbacks";
import FeedbackClientPage from "./feedbackClient";
import { headers } from "next/headers";
import { checkAuthAndGetSession } from "@/components/helper/checkAuthAndGetSession";

export default async function FeedbacksPage() {
  await checkAuthAndGetSession(await headers());
  const feedbacks = await getAllFeedbacks();
  return <FeedbackClientPage feedbacks={feedbacks} />;
}
