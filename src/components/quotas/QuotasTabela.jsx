import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaUndo, FaTrash } from 'react-icons/fa';

export default function QuotasTabela({ 
  quotas, 
  onRegistarPagamento, 
  onMarcarComoPago, 
  onRemoverPagamento,
  onEliminarQuota  // <-- Nova prop
}) {
  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-PT');
  };

  const isVencida = (dataVencimento, pago) => {
    if (pago) return false;
    return new Date(dataVencimento) < new Date();
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Atleta
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Equipa
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Vencimento
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Pagamento
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {quotas.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                  Nenhuma quota encontrada
                </td>
              </tr>
            ) : (
              quotas.map((quota) => (
                <tr key={quota.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{quota.atletaNome}</div>
                    {quota.descricao && (
                      <div className="text-xs text-gray-400">{quota.descricao}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {quota.equipa}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{quota.valor.toFixed(2)}€</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isVencida(quota.dataVencimento, quota.pago) ? 'text-red-400 font-medium' : 'text-gray-300'}`}>
                      {formatarData(quota.dataVencimento)}
                      {isVencida(quota.dataVencimento, quota.pago) && (
                        <span className="ml-2 text-xs">⚠️ Vencida</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {quota.pago ? (
                      <span className="flex items-center gap-2 text-green-400">
                        <FaCheckCircle />
                        <span className="text-sm font-medium">Paga</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-400">
                        <FaTimesCircle />
                        <span className="text-sm font-medium">Pendente</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {quota.pago ? (
                      <div className="text-sm text-gray-300">
                        <div>{formatarData(quota.dataPagamento)}</div>
                        {quota.metodoPagamento && (
                          <div className="text-xs text-gray-400">{quota.metodoPagamento}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!quota.pago ? (
                        <>
                          <button
                            onClick={() => onRegistarPagamento(quota)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
                          >
                            <FaMoneyBillWave />
                            Registar
                          </button>
                          <button
                            onClick={() => onMarcarComoPago(quota)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
                          >
                            <FaCheckCircle />
                            Marcar Pago
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onRemoverPagamento(quota)}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
                        >
                          <FaUndo />
                          Remover Pago
                        </button>
                      )}
                      <button
                        onClick={() => onEliminarQuota(quota)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <FaTrash />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
