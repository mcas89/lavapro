import { useNavigate } from "react-router";
import { TopBar } from "@/components/layout/TopBar";
import { CarFront, Clock, Store, Palette, Users } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  {
    icon: Store,
    label: "Empresa",
    description: "Dados e planos",
    path: "/app/configuracoes/empresa",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: CarFront,
    label: "Serviços",
    description: "Preços e lavagens",
    path: "/app/servicos",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Clock,
    label: "Horários",
    description: "Dias e intervalos",
    path: "/app/configuracoes/horarios",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Palette,
    label: "Tema",
    description: "Logo e cores",
    path: "/app/configuracoes/tema",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Users,
    label: "Equipe",
    description: "Funcionários",
    path: "/app/configuracoes/equipe",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { data: settingsList } = useCollection<any>("settings");
  const profileDoc = settingsList?.find((doc: any) => doc.id === "profile");
  const companyName = profileDoc?.company?.name || "Meu Lava-Rápido";

  return (
    <div className="pb-24">
      <TopBar title="Configurações" showBack backTo="/app/dashboard" />

      <div className="p-4 space-y-6">

        {/* Cabeçalho da empresa */}
        <div className="flex items-center gap-4 px-1">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Store className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">{companyName}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Gerencie todas as configurações do seu sistema</p>
          </div>
        </div>

        {/* Grid de ações — cards quadrados */}
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 mb-3">
            Configurações
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2.5 rounded-2xl p-4 aspect-square",
                    "bg-card border border-border shadow-sm",
                    "hover:border-primary/40 hover:shadow-md active:scale-95 transition-all duration-150"
                  )}
                >
                  <div className={`p-3 rounded-xl ${item.bg}`}>
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground leading-tight">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
