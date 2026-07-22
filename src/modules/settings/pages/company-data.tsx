import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save, Store, Crown, CalendarClock, ShieldAlert, CheckCircle2,
  Users, CarFront, Wrench, CreditCard, Loader2,
  Zap, Star, ReceiptText, ChevronRight, Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { useCollection } from "@/hooks/useCollection";
import { cn } from "@/lib/utils";

const INFINITEPAY_HANDLE = "mcas-89";

const PLANS = [
  {
    id: "test",
    label: "Teste",
    price: "R$ 1,00",
    cents: 100,
    days: 30,
    description: "Ambiente de teste",
    icon: Zap,
    color: "from-slate-600 to-slate-700",
    highlight: false,
    order_nsu_prefix: "30dias",
  },
  {
    id: "monthly",
    label: "Mensal",
    price: "R$ 29,90",
    cents: 2990,
    days: 30,
    description: "+30 dias de acesso",
    icon: Star,
    color: "from-blue-600 to-indigo-700",
    highlight: true,
    order_nsu_prefix: "30dias",
  },
  {
    id: "yearly",
    label: "Anual",
    price: "R$ 299,90",
    cents: 29990,
    days: 365,
    description: "+365 dias — 2 meses grátis",
    icon: Sparkles,
    color: "from-violet-600 to-purple-700",
    highlight: false,
    order_nsu_prefix: "365dias",
  },
];

export default function CompanyDataPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: settingsList, loading: settingsLoading } = useCollection<any>("settings");
  const { data: customers } = useCollection<any>("customers");
  const { data: services } = useCollection<any>("services");
  const { data: team } = useCollection<any>("team");
  const { data: workOrders } = useCollection<any>("workOrders");

  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    address: "",
    phone: "",
  });

  const profileDoc = settingsList?.find((doc: any) => doc.id === "profile");

  // Status de vencimento
  const validUntilStr = profileDoc?.validUntil;
  const validUntil = validUntilStr ? new Date(validUntilStr + "T00:00:00") : null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const isLifetime = !validUntil;
  const isExpired = validUntil ? now > validUntil : false;
  const isTrial = !profileDoc?.paymentHistory || profileDoc.paymentHistory.length === 0;

  let daysRemaining = 0;
  if (validUntil) {
    const diffTime = validUntil.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Histórico de pagamentos (mais recente primeiro)
  const paymentHistory: any[] = profileDoc?.paymentHistory
    ? [...profileDoc.paymentHistory].sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  // Métricas do mês
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const ordersThisMonth = workOrders.filter((o: any) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  useEffect(() => {
    if (!settingsLoading && profileDoc?.company) {
      setFormData({
        name: profileDoc.company.name || "",
        cnpj: profileDoc.company.cnpj || "",
        address: profileDoc.company.address || "",
        phone: profileDoc.company.phone || "",
      });
    }
  }, [settingsList, settingsLoading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profileDoc) {
        await db.updateDoc("settings", "profile", { company: formData });
      } else {
        await db.setDoc("settings", "profile", { company: formData });
      }
      toast({ title: "Dados salvos!", description: "Informações da empresa atualizadas." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async (plan: typeof PLANS[0]) => {
    setLoadingPlan(plan.id);
    try {
      const order_nsu = `${plan.order_nsu_prefix}-${Date.now()}`;
      const redirect_url = `${window.location.origin}/app/verificar-pagamento`;

      const response = await fetch("https://api.checkout.infinitepay.io/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: INFINITEPAY_HANDLE,
          order_nsu,
          redirect_url,
          items: [
            {
              quantity: 1,
              price: plan.cents,
              description: `LavaPro - ${plan.label} (${plan.days} dias)`,
            },
          ],
          customer: {
            name: formData.name || "Cliente LavaPro",
          },
        }),
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não retornada.");
      }
    } catch (err) {
      toast({
        title: "Erro ao gerar link",
        description: "Não foi possível conectar com a InfinitePay. Tente novamente.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setLoadingPlan(null);
    }
  };

  // Status badge config
  const statusConfig = isLifetime
    ? { label: "Vitalício (Pioneiro)", color: "text-emerald-400", bg: "from-emerald-600 to-teal-700", Icon: CheckCircle2 }
    : isExpired
    ? { label: "Assinatura Vencida", color: "text-red-300", bg: "from-red-700 to-rose-800", Icon: ShieldAlert }
    : isTrial
    ? { label: "Período de Teste", color: "text-amber-300", bg: "from-amber-600 to-orange-700", Icon: Zap }
    : { label: "Plano Ativo", color: "text-blue-200", bg: "from-blue-600 to-indigo-700", Icon: CalendarClock };

  return (
    <div className="pb-24">
      <TopBar title="Minha Empresa" showBack backTo="/app/configuracoes" />

      <div className="p-4 space-y-5">

        {/* ── CARD 1: STATUS DA ASSINATURA ─────────────────── */}
        <Card className={`border-none shadow-lg bg-gradient-to-br ${statusConfig.bg} text-white overflow-hidden relative`}>
          <Crown className="absolute -right-6 -bottom-6 h-36 w-36 text-white/10 rotate-12" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-base font-bold flex items-center gap-2 opacity-90 uppercase tracking-wider">
              <Crown className="h-4 w-4 text-yellow-300" />
              Minha Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">

            {/* Status + validade */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <statusConfig.Icon className={`h-8 w-8 ${statusConfig.color} flex-shrink-0`} />
                <div>
                  <p className="font-bold text-lg leading-tight">{statusConfig.label}</p>
                  {!isLifetime && (
                    <p className={cn("text-xs mt-0.5", isExpired ? "text-red-200" : "text-white/80")}>
                      {isExpired
                        ? "Acesso bloqueado"
                        : `${daysRemaining} dia${daysRemaining === 1 ? "" : "s"} restante${daysRemaining === 1 ? "" : "s"}`}
                    </p>
                  )}
                </div>
              </div>
              {!isLifetime && validUntil && (
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Vence em</p>
                  <p className="font-bold text-sm">{validUntil.toLocaleDateString("pt-BR")}</p>
                </div>
              )}
            </div>

            {/* Planos de assinatura */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-3">
                Escolha um Plano
              </p>
              <div className="space-y-2">
                {PLANS.map((plan) => {
                  const PlanIcon = plan.icon;
                  const isLoading = loadingPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => handleCheckout(plan)}
                      disabled={!!loadingPlan}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all",
                        plan.highlight
                          ? "bg-white text-blue-700 shadow-lg font-bold hover:bg-blue-50"
                          : "bg-white/15 text-white border border-white/25 hover:bg-white/25 font-semibold"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <PlanIcon className="h-5 w-5 flex-shrink-0" />
                        )}
                        <div className="text-left">
                          <p className="text-sm leading-tight">{plan.label}</p>
                          <p className={cn("text-[11px]", plan.highlight ? "text-blue-500" : "opacity-70")}>
                            {plan.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold">{plan.price}</span>
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── CARD 2: MÉTRICAS OPERACIONAIS ────────────────── */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 mb-3">
            Visão Geral do Negócio
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: "Clientes", value: customers.length, color: "text-blue-500", bg: "bg-blue-500/10" },
              { icon: Wrench, label: "Serviços", value: services.length, color: "text-purple-500", bg: "bg-purple-500/10" },
              { icon: Users, label: "Equipe", value: team.length, color: "text-pink-500", bg: "bg-pink-500/10" },
              { icon: CarFront, label: "OS este mês", value: ordersThisMonth.length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            ].map((metric) => {
              const MetricIcon = metric.icon;
              return (
                <Card key={metric.label} className="border-none shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${metric.bg} flex-shrink-0`}>
                      <MetricIcon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                      <p className="text-2xl font-black text-foreground">{metric.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── CARD 3: DADOS DA EMPRESA ──────────────────────── */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 mb-3">
            Dados da Empresa
          </h2>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Informações do Estabelecimento</h3>
                  <p className="text-xs text-muted-foreground">Aparece nos recibos e na agenda pública.</p>
                </div>
              </div>

              {[
                { label: "Nome do Lava-Rápido *", key: "name", placeholder: "Ex: Acqua Limp" },
                { label: "CNPJ (Opcional)", key: "cnpj", placeholder: "00.000.000/0000-00" },
                { label: "WhatsApp Comercial", key: "phone", placeholder: "(11) 99999-9999" },
                { label: "Endereço Completo", key: "address", placeholder: "Rua das Flores, 123 — Centro" },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">{field.label}</label>
                  <Input
                    placeholder={field.placeholder}
                    className="h-12"
                    value={(formData as any)[field.key]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  />
                </div>
              ))}

              <Button
                className="w-full h-12 font-bold rounded-xl mt-2"
                disabled={!formData.name || saving}
                onClick={handleSave}
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── CARD 4: HISTÓRICO DE PAGAMENTOS ──────────────── */}
        <div>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 mb-3">
            Histórico de Pagamentos
          </h2>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8 flex flex-col items-center gap-2">
                  <ReceiptText className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Nenhum pagamento registrado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment: any, idx: number) => {
                    const payDate = new Date(payment.date);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-3 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <CreditCard className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{payment.type || "Mensalidade"}</p>
                            <p className="text-xs text-muted-foreground">
                              {payDate.toLocaleDateString("pt-BR")} · +{payment.days || 30} dias
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-sm text-emerald-600">
                          R$ {(payment.value || 0).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
