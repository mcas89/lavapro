import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: ReactNode;
  isActive?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                item.isActive ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 bg-background text-muted-foreground"
              )}
            >
              {item.icon || <div className="h-2 w-2 rounded-full bg-current" />}
            </div>
            {index < items.length - 1 && <div className="w-0.5 flex-1 bg-border my-2" />}
          </div>
          <div className="flex-1 pb-4">
            <h4 className={cn("font-semibold", item.isActive ? "text-foreground" : "text-muted-foreground")}>
              {item.title}
            </h4>
            {item.date && <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>}
            {item.description && <p className="text-sm mt-1 text-muted-foreground">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
