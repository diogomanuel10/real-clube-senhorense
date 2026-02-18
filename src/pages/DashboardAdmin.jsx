import { usePermissions } from '../hooks/usePermissions';
import { useDashboardAdmin } from '../hooks/useDashboardAdmin';
import StatsCardsAdmin from '../components/dashboard/admin/StatsCardsAdmin';
import QuotasOverviewWidget from '../components/dashboard/admin/QuotasOverviewWidget';
import EscaloesComparisonWidget from '../components/dashboard/admin/EscaloesComparisonWidget';
import TreinadoresWidget from '../components/dashboard/admin/TreinadoresWidget';
import AtividadeRecenteWidget from '../components/dashboard/admin/AtividadeRecenteWidget';
import GraficosWidget from '../components/dashboard/admin/GraficosWidget';
import { RefreshCw } from 'lucide-react';

export default function DashboardAdmin({ user }) {
  const permissions = usePermissions(user);
  const {
    stats,
    quotas,
    escaloes,
    treinadores,
    atividadeRecente,
    loading,
    recarregar,
  } = useDashboardAdmin();

  const dataFormatada = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const primeiroNome = user?.displayName?.split(' ')[0] || 'Admin';

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

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Coluna Esquerda (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gráficos */}
            <GraficosWidget 
              escaloes={escaloes}
              loading={loading}
            />

            {/* Comparação entre Escalões */}
            <EscaloesComparisonWidget 
              escaloes={escaloes}
              loading={loading}
            />

            {/* Quotas Overview */}
            <QuotasOverviewWidget 
              quotas={quotas}
              loading={loading}
            />
          </div>

          {/* Coluna Direita (1/3) */}
          <div className="space-y-6 lg:sticky lg:top-6">
            {/* Treinadores */}
            <TreinadoresWidget 
              treinadores={treinadores}
              loading={loading}
            />

            {/* Atividade Recente */}
            <AtividadeRecenteWidget 
              atividade={atividadeRecente}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
