// src/components/dashboard/fisio/EscaloesLesoesWidget.jsx
import { TrendingUp, AlertCircle, Users } from 'lucide-react';

export default function EscaloesLesoesWidget({ escaloes, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const escaloesOrdenados = [...(escaloes || [])].sort(
    (a, b) => (b.totalLesoes || 0) - (a.totalLesoes || 0)
  );

  const maxLesoes = Math.max(...escaloesOrdenados.map((e) => e.totalLesoes || 0), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Lesões por Escalão
              </h3>
              <p className="text-xs text-slate-500">
                Escalões mais afetados
              </p>
            </div>
          </div>
        </div>

        {escaloesOrdenados.length === 0 ? (
          <p className="text-xs text-slate-500">
            Ainda não existem escalões registados.
          </p>
        ) : (
          <div className="space-y-3">
            {escaloesOrdenados.map((esc, idx) => {
              const totalLesoes = esc.totalLesoes || 0;
              const lesoesAtivas = esc.lesoesAtivas || 0;
              const totalAtletas = esc.totalAtletas || 0;
              const pct = maxLesoes > 0 ? (totalLesoes / maxLesoes) * 100 : 0;

              return (
                <div key={esc.id || esc.nome || idx}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {esc.nome}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {totalAtletas}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-700">
                        {totalLesoes} lesões
                      </span>
                      {lesoesAtivas > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-semibold flex items-center gap-1 inline-flex">
                          <AlertCircle className="w-3 h-3" />
                          {lesoesAtivas} ativas
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"
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
