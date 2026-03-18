import { useState, useEffect } from 'react';
import { addDoc, updateDoc, doc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { X, UserPlus, Calendar, User } from 'lucide-react';
import { useClub } from '../contexts/ClubContext';

const EmprestimoModal = ({ equipamento, onClose, onSave }) => {
  const { clubId } = useClub();
  const [atletas, setAtletas] = useState([]);
  const [formData, setFormData] = useState({
    atletaId: '',
    nomeAtleta: '',
    dataEmprestimo: new Date().toISOString().split('T')[0],
    dataDevolucaoPrevista: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingAtletas, setLoadingAtletas] = useState(true);

  useEffect(() => {
    carregarAtletas();
  }, []);

  const carregarAtletas = async () => {
    try {
      setLoadingAtletas(true);
      const atletasSnap = await getDocs(collection(db,'clubs', clubId, 'atletas'));
      const atletasData = atletasSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAtletas(atletasData);
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
    } finally {
      setLoadingAtletas(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'atletaId') {
      const atletaSelecionado = atletas.find(a => a.id === value);
      setFormData(prev => ({
        ...prev,
        atletaId: value,
        nomeAtleta: atletaSelecionado ? atletaSelecionado.nome : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.atletaId) {
      alert('Por favor, selecione um atleta');
      return;
    }

    setLoading(true);

    try {
      // Criar empréstimo
      await addDoc(collection(db,'clubs', clubId, 'emprestimos'), {
        equipamentoId: equipamento.id,
        equipamentoNome: equipamento.nome,
        atletaId: formData.atletaId,
        nomeAtleta: formData.nomeAtleta,
        dataEmprestimo: formData.dataEmprestimo,
        dataDevolucaoPrevista: formData.dataDevolucaoPrevista || null,
        devolvido: false,
        observacoes: formData.observacoes,
        criadoEm: new Date().toISOString()
      });

      // Atualizar estado do equipamento
      await updateDoc(doc(db,'clubs', clubId, 'equipamentos', equipamento.id), {
        estado: 'em_uso',
        atualizadoEm: new Date().toISOString()
      });

      alert('Equipamento emprestado com sucesso!');
      onSave();
    } catch (error) {
      console.error('Erro ao emprestar:', error);
      alert('Erro ao processar empréstimo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Emprestar Equipamento
              </h2>
              <p className="text-sm text-blue-100">
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
          {loadingAtletas ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3 text-gray-600">Carregando atletas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Atleta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Selecionar Atleta *
                </label>
                <select
                  name="atletaId"
                  value={formData.atletaId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Escolha um atleta...</option>
                  {atletas.map(atleta => (
                    <option key={atleta.id} value={atleta.id}>
                      {atleta.nome} {atleta.escalao ? `- ${atleta.escalao}` : ''}
                    </option>
                  ))}
                </select>
                {atletas.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600">
                    Nenhum atleta encontrado. Adicione atletas primeiro.
                  </p>
                )}
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data de Empréstimo *
                  </label>
                  <input
                    type="date"
                    name="dataEmprestimo"
                    value={formData.dataEmprestimo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Devolução Prevista
                  </label>
                  <input
                    type="date"
                    name="dataDevolucaoPrevista"
                    value={formData.dataDevolucaoPrevista}
                    onChange={handleChange}
                    min={formData.dataEmprestimo}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Deixe em branco se não souber a data
                  </p>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Notas sobre este empréstimo (opcional)..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Sobre Empréstimos
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• O equipamento ficará marcado como "Em Uso"</li>
                      <li>• O atleta será responsável pela devolução</li>
                      <li>• Poderá registar a devolução a qualquer momento</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              disabled={loading || loadingAtletas || atletas.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Confirmar Empréstimo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmprestimoModal;
