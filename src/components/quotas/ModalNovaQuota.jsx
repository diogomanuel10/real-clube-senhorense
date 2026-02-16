import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function ModalNovaQuota({ 
  isOpen, 
  onClose, 
  onSubmit, 
  equipas 
}) {
  const [formData, setFormData] = useState({
    valor: '',
    descricao: 'Quota Mensal',
    dataVencimento: '',
    equipas: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      valor: '',
      descricao: 'Quota Mensal',
      dataVencimento: '',
      equipas: []
    });
  };

  const handleEquipaToggle = (equipa) => {
    setFormData(prev => ({
      ...prev,
      equipas: prev.equipas.includes(equipa)
        ? prev.equipas.filter(e => e !== equipa)
        : [...prev.equipas, equipa]
    }));
  };

  const handleTodasEquipas = () => {
    setFormData(prev => ({
      ...prev,
      equipas: prev.equipas.length === equipas.length ? [] : [...equipas]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Nova Quota</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Valor (€)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="25.00"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Descrição</label>
            <input
              type="text"
              required
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Quota Mensal"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Data de Vencimento</label>
            <input
              type="date"
              required
              value={formData.dataVencimento}
              onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-gray-300">Equipas</label>
              <button
                type="button"
                onClick={handleTodasEquipas}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {formData.equipas.length === equipas.length ? 'Desselecionar' : 'Selecionar'} Todas
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-700 rounded-lg p-3">
              {equipas.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhuma equipa disponível</p>
              ) : (
                equipas.map(equipa => (
                  <label key={equipa} className="flex items-center gap-3 cursor-pointer hover:bg-gray-600 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.equipas.includes(equipa)}
                      onChange={() => handleEquipaToggle(equipa)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-white">{equipa}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {formData.equipas.length === 0 
                ? 'Será criada uma quota para todos os atletas' 
                : `Quota será criada para ${formData.equipas.length} equipa(s)`}
            </p>
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Criar Quotas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
