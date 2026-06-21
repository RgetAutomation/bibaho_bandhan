import FooterComponent from "@/components/landing/footer";
import HeaderComponent from "@/components/landing/header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <div className="sticky top-0 left-0 w-full z-50">
        <HeaderComponent landing={true} menu={true} />
      </div>
      {children}
      <FooterComponent />
    </main>
  );
}
