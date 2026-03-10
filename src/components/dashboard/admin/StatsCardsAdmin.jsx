import { Users, GraduationCap, TrendingUp, DollarSign, Calendar, CheckCircle, AlertCircle, Activity, UserPlus } from 'lucide-react';

export default function StatsCardsAdmin({ stats, loading }) {
  const cards = [
    {
      titulo: 'Total Atletas',
      valor: stats.totalAtletas,
      icone: Users,
      cor: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      titulo: 'Escalões',
      valor: stats.totalEscaloes,
      icone: GraduationCap,
      cor: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      titulo: 'Treinadores',
      valor: stats.totalTreinadores,
      icone: Activity,
      cor: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      titulo: 'Assiduidade Geral',
      valor: `${stats.taxaAssiduidadeGeral}%`,
      icone: TrendingUp,
      cor: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      subtitulo: 'Últimos 30 dias',
    },
    {
      titulo: 'Quotas Pagas',
      valor: stats.quotasPagas,
      icone: CheckCircle,
      cor: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      titulo: 'Quotas Pendentes',
      valor: stats.quotasPendentes,
      icone: AlertCircle,
      cor: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
            <div className="h-10 bg-slate-200 rounded mb-2"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icone = card.icone;
        return (
          <div
            key={idx}
            className={`${card.bg} border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200`}  
            
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${card.iconBg} p-3 rounded-xl`}>
                <Icone className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {card.valor}
            </h3>
            <p className="text-sm font-medium text-slate-600">
              {card.titulo}
            </p>
            {card.subtitulo && (
              <p className="text-xs text-slate-500 mt-1">
                {card.subtitulo}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
