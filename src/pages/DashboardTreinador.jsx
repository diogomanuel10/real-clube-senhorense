import { usePermissions } from '../hooks/usePermissions';
import { useDashboardTreinador } from '../hooks/useDashboardTreinador';
import StatsCardsTreinador from '../components/dashboard/treinador/StatsCardsTreinador';
import TreinosWidget from '../components/dashboard/treinador/TreinosWidget';
import AtletasDestaqueWidget from '../components/dashboard/treinador/AtletasDestaqueWidget';
import ComunicadosWidgetTreinador from '../components/dashboard/treinador/ComunicadosWidgetTreinador';
import { RefreshCw } from 'lucide-react';

export default function DashboardTreinador({ user }) {
  const permissions = usePermissions(user);
  const {
    stats,
    atletas,
    treinosHoje,
    proximosTreinos,
    atletasDestaque,
    comunicados,
    loading,
    recarregar,
  } = useDashboardTreinador(permissions.equipas);

  // Formatação da data
  const dataFormatada = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const primeiroNome = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Treinador';
  const equipasTexto = permissions.equipas.length > 0 
    ? permissions.equipas.join(', ') 
    : 'Nenhuma equipa atribuída';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header com mesmo container que o conteúdo */}
      <div className="bg-[#0b1635] text-white">
        <div className="px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                  👨‍🏫 Treinador
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                  📅 Época 25/26
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Bom dia, {primeiroNome}! 👋
              </h1>
              <p className="text-blue-100 text-sm md:text-base mb-2 capitalize">
                {dataFormatada}
              </p>
              <p className="text-blue-200 text-sm">
                🏐 <span className="font-medium">{equipasTexto}</span>
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

      {/* Main Content - MESMO CONTAINER */}
      <div className="px-4 md:px-8 py-6 md:py-8">
        {/* Stats Cards */}
        <StatsCardsTreinador stats={stats} loading={loading} />

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Coluna Principal (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Treinos */}
            <div className="h-auto lg:min-h-[600px]">
              <TreinosWidget 
                treinosHoje={treinosHoje}
                proximosTreinos={proximosTreinos}
                loading={loading}
              />
            </div>

            {/* Comunicados */}
            <ComunicadosWidgetTreinador 
              comunicados={comunicados}
              loading={loading}
            />
          </div>

          {/* Coluna Lateral (1/3) */}
          <div className="space-y-6 lg:sticky lg:top-6">
            {/* Atletas em Destaque */}
            <div className="h-auto lg:max-h-[calc(100vh-200px)]">
              <AtletasDestaqueWidget 
                atletasDestaque={atletasDestaque}
                loading={loading}
              />
            </div>

          
          </div>
        </div>
      </div>
    </div>
  );
}
