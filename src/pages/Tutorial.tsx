import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CreditCard,
  Zap,
  Wallet,
  Users,
  Trophy,
  Eye,
  ArrowRight,
} from "lucide-react";

interface StepProps {
  number: number;
  text: string;
}

function Step({ number, text }: StepProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-6 w-6 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
        {number}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2.5">{children}</CardContent>
    </Card>
  );
}

export default function Tutorial() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">❓</span> Tutorial
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Guia rápido para usar o Futebol dos Cria.
        </p>
      </div>

      {/* Seção 1 — Visão geral */}
      <Section
        icon={<span className="text-xl">⚽</span>}
        title="Visão geral"
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          O <strong>Futebol dos Cria</strong> é um sistema de gestão financeira e de gols para um grupo de
          futebol que joga toda segunda às 20h. Há dois tipos de participantes:
        </p>
        <ul className="space-y-1.5 mt-1">
          <li className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-[#1D9E75] font-bold shrink-0">•</span>
            <span><strong>Mensalistas</strong> — membros fixos do grupo que pagam R$20 por mês.</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-[#1D9E75] font-bold shrink-0">•</span>
            <span><strong>Avulsos</strong> — jogadores que participam eventualmente e pagam R$10 por jogo.</span>
          </li>
        </ul>
      </Section>

      {/* Seção 2 — Pagamentos */}
      <Section
        icon={<CreditCard className="h-4 w-4 text-[#1D9E75]" />}
        title="Como registrar pagamentos"
      >
        <Step number={1} text='Acesse a aba "Dashboard" ou "Mensalistas".' />
        <Step number={2} text="Selecione o mês desejado no seletor do topo." />
        <Step number={3} text="Use o toggle ao lado de cada membro para marcar como pago." />
        <Step number={4} text="O valor de R$20 é lançado automaticamente no caixa." />
      </Section>

      {/* Seção 3 — Avulsos */}
      <Section
        icon={<Zap className="h-4 w-4 text-amber-500" />}
        title="Como registrar avulsos"
      >
        <Step number={1} text='Acesse a aba "Avulsos".' />
        <Step number={2} text="Selecione o membro (se for do grupo) ou digite o nome do convidado externo." />
        <Step number={3} text="Informe a data do jogo." />
        <Step number={4} text='Clique em "Registrar R$10" — o valor é lançado automaticamente no caixa.' />
      </Section>

      {/* Seção 4 — Caixa */}
      <Section
        icon={<Wallet className="h-4 w-4 text-blue-500" />}
        title="Como gerenciar o caixa"
      >
        <Step number={1} text='Acesse a aba "Caixa".' />
        <Step number={2} text="Veja o saldo atual, total de entradas e total de saídas." />
        <Step number={3} text='Para registrar uma despesa: preencha a descrição e o valor, clique em "Debitar do caixa".' />
        <Step number={4} text="O extrato mostra todas as movimentações em ordem cronológica." />
      </Section>

      {/* Seção 5 — Gols */}
      <Section
        icon={<Trophy className="h-4 w-4 text-[#1D9E75]" />}
        title="Como registrar gols"
      >
        <Step number={1} text='Acesse a aba "Gols" → subseção "Registrar jogo".' />
        <Step number={2} text='Informe a data do jogo e clique em "Criar jogo".' />
        <Step number={3} text="Adicione os jogadores que participaram (membros do grupo ou avulsos)." />
        <Step number={4} text="Use os botões + e − para registrar os gols de cada um." />
        <Step number={5} text='Clique em "Salvar jogo".' />
        <Step number={6} text="Os gols aparecem no histórico e no ranking automaticamente." />
      </Section>

      {/* Seção 6 — Visão pública */}
      <Section
        icon={<Eye className="h-4 w-4 text-purple-500" />}
        title="Como compartilhar o resumo do mês"
      >
        <Step number={1} text='Acesse a aba "Visão Pública".' />
        <Step number={2} text="Veja a prévia do que será exibido (pagamentos, pendentes, caixa)." />
        <Step number={3} text="Copie o link e compartilhe no grupo do WhatsApp." />
        <Step number={4} text="O link é somente leitura — ninguém consegue editar pelo link." />
      </Section>

      {/* Seção 7 — Membros */}
      <Section
        icon={<Users className="h-4 w-4 text-gray-600" />}
        title="Como cadastrar membros"
      >
        <Step number={1} text='Acesse a aba "Membros".' />
        <Step number={2} text="Preencha nome, sobrenome, apelido, RG e telefone." />
        <Step number={3} text='Clique em "Cadastrar membro".' />
        <Step number={4} text="O membro aparece automaticamente nas listas de pagamento e de gols." />
        <p className="text-sm text-gray-500 mt-1 pl-9">
          Dica: use o botão <strong>"Subir em massa"</strong> para cadastrar vários membros de uma vez colando uma lista de texto — a IA identifica os dados automaticamente.
        </p>
      </Section>

      {/* CTA */}
      <div className="flex justify-center pt-2">
        <Button
          onClick={() => navigate("/")}
          className="bg-[#1D9E75] hover:bg-[#17856a] gap-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          Entendido, ir para o Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
