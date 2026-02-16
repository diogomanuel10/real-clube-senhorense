import React from 'react';
import { FaTimes, FaMoneyBillWave } from 'react-icons/fa';

export default function ModalRegistarPagamento({ 
  isOpen, 
  onClose, 
  onSubmit, 
  atleta,
  quota 
}) {
  if (!isOpen || !atleta) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="text-blue-500 text-xl" />
            <h2 className="text-xl font-bold text-white">Registar Pagamento</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-400 mb-1">Atleta</div>
            <div className="text-lg font-bold text-white">{atleta.nome}</div>
            <div className="text-sm text-gray-400 mt-2">{atleta.equipa}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Valor Pago (€)</label>
              <input
                type="number"
                step="0.01"
                name="valor"
                required
                defaultValue={quota?.valor || ''}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="25.00"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Data de Pagamento</label>
              <input
                type="date"
                name="dataPagamento"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Método de Pagamento</label>
              <select
                name="metodoPagamento"
                required
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Selecionar...</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Transferência Bancária">Transferência Bancária</option>
                <option value="MB Way">MB Way</option>
                <option value="Multibanco">Multibanco</option>
                <option value="Cartão">Cartão</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Observações (opcional)</label>
              <textarea
                name="observacoes"
                rows="3"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Notas adicionais..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
              >
                Registar Pagamento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
