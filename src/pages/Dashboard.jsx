// src/pages/Dashboard.jsx (ATUALIZAR)
import { useDashboard } from '../hooks/useDashboard';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import DashboardTreinador from './DashboardTreinador';
import DashboardAdmin from './DashboardAdmin';
import DashboardFisio from './DashboardFisio'; // <-- ADICIONAR
import StatsCards from '../components/dashboard/StatsCard';
import TreinosHoje from '../components/dashboard/TreinosHoje';
import { usePermissions } from '../hooks/usePermissions';
import NotificacoesWidget from '../components/dashboard/NotificacoesWidget';
import ComunicadosWidget from '../components/dashboard/ComunicadosWidget';
import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard({ user }) {
  const permissions = usePermissions(user);
  const { stats, treinos, escaloes, comunicados, loading } = useDashboard();
  const treinosFiltrados = permissions.filterByEquipa(treinos, 'equipa');
  const escaloesFiltrados = permissions.filterByEquipa(escaloes, 'nome');
  const comunicadosFiltrados = comunicados.filter(c => {
    if (permissions.isAdmin || permissions.isDirecao) return true;
    if (permissions.isTreinador && c.destinatarios) {
      if (c.destinatarios.includes('todos')) return true;
      return c.destinatarios.some(dest => permissions.equipas.includes(dest));
    }
    return true;
  });

  if (permissions.loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">A carregar dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statsAjustados = permissions.isTreinador ? {
    ...stats,
    totalAtletas: stats.totalAtletas,
    totalEscaloes: permissions.equipas.length,
  } : stats;

  return (
    <DashboardLayout user={user}>
      {permissions.isTreinador ? (
        <DashboardTreinador user={user} />
      ) : permissions.isAdmin || permissions.isDirecao ? (
        <DashboardAdmin user={user} /> 
      ) : permissions.isFisio ? ( 
        <DashboardFisio user={user} />
      ) : permissions.isAtleta ? (
        <div className="p-8">
          <h1 className="text-2xl font-bold">Dashboard Atleta</h1>
          <p className="text-slate-600 mt-2">Em desenvolvimento...</p>
        </div>
      ) : (
        <div className="p-8">
          <h1 className="text-2xl font-bold">Bem-vindo!</h1>
          <p className="text-slate-600 mt-2">Dashboard genérico</p>
        </div>
      )}
    </DashboardLayout>
  );
}
