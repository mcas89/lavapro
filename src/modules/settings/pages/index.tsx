import { useNavigate } from "react-router";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Store, CarFront, Clock, Palette, Users, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: "Operacional",
      items: [
        { icon: CarFront, label: "Tabela de Serviços", description: "Gerencie preços e duração das lavagens.", path: "/app/servicos", color: "text-blue-500", bg: "bg-blue-500/10" },
        { icon: Clock, label: "Horários de Funcionamento", description: "Configure dias úteis e intervalos da agenda.", path: "/app/configuracoes/horarios", color: "text-green-500", bg: "bg-green-500/10" },
      ]
    },
    {
      title: "Administrativo",
      items: [
        { icon: Store, label: "Dados da Empresa", description: "Nome, CNPJ, Endereço e Contato.", path: "/app/configuracoes/empresa", color: "text-orange-500", bg: "bg-orange-500/10" },
        { icon: Palette, label: "Logotipo e Tema", description: "Personalize as cores do seu aplicativo.", path: "/app/configuracoes/tema", color: "text-purple-500", bg: "bg-purple-500/10" },
        { icon: Users, label: "Equipe e Usuários", description: "Cadastre funcionários e permissões.", path: "/app/configuracoes/equipe", color: "text-pink-500", bg: "bg-pink-500/10" },
      ]
    }
  ];

  return (
    <div className="pb-24">
      <TopBar title="Meu Lava-Rápido" showBack backTo="/app/dashboard" />

      <div className="p-4 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
              {group.title}
            </h2>
            <div className="grid gap-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Card 
                    key={item.path} 
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => navigate(item.path)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-3 rounded-full ${item.bg}`}>
                        <Icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{item.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
