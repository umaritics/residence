import { AppSidebar } from "@/components/residence/AppSidebar";
import { AppHeader } from "@/components/residence/AppHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-muted/20 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
