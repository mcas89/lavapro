import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Lock, Mail, UserPlus } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        localStorage.setItem("lavapro_auth", "true");
        navigate("/app/dashboard");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (!isLogin && password.length < 6) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve conter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      }

      localStorage.setItem("lavapro_auth", "true");
      
      const isOnboarded = localStorage.getItem("lavapro_onboarded") === "true";
      if (isOnboarded) {
        navigate("/app/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.code === 'auth/email-already-in-use' 
        ? "Este e-mail já está cadastrado."
        : error.code === 'auth/invalid-credential' 
          ? "E-mail ou senha incorretos."
          : "Erro na autenticação. Tente novamente.";
          
      toast({
        title: "Ops!",
        description: errorMessage,
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
          {isLogin ? "Acesse o LavaPro" : "Crie sua conta"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isLogin 
            ? "Insira seu e-mail e senha para acessar o painel." 
            : "Comece agora e ganhe 7 dias de teste grátis!"}
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
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              type="password"
              placeholder={isLogin ? "Sua senha" : "Crie uma senha (mín. 6 caracteres)"} 
              className="pl-10 h-12 bg-background/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 font-bold text-base mt-2" disabled={loading}>
          {loading 
            ? "Aguarde..." 
            : isLogin 
              ? <><ArrowRight className="mr-2 h-4 w-4" /> Entrar</>
              : <><UserPlus className="mr-2 h-4 w-4" /> Criar Conta Grátis</>
          }
        </Button>
      </form>

      <div className="flex flex-col items-center gap-4 text-sm mt-4">
        <button 
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          disabled={loading}
          className="text-muted-foreground font-medium hover:text-primary transition-colors"
        >
          {isLogin 
            ? "Não tem uma conta? Cadastre-se" 
            : "Já tem uma conta? Faça login"}
        </button>

        {isLogin && (
          <button 
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="text-primary font-semibold hover:underline disabled:opacity-50"
          >
            Esqueceu sua senha?
          </button>
        )}
      </div>
    </div>
  );
}
