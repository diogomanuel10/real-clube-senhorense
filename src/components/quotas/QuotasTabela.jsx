import React from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaUndo,
  FaTrash,
} from "react-icons/fa";

export default function QuotasTabela({
  quotas,
  onRegistarPagamento,
  onMarcarComoPago,
  onRemoverPagamento,
  onEliminarQuota,
}) {
  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-PT");
  };

  const isVencida = (dataVencimento, pago) => {
    if (pago) return false;
    return new Date(dataVencimento) < new Date();
  };

  // DESKTOP (tabela)
  const TabelaDesktop = () => (
    <div className="hidden md:block bg-gray-800 rounded-lg overflow-hidden">
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
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-gray-400"
                >
                  Nenhuma quota encontrada
                </td>
              </tr>
            ) : (
              quotas.map((quota) => (
                <tr
                  key={quota.id}
                  className="hover:bg-gray-750 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {quota.atletaNome}
                    </div>
                    {quota.descricao && (
                      <div className="text-xs text-gray-400">
                        {quota.descricao}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {quota.equipa}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">
                      {quota.valor.toFixed(2)}€
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${
                        isVencida(quota.dataVencimento, quota.pago)
                          ? "text-red-400 font-medium"
                          : "text-gray-300"
                      }`}
                    >
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
                          <div className="text-xs text-gray-400">
                            {quota.metodoPagamento}
                          </div>
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

  // MOBILE (cards)
  const ListaMobile = () => (
    <div className="md:hidden space-y-3">
      {quotas.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
          Nenhuma quota encontrada
        </div>
      ) : (
        quotas.map((quota) => (
          <div
            key={quota.id}
            className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2"
          >
            {/* Linha principal: atleta + equipa + valor */}
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {quota.atletaNome}
                </div>
                {quota.descricao && (
                  <div className="text-[11px] text-gray-400 truncate">
                    {quota.descricao}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/20 text-blue-300">
                  {quota.equipa}
                </span>
                <span className="text-sm font-bold text-white">
                  {quota.valor.toFixed(2)}€
                </span>
              </div>
            </div>

            {/* Vencimento + estado */}
            <div className="flex justify-between items-center text-xs mt-1">
              <div
                className={
                  isVencida(quota.dataVencimento, quota.pago)
                    ? "text-red-400 font-medium"
                    : "text-gray-300"
                }
              >
                {formatarData(quota.dataVencimento)}
                {isVencida(quota.dataVencimento, quota.pago) && (
                  <span className="ml-1">• Vencida</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {quota.pago ? (
                  <>
                    <FaCheckCircle className="text-green-400" />
                    <span className="text-xs text-green-400 font-medium">
                      Paga
                    </span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="text-red-400" />
                    <span className="text-xs text-red-400 font-medium">
                      Pendente
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Info pagamento */}
            <div className="text-[11px] text-gray-300 mt-1">
              {quota.pago ? (
                <>
                  <span>{formatarData(quota.dataPagamento)}</span>
                  {quota.metodoPagamento && (
                    <span className="ml-1 text-gray-400">
                      • {quota.metodoPagamento}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">Sem pagamento registado</span>
              )}
            </div>

            {/* Ações */}
            <div className="flex flex-wrap gap-2 mt-2">
              {!quota.pago ? (
                <>
                  <button
                    onClick={() => onRegistarPagamento(quota)}
                    className="flex-1 min-w-[110px] px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <FaMoneyBillWave />
                    Registar
                  </button>
                  <button
                    onClick={() => onMarcarComoPago(quota)}
                    className="flex-1 min-w-[110px] px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <FaCheckCircle />
                    Marcar Pago
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onRemoverPagamento(quota)}
                  className="flex-1 min-w-[140px] px-2 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <FaUndo />
                  Remover Pago
                </button>
              )}
              <button
                onClick={() => onEliminarQuota(quota)}
                className="flex-1 min-w-[110px] px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <FaTrash />
                Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      <TabelaDesktop />
      <ListaMobile />
    </>
  );
}
