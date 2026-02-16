import { useState } from 'react';
import { Megaphone, Plus, Filter, Search } from 'lucide-react';
import { useComunicados } from '../hooks/useComunicados';
import ComunicadosFeed from '../components/comunicados/ComunicadoFeed';
import ComunicadoModal from '../components/comunicados/ComunicadoModal';
import { CATEGORIAS } from '../constants/comunicados';

export default function Comunicados({ user }) {
  const {
    comunicados,
    escaloes,
    loading,
    criarComunicado,
    atualizarComunicado,
    eliminarComunicado,
    togglePin,
    incrementarVisualizacoes,
  } = useComunicados();

  const [showModal, setShowModal] = useState(false);
  const [modoModal, setModoModal] = useState('view'); // 'view', 'create', 'edit'
  const [comunicadoSelecionado, setComunicadoSelecionado] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'diretor';

  // Filtrar comunicados
  const comunicadosFiltrados = comunicados.filter(c => {
    const matchCategoria = filtroCategoria === 'todos' || c.categoria === filtroCategoria;
    const matchSearch = c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.resumo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategoria && matchSearch;
  });

  const handleView = (comunicado) => {
    setComunicadoSelecionado(comunicado);
    setModoModal('view');
    setShowModal(true);
    incrementarVisualizacoes(comunicado.id);
  };

  const handleCreate = () => {
    setComunicadoSelecionado(null);
    setModoModal('create');
    setShowModal(true);
  };

  const handleEdit = (comunicado) => {
    setComunicadoSelecionado(comunicado);
    setModoModal('edit');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja eliminar este comunicado?')) return;

    const result = await eliminarComunicado(id);
    if (result.success) {
      alert('Comunicado eliminado com sucesso!');
    } else {
      alert('Erro ao eliminar: ' + result.error);
    }
  };

  const handleTogglePin = async (id, currentPinned) => {
    const result = await togglePin(id, currentPinned);
    if (!result.success) {
      alert('Erro ao fixar comunicado: ' + result.error);
    }
  };

  const handleSave = async (dados) => {
    let result;

    if (modoModal === 'create') {
      result = await criarComunicado(dados, user.uid, user.displayName);
      if (result.success) {
        alert('Comunicado publicado com sucesso!');
      }
    } else if (modoModal === 'edit') {
      result = await atualizarComunicado(comunicadoSelecionado.id, dados);
      if (result.success) {
        alert('Comunicado atualizado com sucesso!');
      }
    }

    if (result?.success) {
      setShowModal(false);
      setComunicadoSelecionado(null);
    } else {
      alert('Erro ao guardar: ' + result?.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 md:px-8 py-4 md:py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Comunicados</h1>
                <p className="text-xs md:text-sm text-slate-600">
                  Notícias e avisos do clube
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Novo Comunicado
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar comunicados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Categoria */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="todos">Todas as Categorias</option>
                {CATEGORIAS.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Feed de Comunicados */}
        <ComunicadosFeed
          comunicados={comunicadosFiltrados}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePin={handleTogglePin}
          canEdit={isAdmin}
          loading={loading}
        />
      </main>

      {/* Modal */}
      {showModal && (
        <ComunicadoModal
          comunicado={comunicadoSelecionado}
          escaloes={escaloes}
          modo={modoModal}
          onClose={() => {
            setShowModal(false);
            setComunicadoSelecionado(null);
          }}
          onSave={handleSave}
          user={user}
        />
      )}
    </div>
  );
}
