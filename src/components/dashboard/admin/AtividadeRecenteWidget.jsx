import { CalendarClock, DollarSign, Activity, UserPlus, AlertCircle } from 'lucide-react';

const ICONES_TIPO = {
  treino: Activity,
  quota: DollarSign,
  atleta: UserPlus,
  alerta: AlertCircle,
};

const CORES_TIPO = {
  treino: 'bg-blue-100 text-blue-700',
  quota: 'bg-emerald-100 text-emerald-700',
  atleta: 'bg-indigo-100 text-indigo-700',
  alerta: 'bg-red-100 text-red-700',
};

export default function AtividadeRecenteWidget({ atividade, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const items = atividade || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Atividade Recente
              </h3>
              <p className="text-[11px] text-slate-500">
                Últimos eventos no clube
              </p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-slate-500">
            Ainda não há registo de atividade recente.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => {
              const Icon =
                ICONES_TIPO[item.tipo] || ICONES_TIPO['alerta'];
              const cores =
                CORES_TIPO[item.tipo] || CORES_TIPO['alerta'];

              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${cores}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 leading-snug">
                      {item.texto}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.data}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
