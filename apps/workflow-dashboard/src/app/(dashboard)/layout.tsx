import { AppHeader } from '@/components/shared/app-header';
import { AppNav } from '@/components/shared/nav-link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">W</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold">Wavelaunch</h1>
              <p className="text-xs text-muted-foreground">Workflow v1.0</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-4 px-3">
          <AppNav />
        </div>
        <div className="p-4 border-t text-xs text-muted-foreground">
          <p>© 2024 Wavelaunch</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
