// src/components/dashboard/fisio/AgendamentosWidget.jsx
import { Calendar, Clock, User } from 'lucide-react';

export default function AgendamentosWidget({ agendamentos, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Próximas Sessões
              </h3>
              <p className="text-[11px] text-slate-500">
                Agendamentos (7 dias)
              </p>
            </div>
          </div>
        </div>

        {agendamentos.length === 0 ? (
          <p className="text-xs text-slate-500">
            Sem agendamentos para os próximos dias.
          </p>
        ) : (
          <div className="space-y-2">
            {agendamentos.map((ag) => (
              <div
                key={ag.id}
                className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                    {ag.atletaNome?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {ag.atletaNome}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                      <User className="w-3 h-3" />
                      {ag.atletaEquipa}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ag.data).toLocaleDateString('pt-PT')}
                      </span>
                      {ag.hora && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ag.hora}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
