import {
  getLoggedInSession,
  ILoggedInSession,
  SessionType,
} from "@/components/helper/getSession";
import { SocketProvider } from "@/components/helper/SocketContext";
import { ThemeSwitcher } from "@/components/helper/theme-switcher";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import InternetDetectClient from "./internetDetectClient";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: ILoggedInSession | undefined = await getLoggedInSession(
    SessionType.SESSION
  );
  if (!session) redirect("/auth/login");
  return (
    <InternetDetectClient>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-between gap-2 px-4">
              <div>
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {/* <HeaderBreadcrumbs /> */}
              </div>
              <ThemeSwitcher />
            </div>
          </header>
          <div className="flex h-svh flex-1 flex-col md:min-h-min">
            <SocketProvider token={`TEAM_${session.token}`}>
              {children}
            </SocketProvider>
            <Toaster />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </InternetDetectClient>
  );
}
