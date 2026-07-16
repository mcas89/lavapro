import { type ReactNode } from "react";
import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = <FileQuestion className="h-12 w-12 text-muted-foreground/50" />, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
