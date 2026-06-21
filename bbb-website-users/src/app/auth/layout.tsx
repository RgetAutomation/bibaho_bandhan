import FooterComponent from "@/components/landing/footer";
import HeaderComponent from "@/components/landing/header";

export default function OthersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <HeaderComponent menu={false} className="border-b" />
      {children}
      <FooterComponent />
    </main>
  );
}
