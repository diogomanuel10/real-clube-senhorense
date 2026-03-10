import { Users, UserPlus, Activity, HeartPulse } from 'lucide-react';

const StatsCards = ({ stats, loading, equipas = [] }) => {
  const cards = [
    {
      title: "Atletas Ativos",
      value: `${stats.totalAtletas || 0}/${stats.totalCapacidade || 24}`,
      subtitle: `${stats.taxaOcupacao?.toFixed(0) || 0}%`,
      icon: Users,
      color: "from-emerald-400 to-emerald-500",
      bgIcon: "bg-emerald-100",
      textIcon: "text-emerald-600",
    },
    {
      title: "Captações Pendentes", 
      value: stats.captacoesPendentes || 0,
      subtitle: "Esta semana",
      icon: UserPlus,
      color: "from-amber-400 to-amber-500",
      bgIcon: "bg-amber-100",
      textIcon: "text-amber-600",
    },
    {
      title: "Assiduidade",
      value: `${stats.taxaAssiduidade || 0}%`,
      subtitle: "Média 7 dias",
      icon: Activity,
      color: "from-blue-400 to-blue-500", 
      bgIcon: "bg-blue-100",
      textIcon: "text-blue-600",
    },
    {
      title: "Lesionados",
      value: stats.lesionados || 0,
      subtitle: "Em recuperação",
      icon: HeartPulse,
      color: "from-red-400 to-red-500",
      bgIcon: "bg-red-100",
      textIcon: "text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-20 mb-3"></div>
            <div className="h-10 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 
                   hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300
                   hover:bg-gradient-to-br hover:from-blue-50"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">{card.title}</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-slate-500 mt-1 font-medium">{card.subtitle}</p>
              )}
            </div>
            {/* ✅ FIX: ÍCONE CORRIGIDO */}
            <div className={`w-14 h-14 rounded-2xl ${card.bgIcon} flex items-center justify-center 
                           group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
              <card.icon className={`w-6 h-6 ${card.textIcon}`} />
            </div>
          </div>
          
          {/* Equipa no canto (para treinador) */}
          {equipas[0] && idx === 0 && (
            <span className="inline-block px-2 py-1 bg-slate-100 text-xs font-medium text-slate-700 rounded-full">
              {equipas[0]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
