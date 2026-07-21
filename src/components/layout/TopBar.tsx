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
  let warningType = ""; // "pre" ou "post"
  let isTrial = false;
  
  if (profileDoc && profileDoc.validUntil) {
    const validUntilDate = new Date(profileDoc.validUntil + "T00:00:00");
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.round((today.getTime() - validUntilDate.getTime()) / (1000 * 60 * 60 * 24));
    
    isTrial = !profileDoc.paymentHistory || profileDoc.paymentHistory.length === 0;

    // Alertas antes do vencimento (Dia 6, Dia 7)
    if (diffDays === -2 || diffDays === -1 || diffDays === 0) {
      isWarningDay = true;
      warningType = "pre";
      remainingDays = Math.abs(diffDays); // 2, 1, ou 0 (hoje)
    }
    // Alertas pós vencimento (Prazo de tolerância) apenas para Mensais
    else if (!isTrial && diffDays > 0 && diffDays <= 3) {
      isWarningDay = true;
      warningType = "post";
      remainingDays = 3 - diffDays; // Falta X dias pro bloqueio total
    }
  }

  if (isWarningDay) {
    const isPost = warningType === "post";
    const bgClass = isPost || remainingDays === 0 ? "bg-red-600" : "bg-amber-500";
    
    let title = "";
    let subtitle = "";
    
    if (warningType === "pre") {
      title = isTrial ? "Fim do Período de Teste" : "Atenção à Assinatura";
      if (remainingDays === 0) {
        subtitle = isTrial ? "Seu período de teste termina hoje!" : "Seu período ativo termina hoje!";
      } else {
        subtitle = isTrial ? `Seu período de teste termina em ${remainingDays} dia${remainingDays === 1 ? '' : 's'}.` : `Seu período ativo termina em ${remainingDays} dia${remainingDays === 1 ? '' : 's'}.`;
      }
    } else {
      title = "Assinatura Vencida";
      subtitle = remainingDays === 0 ? "Último dia antes do bloqueio" : `Bloqueio em ${remainingDays} dia${remainingDays === 1 ? '' : 's'}`;
    }

    return (
      <header className={`sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 text-white shadow-sm ${bgClass}`}>
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
            <h1 className="text-sm font-bold uppercase tracking-wide">{title}</h1>
            <span className="text-[10px] font-medium opacity-90">{subtitle}</span>
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
