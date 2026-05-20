export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">W</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Wavelaunch Workflow</h1>
            <p className="text-xs text-muted-foreground">Automation Dashboard</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span>v1.0</span>
        </div>
      </div>
    </header>
  );
}
