import { usePermissions } from '../hooks/usePermissions';
import { useState } from 'react';
import { useDashboardAdmin } from '../hooks/useDashboardAdmin';
import StatsCardsAdmin from '../components/dashboard/admin/StatsCardsAdmin';
import EscaloesComparisonWidget from '../components/dashboard/admin/EscaloesComparisonWidget';
import AlertasWidget from '../components/dashboard/admin/AlertasWidget';
import { useNavigate } from 'react-router-dom';
import { useClub } from '../contexts/ClubContext';
import { Activity, RefreshCw } from 'lucide-react';

export default function DashboardAdmin({ user }) {
  const { clubConfig } = useClub();
  const permissions = usePermissions(user);
  const navigate = useNavigate();

  const corPrimaria = clubConfig?.corPrimaria || '#0b1635';
  const corDestaque  = clubConfig?.corDestaque  || '#f5c623';
  const nomeClube    = clubConfig?.nomeClube    || 'Clube';
  const epoca        = clubConfig?.epoca        || '25/26';

  const {
    stats, quotas, escaloes, treinadores,
    atividadeRecente, alertas, metricasCaptacao,
    loading, recarregar,
  } = useDashboardAdmin({ clubId: user.clubeId });

  const [captacaoParaDetalhes, setCaptacaoParaDetalhes] = useState(null);
  const abrirCaptacaoModal = (captacao) => setCaptacaoParaDetalhes(captacao);

  const dataFormatada = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const primeiroNome = user?.displayName?.split(' ')[0] || user?.nome || 'Admin';
  const alertasUrgentes = (alertas?.criticos?.length || 0) + (alertas?.atencao?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* ── Header ── */}
      <div className="text-white" style={{ background: `linear-gradient(to right, ${corPrimaria}, ${corPrimaria}cc)` }}>
        <div className="px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                  👔 Administração
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                  📅 Época {epoca}
                </span>
                {alertasUrgentes > 0 && (
                  <span className="px-3 py-1 bg-red-500 rounded-full text-xs font-bold animate-pulse">
                    🔔 {alertasUrgentes} {alertasUrgentes === 1 ? 'alerta' : 'alertas'}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Bom dia, {primeiroNome}! 👋
              </h1>
              <p className="text-white/80 text-sm md:text-base mb-2 capitalize">{dataFormatada}</p>
              <p className="text-white/60 text-sm">
                🏐 <span className="font-medium">{nomeClube}</span>
              </p>
              <div className="h-1 w-16 rounded-full mt-3" style={{ backgroundColor: corDestaque }} />
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

      {/* ── Main Content ── */}
      <div className="px-4 md:px-8 py-6 md:py-8">
        <StatsCardsAdmin stats={stats} loading={loading} navigate={navigate} />

        {captacaoParaDetalhes && (
          <CaptacaoDetailsModal
            open={true}
            onClose={() => setCaptacaoParaDetalhes(null)}
            captacao={captacaoParaDetalhes}
            permissions={{ isTreinador: false }}
            onAprovarAtleta={() => {}}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Coluna Esquerda (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <AlertasWidget
              alertas={alertas}
              loading={loading}
              recarregarDashboard={recarregar}
              onAbrirCaptacao={abrirCaptacaoModal}
            />

          </div>

          {/* Coluna Direita (1/3) */}
          <div className="space-y-6 lg:sticky lg:top-6">
            <EscaloesComparisonWidget escaloes={escaloes} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
