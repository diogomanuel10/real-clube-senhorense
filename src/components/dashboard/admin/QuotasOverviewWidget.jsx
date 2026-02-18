// src/components/dashboard/admin/QuotasOverviewWidget.jsx
import { DollarSign, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function QuotasOverviewWidget({ quotas, loading }) {
  const totalPagas = quotas?.pagas?.length || 0;
  const totalPendentes = quotas?.pendentes?.length || 0;
  const totalEmAtraso = quotas?.emAtraso?.length || 0;

  const totalReceita = (quotas?.pagas || []).reduce(
    (acc, q) => acc + (q.valor || 0),
    0
  );

  const totalEsperado = totalPagas + totalPendentes;
  const taxaCobertura =
    totalEsperado > 0 ? Math.round((totalPagas / totalEsperado) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-slate-200 rounded" />
            <div className="h-16 bg-slate-200 rounded" />
          </div>
          <div className="h-20 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Situação das Quotas
            </h3>
            <p className="text-xs text-slate-500">
              Visão geral de pagamentos da época
            </p>
          </div>
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-emerald-700">
                Pagas
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-emerald-900">{totalPagas}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-amber-700">
                Pendentes
              </span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-amber-900">
              {totalPendentes}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-red-700">
                Em atraso
              </span>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xl font-bold text-red-900">{totalEmAtraso}</p>
          </div>
        </div>

        {/* Barra principal */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs opacity-90 mb-1">Receita total da época</p>
              <p className="text-2xl font-bold">
                {totalReceita.toLocaleString('pt-PT', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90 mb-1">Cobertura de quotas</p>
              <div className="flex items-center justify-end gap-1 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold">
                  {taxaCobertura}%
                </span>
              </div>
              <div className="w-28 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${Math.min(taxaCobertura, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition-colors">
            📊 Ver relatório de quotas
          </button>
          <button className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition-colors">
            💳 Gerir cobranças
          </button>
        </div>
      </div>
    </div>
  );
}
