import { AppSidebar } from "@/components/sidebar/app-sidebar";
//import { HeaderBreadcrumbs } from "@/components/sidebar/header-breadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
//import { redirect } from "next/navigation";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { ThemeSwitcher } from "@/components/helper/system/theme-switcher";
import { QueryProviders } from "@/components/helper/system/queryClientProvider";
import { SocketProvider } from "@/components/helper/system/SocketContext";
import {
  getLoggedInSession,
  ISession,
  SessionType,
} from "@/components/helper/getSession";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: ISession | undefined = await getLoggedInSession(
    SessionType.BOTH
  );
  if (!session) redirect("/auth/login");
  else
    return (
      <SidebarProvider>
        <SocketProvider token={`TEAM_${session.session.token}`}>
          <QueryProviders>
            <AppSidebar userId={session.user.id} role={session.user.role} />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  {/* <HeaderBreadcrumbs /> */}
                </div>
                <div className="pe-4">
                  <ThemeSwitcher />
                </div>
              </header>
              <div className="flex h-svh flex-1 flex-col md:min-h-min">
                {children}
                <Toaster />
              </div>
            </SidebarInset>
          </QueryProviders>
        </SocketProvider>
      </SidebarProvider>
    );
}
