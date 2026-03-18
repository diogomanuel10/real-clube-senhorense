import { useState } from 'react';
import { addDoc, updateDoc, doc, collection } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { X, Wrench, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { useClub } from '../contexts/ClubContext';

const ManutencaoModal = ({ equipamento, onClose, onSave }) => {
  const { clubId } = useClub();
  const [formData, setFormData] = useState({
    tipo: 'preventiva',
    descricao: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataPrevisaoFim: '',
    custo: 0,
    responsavel: '',
    observacoes: '',
    mudarEstado: true
  });
  const [loading, setLoading] = useState(false);

  const tiposManutencao = [
    { value: 'preventiva', label: 'Manutenção Preventiva', color: 'blue' },
    { value: 'corretiva', label: 'Manutenção Corretiva', color: 'yellow' },
    { value: 'reparacao', label: 'Reparação', color: 'orange' },
    { value: 'inspecao', label: 'Inspeção', color: 'green' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.descricao.trim()) {
      alert('Por favor, descreva a manutenção');
      return;
    }

    setLoading(true);

    try {
      // Registar manutenção
      await addDoc(collection(db,'clubs', clubId, 'manutencoes'), {
        equipamentoId: equipamento.id,
        equipamentoNome: equipamento.nome,
        tipo: formData.tipo,
        descricao: formData.descricao,
        dataInicio: formData.dataInicio,
        dataPrevisaoFim: formData.dataPrevisaoFim || null,
        dataConclusao: null,
        custo: parseFloat(formData.custo) || 0,
        responsavel: formData.responsavel,
        observacoes: formData.observacoes,
        concluida: false,
        criadoEm: new Date().toISOString()
      });

      // Atualizar estado do equipamento se necessário
      if (formData.mudarEstado) {
        await updateDoc(doc(db,'clubs', clubId, 'equipamentos', equipamento.id), {
          estado: 'manutencao',
          atualizadoEm: new Date().toISOString()
        });
      }

      alert('Manutenção registada com sucesso!');
      onSave();
    } catch (error) {
      console.error('Erro ao registar manutenção:', error);
      alert('Erro ao processar manutenção');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Registar Manutenção
              </h2>
              <p className="text-sm text-orange-100">
                {equipamento?.nome}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Tipo de Manutenção */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Wrench className="w-4 h-4 inline mr-1" />
                Tipo de Manutenção *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tiposManutencao.map(tipo => (
                  <label
                    key={tipo.value}
                    className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.tipo === tipo.value
                        ? `border-${tipo.color}-500 bg-${tipo.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value={tipo.value}
                      checked={formData.tipo === tipo.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`text-sm font-medium ${
                      formData.tipo === tipo.value ? `text-${tipo.color}-700` : 'text-gray-700'
                    }`}>
                      {tipo.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição da Manutenção *
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                placeholder="Descreva o que será feito..."
              />
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data de Início *
                </label>
                <input
                  type="date"
                  name="dataInicio"
                  value={formData.dataInicio}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Previsão de Conclusão
                </label>
                <input
                  type="date"
                  name="dataPrevisaoFim"
                  value={formData.dataPrevisaoFim}
                  onChange={handleChange}
                  min={formData.dataInicio}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Custo e Responsável */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Custo Estimado (€)
                </label>
                <input
                  type="number"
                  name="custo"
                  value={formData.custo}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável
                </label>
                <input
                  type="text"
                  name="responsavel"
                  value={formData.responsavel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Nome do técnico/empresa"
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Adicionais
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                placeholder="Informações extras (opcional)..."
              />
            </div>

            {/* Checkbox para mudar estado */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="mudarEstado"
                  checked={formData.mudarEstado}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">
                      Marcar equipamento como "Em Manutenção"
                    </span>
                  </div>
                  <p className="text-xs text-amber-700">
                    O equipamento ficará indisponível até a conclusão da manutenção
                  </p>
                </div>
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Sobre Manutenções
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Registe todas as manutenções para histórico completo</li>
                    <li>• Poderá marcar como concluída posteriormente</li>
                    <li>• O custo pode ser atualizado após a conclusão</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Wrench className="w-5 h-5" />
                  Registar Manutenção
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManutencaoModal;
