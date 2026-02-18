import { Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

export default function StatsCardsTreinador({ stats, loading }) {
  const cards = [
    {
      title: 'Meus Atletas',
      value: stats.totalAtletas,
      icon: Users,
      color: 'blue',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Presenças Hoje',
      value: `${stats.presencasHoje}/${stats.totalEsperado}`,
      subtitle: stats.totalEsperado > 0 
        ? `${Math.round((stats.presencasHoje / stats.totalEsperado) * 100)}%` 
        : '0%',
      icon: Calendar,
      color: 'green',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Assiduidade',
      value: `${stats.taxaAssiduidade}%`,
      subtitle: 'Últimos 30 dias',
      icon: TrendingUp,
      color: stats.taxaAssiduidade >= 80 ? 'green' : stats.taxaAssiduidade >= 60 ? 'yellow' : 'red',
      bgGradient: stats.taxaAssiduidade >= 80 
        ? 'from-green-50 to-green-100'
        : stats.taxaAssiduidade >= 60
        ? 'from-yellow-50 to-yellow-100'
        : 'from-red-50 to-red-100',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
            <div className="h-12 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.bgGradient} rounded-xl border border-${card.color}-200 p-6 shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600">{card.title}</p>
              <div className={`w-10 h-10 rounded-lg bg-${card.color}-500/10 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${card.color}-600`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{card.value}</p>
            {card.subtitle && (
              <p className="text-xs text-slate-500">{card.subtitle}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
