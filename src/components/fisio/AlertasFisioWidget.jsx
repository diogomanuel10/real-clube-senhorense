// src/components/dashboard/fisio/AlertasFisioWidget.jsx
import { Bell, AlertTriangle, Clock, Activity } from 'lucide-react';

const ICONES_TIPO = {
  grave: AlertTriangle,
  prolongada: Clock,
  reavaliacao: Activity,
};

const CORES_TIPO = {
  grave: 'bg-red-100 text-red-700 border-red-200',
  prolongada: 'bg-amber-100 text-amber-700 border-amber-200',
  reavaliacao: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function AlertasFisioWidget({ alertas, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded" />
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
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Alertas Médicos
              </h3>
              <p className="text-[11px] text-slate-500">
                {alertas.length} alerta{alertas.length !== 1 ? 's' : ''} ativo{alertas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {alertas.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <Bell className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500">
              🎉 Sem alertas no momento!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {alertas.map((alerta, idx) => {
              const Icon = ICONES_TIPO[alerta.tipo] || AlertTriangle;
              const cor = CORES_TIPO[alerta.tipo] || CORES_TIPO.grave;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${cor} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug">
                        {alerta.texto}
                      </p>
                      {alerta.data && (
                        <p className="text-[10px] opacity-70 mt-1">
                          Desde: {new Date(alerta.data).toLocaleDateString('pt-PT')}
                        </p>
                      )}
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
