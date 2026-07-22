import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { db } from "@/lib/db";
import { useCollection } from "@/hooks/useCollection";
import { useToast } from "@/hooks/use-toast";
import { parseExpiration } from "@/services/planService";

const INFINITEPAY_HANDLE = "mcas-89";

export default function VerifyPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: settingsList, loading: settingsLoading } = useCollection<any>("settings");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirmando seu pagamento com a InfinitePay...");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const slug = searchParams.get("slug");
    const order_nsu = searchParams.get("order_nsu");
    const transaction_nsu = searchParams.get("transaction_nsu");

    if (!slug || !transaction_nsu) {
      setStatus("error");
      setMessage("Parâmetros de pagamento inválidos. Retorne e tente novamente.");
      return;
    }

    if (verified) return;
    if (settingsLoading) return; // Aguarda carregar

    setVerified(true);

    const verifyAndActivate = async () => {
      try {
        const response = await fetch("/infinitepay/payment_check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handle: INFINITEPAY_HANDLE,
            order_nsu: order_nsu || "",
            transaction_nsu,
            slug,
          }),
        });

        const data = await response.json();

        if (!data.paid) {
          setStatus("error");
          setMessage("Pagamento não confirmado. Aguarde alguns instantes e tente novamente.");
          return;
        }

        let daysToAdd = 30;
        let paidValue = data.paid_amount ? data.paid_amount / 100 : 29.90;

        if (order_nsu?.includes("365dias")) {
          daysToAdd = 365;
        } else if (order_nsu?.includes("30dias")) {
          daysToAdd = 30;
        }

        // Calcular nova data de vencimento (acumulativa em cima do que já tem)
        const profileDoc = settingsList?.find((doc: any) => doc.id === "profile");
        const currentValidUntil = profileDoc?.validUntil;

        let baseDate = new Date();
        baseDate.setHours(0, 0, 0, 0);

        if (currentValidUntil) {
          const currentDate = parseExpiration(currentValidUntil);
          if (currentDate > baseDate) {
            baseDate = currentDate;
          }
        }

        const newValidUntil = new Date(baseDate);
        newValidUntil.setDate(newValidUntil.getDate() + daysToAdd);

        const paymentRecord = {
          date: new Date().toISOString(),
          value: paidValue,
          amount: data.amount ? data.amount / 100 : paidValue,
          type: daysToAdd === 365 ? "Plano Anual" : "Plano Mensal",
          days: daysToAdd,
          transaction_nsu,
          slug,
          capture_method: data.capture_method || "credit_card",
          installments: data.installments || 1,
        };

        if (profileDoc) {
          await db.updateDoc("settings", "profile", {
            validUntil: newValidUntil.toISOString().split("T")[0],
            paymentHistory: [...(profileDoc.paymentHistory || []), paymentRecord],
          });
        } else {
          await db.setDoc("settings", "profile", {
            validUntil: newValidUntil.toISOString().split("T")[0],
            paymentHistory: [paymentRecord],
          });
        }

        setStatus("success");
        setMessage(`Pagamento de R$ ${paidValue.toFixed(2).replace(".", ",")} confirmado! +${daysToAdd} dias ativados.`);

        setTimeout(() => {
          toast({ title: "Assinatura ativada!", description: `Seu plano foi renovado por mais ${daysToAdd} dias.` });
          navigate("/app/dashboard");
        }, 3000);
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Erro ao verificar o pagamento. Tente novamente ou entre em contato com o suporte.");
      }
    };

    verifyAndActivate();
  }, [searchParams, settingsList]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-sm w-full space-y-6">
        {status === "loading" && (
          <>
            <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Verificando Pagamento</h1>
              <p className="text-sm text-muted-foreground mt-2">{message}</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-20 w-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-600">Pagamento Confirmado!</h1>
              <p className="text-sm text-muted-foreground mt-2">{message}</p>
              <p className="text-xs text-muted-foreground mt-1">Redirecionando para o Dashboard...</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-20 w-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-600">Pagamento Não Confirmado</h1>
              <p className="text-sm text-muted-foreground mt-2">{message}</p>
            </div>
            <button
              onClick={() => navigate("/app/configuracoes/empresa")}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
            >
              Voltar e Tentar Novamente
            </button>
          </>
        )}
      </div>
    </div>
  );
}
