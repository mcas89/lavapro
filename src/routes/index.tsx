import { createBrowserRouter, Navigate } from "react-router";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Modules Placeholders
import DashboardPage from "@/modules/dashboard/pages";
import CustomersPage from "@/modules/customers/pages";
import VehiclesPage from "@/modules/vehicles/pages";
import ServicesPage from "@/modules/services/pages";
import SchedulePage from "@/modules/schedule/pages";
import WorkOrdersPage from "@/modules/work-orders/pages";
import FinancePage from "@/modules/finance/pages";
import EmployeesPage from "@/modules/employees/pages";
import ReportsPage from "@/modules/reports/pages";
import SettingsPage from "@/modules/settings/pages";
import BusinessHoursPage from "@/modules/settings/pages/business-hours";
import CompanyDataPage from "@/modules/settings/pages/company-data";
import ThemePage from "@/modules/settings/pages/theme";
import TeamPage from "@/modules/settings/pages/team";
import OnboardingPage from "@/modules/onboarding/pages";
import VerifyPaymentPage from "@/modules/billing/pages/verify-payment";

import LoginPage from "@/modules/auth/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
    ],
  },
  {
    path: "/login",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/onboarding",
    element: <OnboardingPage />,
  },
  {
    path: "/app",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "pista",
        element: <WorkOrdersPage />,
      },
      {
        path: "clientes",
        element: <CustomersPage />,
      },
      {
        path: "financeiro",
        element: <FinancePage />,
      },
      {
        path: "relatorios",
        element: <ReportsPage />,
      },
      {
        path: "servicos",
        element: <ServicesPage />,
      },
      {
        path: "veiculos",
        element: <VehiclesPage />,
      },
      {
        path: "agenda",
        element: <SchedulePage />,
      },

      {
        path: "funcionarios",
        element: <EmployeesPage />,
      },

      {
        path: "configuracoes",
        element: <SettingsPage />,
      },
      {
        path: "configuracoes/horarios",
        element: <BusinessHoursPage />,
      },
      {
        path: "configuracoes/empresa",
        element: <CompanyDataPage />,
      },
      {
        path: "configuracoes/tema",
        element: <ThemePage />,
      },
      {
        path: "configuracoes/equipe",
        element: <TeamPage />,
      },
      {
        path: "verificar-pagamento",
        element: <VerifyPaymentPage />,
      },
    ],
  },
]);
