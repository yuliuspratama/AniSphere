import { MainNavigation } from "@/components/layout/main-navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MainNavigation />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
    </div>
  );
}

