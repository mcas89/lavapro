import { useEffect, useState } from "react";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Começa o fade out após 2000ms
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Remove a tela totalmente da DOM após 2500ms
    const removeTimer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <img 
          src="/lavapro.png" 
          alt="LavaPro Logo" 
          className="w-64 md:w-72 h-auto object-contain mb-8 drop-shadow-2xl"
        />
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
