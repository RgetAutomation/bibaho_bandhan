import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function MainPage() {
  redirect("/dashboard");
  return (
    <div className="w-full h-screen md:min-h-min flex flex-col flex-1 items-center justify-center">
      {/* <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button> */}
    </div>
  );
}
