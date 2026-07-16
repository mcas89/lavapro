import { type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string | ReactNode;
  showBack?: boolean;
  backTo?: string;
  action?: ReactNode;
}

export function TopBar({ title, showBack = false, backTo, action }: TopBarProps) {
  const navigate = useNavigate();
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
