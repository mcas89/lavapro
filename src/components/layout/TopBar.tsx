import { type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

import { useCollection } from "@/hooks/useCollection";

interface TopBarProps {
  title: string | ReactNode;
  showBack?: boolean;
  backTo?: string;
  action?: ReactNode;
}

export function TopBar({ title, showBack = false, backTo, action }: TopBarProps) {
  const navigate = useNavigate();
  const { data: settingsList } = useCollection<any>("settings");
  const profileDoc = settingsList?.find((doc: any) => doc.id === "profile");
  
  let isWarningDay = false;
  let remainingDays = 0;
  if (profileDoc && profileDoc.validUntil) {
    const validUntilDate = new Date(profileDoc.validUntil + "T00:00:00");
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.round((today.getTime() - validUntilDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 2 || diffDays === 3) {
      isWarningDay = true;
      remainingDays = 3 - diffDays; // se diffDays for 2, falta 1. se for 3, falta 0 (último dia).
    }
  }

  if (isWarningDay) {
    return (
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 bg-red-600 text-white">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => backTo ? navigate(backTo) : navigate(-1)} 
              className="-ml-2 h-9 w-9 text-white hover:text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wide">Assinatura Vencida</h1>
            <span className="text-[10px] font-medium opacity-90">
              {remainingDays === 0 ? "Último dia antes do bloqueio" : `Bloqueio em ${remainingDays} dia${remainingDays === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>
        {action && <div>{action}</div>}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => backTo ? navigate(backTo) : navigate(-1)} 
            className="-ml-2 h-9 w-9"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
