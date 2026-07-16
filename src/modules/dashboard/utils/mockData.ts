import type { Schedule } from "@/types/schedule";

export const mockInsights = [
  {
    id: "1",
    title: "Alta Demanda Hoje",
    description: "Sua agenda está 80% ocupada. Prepare a equipe para o horário de pico às 14:00.",
    type: "info",
    icon: "📈"
  },
  {
    id: "2",
    title: "Retenção de Clientes",
    description: "Existem 3 clientes VIP que costumam retornar a cada 15 dias e já não aparecem há 30 dias.",
    type: "warning",
    icon: "⚠️"
  },
  {
    id: "3",
    title: "Meta Financeira",
    description: "Faltam apenas R$ 150 para você bater sua meta diária de faturamento.",
    type: "success",
    icon: "💰"
  }
];

export const mockSchedules: Schedule[] = [
  {
    id: "s1",
    companyId: "c1",
    customerId: "c1",
    vehicleId: "v1",
    serviceId: "srv1",
    date: new Date().toISOString().split("T")[0],
    hour: "08:00",
    status: "completed",
    createdAt: new Date()
  },
  {
    id: "s2",
    companyId: "c1",
    customerId: "c2",
    vehicleId: "v2",
    serviceId: "srv2",
    date: new Date().toISOString().split("T")[0],
    hour: "09:30",
    status: "in_progress",
    createdAt: new Date()
  },
  {
    id: "s3",
    companyId: "c1",
    customerId: "c3",
    vehicleId: "v3",
    serviceId: "srv1",
    date: new Date().toISOString().split("T")[0],
    hour: "11:00",
    status: "scheduled",
    createdAt: new Date()
  },
  {
    id: "s4",
    companyId: "c1",
    customerId: "c3",
    vehicleId: "v4",
    serviceId: "srv3",
    date: new Date().toISOString().split("T")[0],
    hour: "14:00",
    status: "scheduled",
    createdAt: new Date()
  }
];

export const mockDashboardData = {
  todayRevenue: 850,
  targetRevenue: 1000,
  completedVehicles: 4,
  pendingVehicles: 8
};

export const mockActiveVehicles = [
  {
    id: "os1",
    plate: "ABC-1234",
    brand: "Honda",
    model: "Civic",
    service: "Lavagem Completa",
    status: "washing", // washing, drying, finishing
    elapsedTime: "45 min"
  },
  {
    id: "os2",
    plate: "XYZ-9876",
    brand: "Jeep",
    model: "Compass",
    service: "Lavagem + Cera",
    status: "finishing",
    elapsedTime: "1h 10m"
  }
];

export const mockFinanceSummary = {
  incomes: 1250.00,
  expenses: 320.00,
  methods: {
    pix: 850.00,
    creditCard: 300.00,
    cash: 100.00
  }
};

export const mockCustomers = [
  { id: "c1", name: "João Silva", phone: "(11) 99999-9999", address: "Rua das Flores, 123", visits: 12, totalSpent: 1200, lastVisit: "10 dias atrás" },
  { id: "c2", name: "Maria Oliveira", phone: "(11) 88888-8888", address: "Av. Paulista, 1000", visits: 5, totalSpent: 450, lastVisit: "2 meses atrás" },
  { id: "c3", name: "Pedro Santos", phone: "(11) 77777-7777", address: "Rua Augusta, 500", visits: 2, totalSpent: 180, lastVisit: "Hoje" },
];

export const mockVehicles = [
  { id: "v1", customerId: "c1", plate: "ABC-1234", brand: "Honda", model: "Civic", color: "Prata" },
  { id: "v2", customerId: "c2", plate: "XYZ-9876", brand: "Jeep", model: "Compass", color: "Preto" },
  { id: "v3", customerId: "c3", plate: "DEF-5678", brand: "VW", model: "Polo", color: "Branco" },
  { id: "v4", customerId: "c1", plate: "GHI-9012", brand: "Fiat", model: "Argo", color: "Vermelho" },
];

export const mockBusinessHours = {
  intervalMinutes: 30,
  days: [
    { dayOfWeek: 1, name: "Seg", isOpen: true, openTime: "08:00", closeTime: "18:00" },
    { dayOfWeek: 2, name: "Ter", isOpen: true, openTime: "08:00", closeTime: "18:00" },
    { dayOfWeek: 3, name: "Qua", isOpen: true, openTime: "08:00", closeTime: "18:00" },
    { dayOfWeek: 4, name: "Qui", isOpen: true, openTime: "08:00", closeTime: "18:00" },
    { dayOfWeek: 5, name: "Sex", isOpen: true, openTime: "08:00", closeTime: "18:00" },
    { dayOfWeek: 6, name: "Sáb", isOpen: true, openTime: "08:00", closeTime: "14:00" },
    { dayOfWeek: 0, name: "Dom", isOpen: false, openTime: "08:00", closeTime: "12:00" },
  ]
};

export const mockServices = [
  { id: "srv1", name: "Lavagem Simples", price: 50.00, estimatedTime: 30, description: "Ducha externa, aspiração e pretinho." },
  { id: "srv2", name: "Lavagem Completa", price: 80.00, estimatedTime: 60, description: "Lavagem detalhada, cera líquida, limpeza interna profunda." },
  { id: "srv3", name: "Polimento Comercial", price: 250.00, estimatedTime: 180, description: "Revitalização da pintura em etapa única." },
  { id: "srv4", name: "Higienização Interna", price: 180.00, estimatedTime: 120, description: "Limpeza de bancos, teto e carpetes com extratora." },
];

export const mockTeam = [
  { id: "t1", name: "Carlos Gerente", role: "Administrador", email: "carlos@lavapro.com.br", initial: "CG", salaryType: "Mensal", salaryAmount: 3500 },
  { id: "t2", name: "João Lavador", role: "Funcionário", email: "joao@lavapro.com.br", initial: "JL", salaryType: "Semanal", salaryAmount: 500 },
];

export const mockTransactions = [
  { id: "tr1", type: "income", description: "Lavagem Completa - Honda Civic", category: "Serviço", value: 80.00, date: new Date().toISOString().split("T")[0] },
  { id: "tr2", type: "income", description: "Lavagem Simples - Jeep Compass", category: "Serviço", value: 50.00, date: new Date().toISOString().split("T")[0] },
  { id: "tr3", type: "expense", description: "Compra de Shampoo 5L", category: "Produtos", value: 120.00, date: new Date().toISOString().split("T")[0] },
  { id: "tr4", type: "expense", description: "Conta de Energia", category: "Contas", value: 350.00, date: new Date(Date.now() - 86400000).toISOString().split("T")[0] },
];
