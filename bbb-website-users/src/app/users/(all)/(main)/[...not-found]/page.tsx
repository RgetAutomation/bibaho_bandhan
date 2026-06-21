import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full min-h-[100vh] flex flex-col gap-4 md:gap-5 lg:gap-7 flex-1 md:min-h-min items-center justify-center">
      404 | Page Not Found
      <Button asChild>
        <Link href="/users">Back to Home</Link>
      </Button>
    </div>
  );
}
