import { useEffect, useState } from "react";
import { RouterProvider } from "react-router";
import { QueryProvider } from "@/providers/QueryProvider";
import { router } from "@/routes";
import { Toaster } from "@/components/ui/toaster";
import { SplashScreen } from "@/components/shared/SplashScreen";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem("lavapro_theme") || "blue";
    document.documentElement.className = `theme-${theme}`;
  }, []);

  return (
    <QueryProvider>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <RouterProvider router={router} />
      <Toaster />
    </QueryProvider>
  );
}
