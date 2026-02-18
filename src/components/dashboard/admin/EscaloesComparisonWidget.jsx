import { Trophy, Users, TrendingUp } from 'lucide-react';

export default function EscaloesComparisonWidget({ escaloes, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const escaloesOrdenados = [...(escaloes || [])].sort(
    (a, b) => (b.assiduidade || 0) - (a.assiduidade || 0)
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Desempenho por Escalão
              </h3>
              <p className="text-xs text-slate-500">
                Assiduidade e adesão às quotas
              </p>
            </div>
          </div>
        </div>

        {/* Tabela / lista */}
        {escaloesOrdenados.length === 0 ? (
          <p className="text-xs text-slate-500">
            Ainda não existem escalões registados.
          </p>
        ) : (
          <div className="space-y-2">
            {escaloesOrdenados.map((esc, idx) => {
              const assid = esc.assiduidade || 0;
              const totalAtletas = esc.totalAtletas || 0;
              const quotasPagas = esc.quotasPagas || 0;
              const quotasPendentes = esc.quotasPendentes || 0;

              const coberturaQuotas =
                quotasPagas + quotasPendentes > 0
                  ? Math.round(
                      (quotasPagas / (quotasPagas + quotasPendentes)) * 100
                    )
                  : 0;

              return (
                <div
                  key={esc.id || esc.nome || idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {esc.nome || 'Escalão'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {totalAtletas} atletas
                        </span>
                        <span>Treinos: {esc.totalTreinos || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">Assiduidade</p>
                      <p className="text-sm font-semibold text-emerald-700">
                        {assid}%
                      </p>
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(assid, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                        Quotas <TrendingUp className="w-3 h-3 text-amber-500" />
                      </p>
                      <p className="text-sm font-semibold text-amber-700">
                        {coberturaQuotas}%
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {quotasPagas}/{quotasPagas + quotasPendentes}
                      </p>
                    </div>
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
