import { BarChart3, TrendingUp } from 'lucide-react';

export default function GraficosWidget({ escaloes, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-2" />
          <div className="h-40 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  const lista = escaloes || [];

  // Normalizar barras (0–100)
  const maxAssid = Math.max(...lista.map((e) => e.assiduidade || 0), 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Assiduidade por Escalão
              </h3>
              <p className="text-[11px] text-slate-500">
                Visualização rápida (últimos 30 dias)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700">
            <TrendingUp className="w-3 h-3" />
            <span>Mais assíduos no topo</span>
          </div>
        </div>

        {lista.length === 0 ? (
          <p className="text-xs text-slate-500">
            Sem dados suficientes para gerar o gráfico.
          </p>
        ) : (
          <div className="space-y-3">
            {lista
              .slice()
              .sort((a, b) => (b.assiduidade || 0) - (a.assiduidade || 0))
              .map((esc) => {
                const assid = esc.assiduidade || 0;
                const pct = maxAssid > 0 ? (assid / maxAssid) * 100 : 0;

                return (
                  <div key={esc.id || esc.nome} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-700 truncate">
                        {esc.nome}
                      </span>
                      <span className="text-slate-500">{assid}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
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
