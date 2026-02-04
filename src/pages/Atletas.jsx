import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Edit, Trash2, Search, Filter, ChevronLeft, FileText
} from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebase';


export default function Atletas({ user }) {
  const navigate = useNavigate();
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAtleta, setEditingAtleta] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    equipa: '',
    posicao: '',
    telefone: '',
    email: '',
    escalao: '',
    documentos: {
      cc: '',
      exameMedico: ''
    },
    observacoes: ''
  });


  useEffect(() => {
    loadAtletas();
  }, []);


  const loadAtletas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'atletas'), orderBy('nome'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Atletas carregados:', data); // Debug
      setAtletas(data);
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
    } finally {
      setLoading(false);
    }
  };


  const filteredAtletas = atletas.filter(atleta =>
    atleta.nome?.toLowerCase().includes(search.toLowerCase()) ||
    atleta.equipa?.toLowerCase().includes(search.toLowerCase())
  );


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const atletaData = {
        nome: formData.nome,
        idade: formData.idade,
        equipa: formData.equipa,
        posicao: formData.posicao,
        telefone: formData.telefone,
        email: formData.email,
        escalao: formData.escalao,
        documentos: formData.documentos,
        observacoes: formData.observacoes
      };

      if (editingAtleta) {
        alert('Update em desenvolvimento!');
      } else {
        await addDoc(collection(db, 'atletas'), atletaData);
        alert('Atleta adicionada com sucesso!');
        setShowAddModal(false);
        resetForm();
        loadAtletas();
      }
    } catch (error) {
      console.error('Erro ao adicionar atleta:', error);
      alert('Erro: ' + error.message);
    }
  };


  const resetForm = () => {
    setFormData({
      nome: '',
      idade: '',
      equipa: '',
      posicao: '',
      telefone: '',
      email: '',
      escalao: '',
      documentos: { cc: '', exameMedico: '' },
      observacoes: ''
    });
  };


  const handleDelete = async (id) => {
    if (window.confirm('Eliminar atleta?')) {
      try {
        await deleteDoc(doc(db, 'atletas', id));
        loadAtletas();
        alert('Atleta eliminado!');
      } catch (error) {
        alert('Erro ao eliminar: ' + error.message);
      }
    }
  };


  const positions = ['Central', 'Ponta', 'Levantadora', 'Líbero', 'Oposta'];
  const equipas = ['Sub-14 Feminino', 'Sub-16 Feminino', 'Sub-18 Feminino', 'Sub-14 Masculino', 'Sub-16 Masculino', 'Sub-18 Masculino', 'Seniores Feminino', 'Seniores Masculino'];
  const escaloes = ['Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20', 'Seniores'];


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Atletas</h1>
              <p className="text-sm text-gray-600">{filteredAtletas.length} de {atletas.length} atletas</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Adicionar Atleta
          </button>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Procurar por nome ou equipa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <button className="p-3 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all">
                <Filter className="w-5 h-5" />
              </button>
              <button 
                onClick={loadAtletas}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-all"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>


        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAtletas.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum atleta encontrado</h3>
            <p className="text-gray-600 mb-6">Tenta ajustar a pesquisa ou adiciona o primeiro atleta</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary px-8 py-3"
            >
              <Plus className="w-5 h-5" />
              Adicionar Primeiro Atleta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAtletas.map((atleta) => (
              <div key={atleta.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                        {atleta.nome?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{atleta.nome || 'Sem nome'}</h3>
                        <p className="text-sm text-gray-600">{atleta.equipa || 'Sem equipa'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setEditingAtleta(atleta)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(atleta.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm">
                      <span className="w-24 text-gray-500">Idade:</span>
                      <span className="font-medium">{atleta.idade || 'N/A'} anos</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-24 text-gray-500">Posição:</span>
                      <span className="font-medium">{atleta.posicao || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-24 text-gray-500">Escalão:</span>
                      <span className="font-medium">{atleta.escalao || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-24 text-gray-500">Telefone:</span>
                      <span className="font-mono text-xs">{atleta.telefone || 'N/A'}</span>
                    </div>
                    {atleta.email && (
                      <div className="flex items-center text-sm">
                        <span className="w-24 text-gray-500">Email:</span>
                        <span className="text-blue-600 truncate text-xs">{atleta.email}</span>
                      </div>
                    )}
                    {atleta.documentos?.cc && (
                      <div className="flex items-center text-sm">
                        <span className="w-24 text-gray-500">CC:</span>
                        <span className="font-mono text-xs">{atleta.documentos.cc}</span>
                      </div>
                    )}
                    {atleta.documentos?.exameMedico && (
                      <div className="flex items-center text-sm">
                        <span className="w-24 text-gray-500">Exame:</span>
                        <span className="text-xs">{atleta.documentos.exameMedico}</span>
                      </div>
                    )}
                    {atleta.observacoes && (
                      <div className="flex items-start text-sm mt-3 pt-3 border-t border-gray-100">
                        <span className="w-24 text-gray-500 flex-shrink-0">Obs:</span>
                        <span className="text-xs text-gray-600 line-clamp-2">{atleta.observacoes}</span>
                      </div>
                    )}
                  </div>


                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {atleta.equipa || 'Sem equipa'}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {atleta.posicao || 'Sem posição'}
                    </span>
                    {atleta.escalao && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {atleta.escalao}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>


      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-600" />
                <span>Nova Atleta</span>
              </h2>
            </div>


            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Ana Rodrigues Silva"
                      required
                    />
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Idade *</label>
                      <input
                        type="number"
                        value={formData.idade}
                        onChange={(e) => setFormData({...formData, idade: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="16"
                        min="6"
                        max="99"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Escalão *</label>
                      <select
                        value={formData.escalao}
                        onChange={(e) => setFormData({...formData, escalao: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione</option>
                        {escaloes.map(esc => (
                          <option key={esc} value={esc}>{esc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>


              {/* Documentos */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Documentação
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cartão de Cidadão (Nº)</label>
                    <input
                      type="text"
                      value={formData.documentos.cc}
                      onChange={(e) => setFormData({
                        ...formData, 
                        documentos: {...formData.documentos, cc: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="12345678 9 ZZ0"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exame Médico (Validade)</label>
                    <input
                      type="date"
                      value={formData.documentos.exameMedico}
                      onChange={(e) => setFormData({
                        ...formData, 
                        documentos: {...formData.documentos, exameMedico: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>


              {/* Equipa e Posição */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Desportivos</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Equipa *</label>
                    <select
                      value={formData.equipa}
                      onChange={(e) => setFormData({...formData, equipa: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione uma equipa</option>
                      {equipas.map(eq => (
                        <option key={eq} value={eq}>{eq}</option>
                      ))}
                    </select>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Posição *</label>
                    <select
                      value={formData.posicao}
                      onChange={(e) => setFormData({...formData, posicao: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione posição</option>
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>


              {/* Contactos */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactos</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="916 123 456"
                      required
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="ana.rodrigues@email.com"
                    />
                  </div>
                </div>
              </div>


              {/* Observações */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                  placeholder="Notas adicionais, lesões, alergias, etc..."
                />
              </div>


              {/* Botões */}
              <div className="flex space-x-4 pt-4 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-xl font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Atleta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
