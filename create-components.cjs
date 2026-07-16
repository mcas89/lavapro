const fs = require('fs');
const path = require('path');

const layoutDir = path.join(__dirname, 'src', 'components', 'layout');
const sharedDir = path.join(__dirname, 'src', 'components', 'shared');

// --- FAB ---
const fabContent = `import { Button } from "@/components/ui/button";
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
`;

// --- BottomNavigation ---
const bottomNavContent = `import { NavLink } from "react-router";
import { Home, Calendar, Users, DollarSign, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const links = [
    { to: "/app/dashboard", icon: Home, label: "Início" },
    { to: "/app/agenda", icon: Calendar, label: "Agenda" },
    { to: "/app/clientes", icon: Users, label: "Clientes" },
    { to: "/app/financeiro", icon: DollarSign, label: "Financeiro" },
    { to: "/app/configuracoes", icon: Menu, label: "Menu" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full h-16 border-t bg-background flex items-center justify-around z-40 pb-safe">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground transition-colors",
                isActive && "text-primary"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
`;

// --- TopBar ---
const topBarContent = `import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  action?: ReactNode;
}

export function TopBar({ title, showBack = false, action }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
`;

// --- SearchBar ---
const searchBarContent = `import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SearchBar({ className, ...props }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-9" placeholder="Buscar..." {...props} />
    </div>
  );
}
`;

// --- EmptyState ---
const emptyStateContent = `import { ReactNode } from "react";
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
`;

// --- StatCard ---
const statCardContent = `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span className={trend.isPositive ? "text-success" : "text-destructive"}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
            {description && <span>{description}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
`;

// --- BottomSheet ---
const bottomSheetContent = `import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 mt-24 flex flex-col rounded-t-xl border bg-background shadow-lg h-[80vh]"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
`;

fs.writeFileSync(path.join(layoutDir, 'FloatingActionButton.tsx'), fabContent);
fs.writeFileSync(path.join(layoutDir, 'BottomNavigation.tsx'), bottomNavContent);
fs.writeFileSync(path.join(layoutDir, 'TopBar.tsx'), topBarContent);
fs.writeFileSync(path.join(sharedDir, 'SearchBar.tsx'), searchBarContent);
fs.writeFileSync(path.join(sharedDir, 'EmptyState.tsx'), emptyStateContent);
fs.writeFileSync(path.join(sharedDir, 'StatCard.tsx'), statCardContent);
fs.writeFileSync(path.join(sharedDir, 'BottomSheet.tsx'), bottomSheetContent);

console.log('Componentes customizados criados!');
