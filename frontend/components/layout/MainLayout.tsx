import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col h-screen overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}