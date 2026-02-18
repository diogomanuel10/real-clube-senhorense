// src/components/dashboard/fisio/HistoricoLesoesWidget.jsx
import { History, CheckCircle, XCircle, Clock } from 'lucide-react';

const ICONES_ESTADO = {
  ativa: XCircle,
  recuperada: CheckCircle,
};

const CORES_ESTADO = {
  ativa: 'text-red-600 bg-red-100',
  recuperada: 'text-emerald-600 bg-emerald-100',
};

export default function HistoricoLesoesWidget({ historico, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Histórico de Lesões
            </h3>
            <p className="text-xs text-slate-500">
              Últimas {historico.length} lesões registadas
            </p>
          </div>
        </div>

        {historico.length === 0 ? (
          <p className="text-sm text-slate-500">
            Sem histórico de lesões registado.
          </p>
        ) : (
          <div className="space-y-2">
            {historico.map((lesao) => {
              const Icon = ICONES_ESTADO[lesao.estado] || XCircle;
              const cor = CORES_ESTADO[lesao.estado] || CORES_ESTADO.ativa;

              const diasLesao =
                lesao.dataInicio && lesao.dataFim
                  ? Math.round(
                      (new Date(lesao.dataFim) - new Date(lesao.dataInicio)) /
                        (1000 * 60 * 60 * 24)
                    )
                  : lesao.dataInicio
                  ? Math.round(
                      (new Date() - new Date(lesao.dataInicio)) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0;

              return (
                <div
                  key={lesao.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${cor}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {lesao.atletaNome}
                        </p>
                        <p className="text-xs text-slate-600 mb-1">
                          {lesao.tipo || 'Lesão'}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{lesao.atletaEquipa}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {diasLesao}d
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                        lesao.estado === 'recuperada'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {lesao.estado?.toUpperCase() || 'ATIVA'}
                    </span>
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
