import { useSearchParams } from "react-router";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, Edit, Trash2 } from "lucide-react";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { useCollection } from "@/hooks/useCollection";
import { db } from "@/lib/db";

export default function TeamPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: team, loading } = useCollection<any>("team");

  const openNewMember = () => {
    searchParams.set("newMember", "true");
    setSearchParams(searchParams);
  };

  return (
    <div className="pb-24">
      <TopBar title="Funcionários" showBack backTo="/app/configuracoes" />

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Lista de Funcionários</h2>
            <p className="text-xs text-muted-foreground">Gerencie o time e pagamentos.</p>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
             <div className="text-center py-4 text-muted-foreground text-sm">Carregando...</div>
          ) : team.length === 0 ? (
             <div className="text-center py-4 text-muted-foreground text-sm">Nenhum funcionário cadastrado.</div>
          ) : (
            team.map((member: any) => (
              <Card key={member.id} className="border-none shadow-sm bg-card">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {member.initial}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{member.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{member.phone || "Sem telefone"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {member.salaryAmount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                          R$ {member.salaryAmount.toFixed(2)} ({member.salaryType})
                        </div>
                      )}
                      {member.paymentDate && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-500/10 w-fit px-2 py-0.5 rounded-full">
                          Pagamento: Dia {member.paymentDate}
                        </div>
                      )}
                      {member.startDate && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted w-fit px-2 py-0.5 rounded-full">
                          Desde: {member.startDate.split('-').reverse().join('/')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => {
                      searchParams.set("newMember", "true");
                      searchParams.set("editMember", member.id);
                      setSearchParams(searchParams);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={async () => {
                      if (window.confirm(`Tem certeza que deseja excluir ${member.name}?`)) {
                        await db.deleteDoc("team", member.id);
                      }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <FloatingActionButton 
        icon={<UserPlus className="h-6 w-6" />} 
        onClick={openNewMember} 
      />
    </div>
  );
}
