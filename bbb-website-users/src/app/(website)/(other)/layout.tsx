import ConditionalFooter from "@/components/landing/ConditionalFooter";
import HeaderComponent from "@/components/landing/header";

export default function OthersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-dvh">
      <HeaderComponent menu={false} className="sticky top-0 z-50 bg-background border-b border-border shadow-sm" />
      <div className="flex-1">
        {children}
      </div>
      <ConditionalFooter />
    </div>
  );
}
