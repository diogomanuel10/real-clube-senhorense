import React from 'react';
import { FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function QuotasStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-200">Total Quotas</span>
          <FaMoneyBillWave className="text-2xl text-blue-200" />
        </div>
        <div className="text-3xl font-bold">{stats.total}</div>
        <div className="text-sm text-blue-200 mt-1">
          {stats.totalValor.toFixed(2)}€
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-200">Pagas</span>
          <FaCheckCircle className="text-2xl text-green-200" />
        </div>
        <div className="text-3xl font-bold">{stats.pagos}</div>
        <div className="text-sm text-green-200 mt-1">
          {stats.valorPago.toFixed(2)}€ ({stats.taxaPagamento}%)
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-red-200">Pendentes</span>
          <FaTimesCircle className="text-2xl text-red-200" />
        </div>
        <div className="text-3xl font-bold">{stats.pendentes}</div>
        <div className="text-sm text-red-200 mt-1">
          {stats.valorPendente.toFixed(2)}€
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-purple-200">Taxa Pagamento</span>
          <FaMoneyBillWave className="text-2xl text-purple-200" />
        </div>
        <div className="text-3xl font-bold">{stats.taxaPagamento}%</div>
        <div className="text-sm text-purple-200 mt-1">
          do total
        </div>
      </div>
    </div>
  );
}
