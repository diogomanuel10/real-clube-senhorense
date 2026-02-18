import { Activity, AlertCircle, CheckCircle, Users, Calendar, TrendingUp } from 'lucide-react';

export default function StatsCardsFisio({ stats, loading }) {
  const cards = [
    {
      titulo: 'Lesões Ativas',
      valor: stats?.lesoesAtivas || 0,
      icone: Activity,
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      subtitulo: 'A necessitar acompanhamento',
    },
    {
      titulo: 'Atletas em Recuperação',
      valor: stats?.atletasEmRecuperacao || 0,
      icone: Users,
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      titulo: 'Lesões Recuperadas',
      valor: stats?.lesoesRecuperadas || 0,
      icone: CheckCircle,
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      subtitulo: 'Esta época',
    },
    {
      titulo: 'Sessões (7 dias)',
      valor: stats?.sessoesSemana || 0,
      icone: Calendar,
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      titulo: 'Tempo Médio',
      valor: `${stats?.tempoMedioRecuperacao || 0}d`,
      icone: TrendingUp,
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      subtitulo: 'Recuperação média',
    },
    {
      titulo: 'Total de Lesões',
      valor: stats?.totalLesoes || 0,
      icone: AlertCircle,
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      subtitulo: 'Histórico completo',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="animate-pulse space-y-3">
              <div className="h-10 w-10 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icone;
        return (
          <div key={idx} className={`${card.bg} rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">{card.titulo}</h3>
            <p className="text-3xl font-bold text-slate-900 mb-1">{card.valor}</p>
            {card.subtitulo && <p className="text-xs text-slate-500">{card.subtitulo}</p>}
          </div>
        );
      })}
    </div>
  );
}
