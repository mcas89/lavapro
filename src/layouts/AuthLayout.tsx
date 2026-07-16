import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-sm p-6">
        <div className="mb-6 flex justify-center">
          <img src="/lavapro.png" alt="LavaPro Logo" className="h-20 w-auto object-contain" />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
