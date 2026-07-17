import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);

      // Mantém a flag local para facilitar o roteamento offline-first inicial
      localStorage.setItem("lavapro_auth", "true");
      
      // Verifica se já fez onboarding
      const isOnboarded = localStorage.getItem("lavapro_onboarded") === "true";
      if (isOnboarded) {
        navigate("/app/dashboard");
      } else {
        // Agora o DashboardLayout faz a verificação no banco de dados
        navigate("/app/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro na autenticação",
        description: "Verifique suas credenciais e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "E-mail necessário",
        description: "Por favor, digite seu e-mail no campo acima para redefinir a senha.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(firebaseAuth, email);
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro ao enviar e-mail",
        description: "Verifique se o e-mail está correto e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Acesse o LavaPro
        </h2>
        <p className="text-sm text-muted-foreground">
          Insira seu e-mail e senha para acessar o painel.
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              type="email"
              placeholder="seu@email.com" 
              className="pl-10 h-12 bg-background/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              type="password"
              placeholder="Sua senha" 
              className="pl-10 h-12 bg-background/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 font-bold text-base mt-2" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <div className="text-center">
        <button 
          type="button"
          onClick={handleResetPassword}
          disabled={loading}
          className="text-sm text-primary font-semibold hover:underline disabled:opacity-50"
        >
          Esqueceu sua senha?
        </button>
      </div>
    </div>
  );
}
