import { useDashboard } from '../hooks/useDashboard';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import StatsCards from '../components/dashboard/StatsCard';
import TreinosHoje from '../components/dashboard/TreinosHoje';
import NotificacoesWidget from '../components/dashboard/NotificacoesWidget';
import ComunicadosWidget from '../components/dashboard/ComunicadosWidget'; // <-- ADICIONAR
import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard({ user }) {
  const { stats, treinos, escaloes, comunicados, loading } = useDashboard(); // <-- ADICIONAR comunicados

  return (
    <DashboardLayout user={user}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-4 md:p-8">
        {/* Welcome Header */}
        <WelcomeHeader user={user} />

        {/* Stats Cards */}
        <StatsCards stats={stats} loading={loading} />

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Treinos de Hoje */}
            <TreinosHoje 
              treinos={treinos} 
              escaloes={escaloes} 
              loading={loading} 
            />

            {/* Comunicados - ADICIONAR AQUI */}
            <ComunicadosWidget 
              comunicados={comunicados} 
              loading={loading} 
            />
          </div>

          {/* Coluna Lateral (1/3) */}
          <div className="space-y-6">
            {/* Notificações */}
            <NotificacoesWidget user={user} />
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
