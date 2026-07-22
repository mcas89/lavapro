import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export default function LegalPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Termos e Privacidade</h1>
            <p className="text-muted-foreground">Atualizado em 22 de Julho de 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          
          <section className="bg-card border rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">1. Termos de Uso</h2>
            <p>
              Bem-vindo ao LavaPro. Ao acessar e usar nossa plataforma, você concorda em cumprir estes termos. O LavaPro é um sistema SaaS (Software as a Service) projetado para a gestão de lava-rápidos, estética automotiva e empresas do ramo.
            </p>
            <h3 className="font-semibold text-foreground mt-4">1.1. Uso da Plataforma</h3>
            <p>
              Você é responsável por manter a confidencialidade das credenciais de acesso da sua conta e por todas as atividades que ocorrem sob ela. O LavaPro não se responsabiliza por perdas ou danos resultantes do não cumprimento desta obrigação de segurança.
            </p>
            <h3 className="font-semibold text-foreground mt-4">1.2. Assinatura e Pagamentos</h3>
            <p>
              O uso continuado do sistema está condicionado ao pagamento da assinatura escolhida (Mensal ou Anual). O acesso pode ser suspenso automaticamente caso haja atraso no pagamento após o período de carência (3 dias).
            </p>
          </section>

          <section className="bg-card border rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">2. Política de Privacidade</h2>
            <p>
              Sua privacidade é fundamental para nós. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais e os dados do seu negócio.
            </p>
            <h3 className="font-semibold text-foreground mt-4">2.1. Coleta de Dados</h3>
            <p>
              Coletamos os dados fornecidos por você ao criar uma conta, bem como os dados inseridos por você na plataforma referentes à gestão do seu lava-rápido (clientes, veículos, financeiro).
            </p>
            <h3 className="font-semibold text-foreground mt-4">2.2. Isolamento e Segurança (Multi-Tenancy)</h3>
            <p>
              Garantimos que os dados inseridos por um cliente (Lava-Rápido A) são estritamente isolados e inacessíveis por qualquer outro cliente (Lava-Rápido B). Utilizamos regras rígidas de segurança em nossos servidores cloud (Firebase/Google Cloud) para garantir essa separação.
            </p>
            <h3 className="font-semibold text-foreground mt-4">2.3. Uso das Informações</h3>
            <p>
              Não vendemos, alugamos ou compartilhamos seus dados financeiros ou de clientes com terceiros. Os dados são utilizados estritamente para o funcionamento do sistema e fornecimento dos serviços contratados.
            </p>
          </section>

          <section className="bg-card border rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">3. Contato</h2>
            <p>
              Se você tiver dúvidas sobre estes termos ou sobre nossas práticas de privacidade, entre em contato conosco através do nosso suporte oficial no aplicativo.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
