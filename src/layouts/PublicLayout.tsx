import { Outlet } from "react-router";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b h-14 flex items-center px-4">
        <h1 className="text-xl font-bold text-primary">LavaPro</h1>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
