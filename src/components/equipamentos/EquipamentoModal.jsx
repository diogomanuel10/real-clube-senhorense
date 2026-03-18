import { useState, useEffect } from 'react';
import { addDoc, updateDoc, doc, collection } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { X, Package, Save } from 'lucide-react';

const EquipamentoModal = ({ equipamento, categorias, estados, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    categoria: 'Bolas',
    estado: 'disponivel',
    quantidade: 1,
    valor: 0,
    dataCompra: '',
    localizacao: '',
    marca: '',
    modelo: '',
    observacoes: '',
    imagemUrl: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (equipamento) {
      setFormData({
        nome: equipamento.nome || '',
        codigo: equipamento.codigo || '',
        categoria: equipamento.categoria || 'Bolas',
        estado: equipamento.estado || 'disponivel',
        quantidade: equipamento.quantidade || 1,
        valor: equipamento.valor || 0,
        dataCompra: equipamento.dataCompra || '',
        localizacao: equipamento.localizacao || '',
        marca: equipamento.marca || '',
        modelo: equipamento.modelo || '',
        observacoes: equipamento.observacoes || '',
        imagemUrl: equipamento.imagemUrl || ''
      });
    }
  }, [equipamento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert('Por favor, preencha o nome do equipamento');
      return;
    }

    setLoading(true);

    try {
      const equipamentoData = {
        ...formData,
        quantidade: parseInt(formData.quantidade) || 1,
        valor: parseFloat(formData.valor) || 0,
        atualizadoEm: new Date().toISOString()
      };

      if (equipamento) {
        // Atualizar
        await updateDoc(doc(db, 'equipamentos', equipamento.id), equipamentoData);
      } else {
        // Criar novo
        equipamentoData.criadoEm = new Date().toISOString();
        await addDoc(collection(db, 'equipamentos'), equipamentoData);
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar equipamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {equipamento ? 'Editar Equipamento' : 'Novo Equipamento'}
              </h2>
              <p className="text-sm text-gray-600">
                Preencha os dados do equipamento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Equipamento *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Bola de Voleibol Mikasa"
              />
            </div>

            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código/Referência
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: EQ-001"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {estados.map(est => (
                  <option key={est.value} value={est.value}>{est.label}</option>
                ))}
              </select>
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (€)
              </label>
              <input
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Data de Compra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Compra
              </label>
              <input
                type="date"
                name="dataCompra"
                value={formData.dataCompra}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <input
                type="text"
                name="localizacao"
                value={formData.localizacao}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Armazém A, Prateleira 3"
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Mikasa, Nike"
              />
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: MVA200"
              />
            </div>

            {/* URL da Imagem */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                name="imagemUrl"
                value={formData.imagemUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Notas adicionais sobre o equipamento..."
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {equipamento ? 'Atualizar' : 'Criar'} Equipamento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipamentoModal;
