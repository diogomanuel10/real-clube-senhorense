import { usePermissions } from '../hooks/usePermissions';
import { useDashboardAdmin } from '../hooks/useDashboardAdmin';
import StatsCardsAdmin from '../components/dashboard/admin/StatsCardsAdmin';
import QuotasOverviewWidget from '../components/dashboard/admin/QuotasOverviewWidget';
import EscaloesComparisonWidget from '../components/dashboard/admin/EscaloesComparisonWidget';
import AtividadeRecenteWidget from '../components/dashboard/admin/AtividadeRecenteWidget';
import GraficosWidget from '../components/dashboard/admin/GraficosWidget';
import AlertasWidget from '../components/dashboard/admin/AlertasWidget'; // NOVO
import { useNavigate } from 'react-router-dom'; // ← ADICIONA ESTA LINHA
import {
  Users,
  UserCog,
  Calendar,
  ClipboardList,
  FileText,
  ShoppingBag,
  Trophy,
  Activity, // ← ADICIONA ESTA LINHA
  ChevronRight, RefreshCw
} from 'lucide-react';

export default function DashboardAdmin({ user }) {
  const permissions = usePermissions(user);
  const navigate = useNavigate();
  const {
    stats,
    quotas,
    escaloes,
    treinadores,
    atividadeRecente,
    alertas, // NOVO
    metricasCaptacao, // NOVO
    loading,
    recarregar,
  } = useDashboardAdmin();

  const dataFormatada = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const primeiroNome = user?.displayName?.split(' ')[0] || user?.nome ||  'Admin';

  // Calcular total de alertas críticos + atenção
  const alertasUrgentes = (alertas?.criticos?.length || 0) + (alertas?.atencao?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                  👔 Administração
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                  📅 Época 25/26
                </span>
                {/* NOVO: Badge de alertas urgentes */}
                {alertasUrgentes > 0 && (
                  <span className="px-3 py-1 bg-red-500 backdrop-blur-sm rounded-full text-xs font-bold animate-pulse">
                    🔔 {alertasUrgentes} {alertasUrgentes === 1 ? 'alerta' : 'alertas'}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Bom dia, {primeiroNome}! 👋
              </h1>
              <p className="text-slate-200 text-sm md:text-base mb-2 capitalize">
                {dataFormatada}
              </p>
              <p className="text-slate-300 text-sm">
                🏐 <span className="font-medium">Real Clube Senhorense</span>
              </p>
            </div>

            <button
              onClick={recarregar}
              disabled={loading}
              className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6 md:py-8">
        {/* Stats Cards */}
        <StatsCardsAdmin stats={stats} loading={loading} />

        {/* NOVO: Card de métricas de captação (opcional, acima do grid) */}
        {metricasCaptacao && metricasCaptacao.totalPendentes > 0 && (
          <div className="mb-6 bg-slate-900 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">📋 Captações</h3>
                <p className="text-blue-100 text-sm">
                  {metricasCaptacao.totalPendentes} aguardam aprovação da direção
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{metricasCaptacao.taxaAprovacao}%</div>
                <div className="text-blue-100 text-xs">taxa de aprovação</div>
              </div>
            </div>
          </div>
        )}

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Coluna Esquerda (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* NOVO: Widget de Alertas no topo da coluna esquerda */}
            <AlertasWidget
              alertas={alertas}
              loading={loading}
              recarregarDashboard={recarregar} // ADICIONA ESTA PROP
            />

             {/* Card Firebase Monitoring */}
        <div
          onClick={() => navigate('/firebase-monitoring')}
          className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8" />
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
              Monitoring
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Firebase</h3>
          <p className="text-purple-100 text-sm">
            Monitorizar custos e uso
          </p>
        </div>


          </div>

          {/* Coluna Direita (1/3) */}
          <div className="space-y-6 lg:sticky lg:top-6">
            {/* Comparação entre Escalões */}
            <EscaloesComparisonWidget
              escaloes={escaloes}
              loading={loading}
            />
          </div>
        </div>
       
      </div>
    </div>
  );
}
