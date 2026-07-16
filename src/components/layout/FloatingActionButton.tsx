import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export function FloatingActionButton({ icon = <Plus className="h-6 w-6" />, className, ...props }: FABProps) {
  return (
    <Button
      className={cn("fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40 md:bottom-6", className)}
      size="icon"
      {...props}
    >
      {icon}
    </Button>
  );
}
