import { Metadata } from "next";
import RegisterClientPage from "./registerClientPage";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AUTHENTICATION_LOGIN } from "@/components/helper/constant";

export const metadata: Metadata = {
  title: "Register",
  description: "Create an account to find your perfect match.",
};

export default async function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 dark:bg-zinc-950 p-5">
      <div className="flex w-full sm:w-fit bg-card rounded-xl shadow-md items-center justify-center sm:items-start sm:justify-start border">
        <RegisterClientPage />
      </div>
      <div className="w-full sm:max-w-md md:max-w-lg mt-4 flex items-center justify-center gap-1 bg-card p-2 rounded-xl shadow-md border">
        <span>Already have an account?</span>
        <Button asChild variant={"outline"} className="rounded-full ml-2">
          <Link href={AUTHENTICATION_LOGIN}>Login</Link>
        </Button>
      </div>
    </div>
  );
}
