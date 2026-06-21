import { QueryProviders } from "@/components/helper/system/queryClientProvider";
import { Toaster } from "react-hot-toast";

export default function ProfileCompleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProviders>
      {children}
      <Toaster />
    </QueryProviders>
  );
}
