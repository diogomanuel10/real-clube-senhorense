import { usePermissions } from '../hooks/usePermissions';
import { useDashboardTreinador } from '../hooks/useDashboardTreinador';
import StatsCardsTreinador from '../components/dashboard/treinador/StatsCardsTreinador';
import TreinosWidget from '../components/dashboard/treinador/TreinosWidget';
import AtletasDestaqueWidget from '../components/dashboard/treinador/AtletasDestaqueWidget';
import AlertasWidget from '../components/dashboard/treinador/AlertasWidget'; // 👈 NOVO
import CalendarioSemanalWidget from '../components/dashboard/treinador/CalendarioSemanalWidget'; // 👈 NOVO
import LesoesWidget from '../components/dashboard/treinador/LesoesWidget'; // 👈 NOVO
import UltimoJogoWidget from '../components/dashboard/treinador/UltimoJogoWidget'; // 👈 NOVO
import ComunicadosWidgetTreinador from '../components/dashboard/treinador/ComunicadosWidgetTreinador';
import { RefreshCw, Users, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function DashboardTreinador({ user }) {
  const navigate = useNavigate();
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

  const primeiroNome = user?.displayName?.split(' ')[0] || user?.nome || 'Treinador';
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

      {/* 👇 QUICK ACTIONS - NOVO */}
      <div className="px-4 md:px-8 -mt-4 mb-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/atletas')}
            className="bg-white p-4 rounded-xl shadow-md border border-slate-200 hover:shadow-lg hover:border-blue-500 hover:-translate-y-0.5 transition-all text-left group"
          >
            <Users className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs text-slate-600 mb-0.5">Meus Atletas</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalAtletas || 0}</p>
          </button>

          <button
            onClick={() => navigate('/treinos')}
            className="bg-white p-4 rounded-xl shadow-md border border-slate-200 hover:shadow-lg hover:border-green-500 hover:-translate-y-0.5 transition-all text-left group"
          >
            <Calendar className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs text-slate-600 mb-0.5">Treinos Hoje</p>
            <p className="text-xl font-bold text-slate-900">{treinosHoje?.length || 0}</p>
          </button>

          <button
            onClick={() => navigate('/presencas')}
            className="bg-white p-4 rounded-xl shadow-md border border-slate-200 hover:shadow-lg hover:border-purple-500 hover:-translate-y-0.5 transition-all text-left group"
          >
            <TrendingUp className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs text-slate-600 mb-0.5">Assiduidade</p>
            <p className="text-xl font-bold text-slate-900">{stats.taxaAssiduidade + "%" || '0%'}</p>
          </button>

        </div>
      </div>

      {/* Main Content - MESMO CONTAINER */}
      <div className="px-4 md:px-8 py-6 md:py-8">

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

            {/* 👇 NOVO - Último Jogo */}
            <UltimoJogoWidget equipas={permissions.equipas} />

           

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

            <LesoesWidget equipas={permissions.equipas} />

         <ComunicadosWidgetTreinador
              comunicados={comunicados}
              loading={loading}
            />


          </div>
        </div>
      </div>
    </div>
  );
}
