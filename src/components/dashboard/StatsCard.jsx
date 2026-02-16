import { Users, Shield, Activity } from 'lucide-react';

const StatsCards = ({ stats, loading }) => {
  const cards = [
    {
      title: "Total Atletas",
      value: stats.totalAtletas,
      icon: Users,
      color: "from-yellow-400 to-yellow-500",
      bgIcon: "bg-yellow-100",
      textIcon: "text-yellow-600",
    },
    {
      title: "Equipas Ativas",
      value: stats.equipasAtivas,
      icon: Shield,
      color: "from-green-400 to-green-500",
      bgIcon: "bg-green-100",
      textIcon: "text-green-600",
    },
    {
      title: "Atletas em Acompanhamento",
      value: stats.atletasAcompanhamento,
      icon: Activity,
      color: "from-blue-400 to-blue-500",
      bgIcon: "bg-blue-100",
      textIcon: "text-blue-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
            <div className="h-16 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-xl ${card.bgIcon} flex items-center justify-center`}>
              card.icon className={`w-7 h-7 ${card.textIcon}`} 
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
