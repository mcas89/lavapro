import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-sm p-6">
        <div className="mb-6 flex justify-center">
          <img src="/lavapro.png" alt="LavaPro Logo" className="h-20 w-auto object-contain" />
        </div>
        <Outlet />
      </div>

      {/* Botão de Download */}
      <div className="mt-8 text-center">
        <a 
          href="#" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar Aplicativo
        </a>
        <p className="text-xs text-muted-foreground mt-3">Disponível para Android</p>
      </div>
    </div>
  );
}
