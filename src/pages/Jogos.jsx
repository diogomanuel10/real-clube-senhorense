import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import toast from 'react-hot-toast';
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../utils/firebase';

export default function Jogos({ user }) {
  const permissions = usePermissions(user);
  const navigate = useNavigate();

  const [jogos, setJogos] = useState([]);
  const [escaloes, setEscaloes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJogo, setEditingJogo] = useState(null);
  const [filtroEquipa, setFiltroEquipa] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [formData, setFormData] = useState({
    data: '',
    hora: '',
    equipa: '',
    adversario: '',
    local: 'Casa',
    competicao: 'Campeonato',
    estado: 'agendado',
    resultado: {
      nos: 0,
      adversario: 0,
      sets: '',
    },
  });

  useEffect(() => {
    if (!permissions.loading) {
      loadJogos();
      loadEscaloes();
    }
  }, [permissions.loading]);

  const loadJogos = async () => {
    setLoading(true);
    try {
      let q;
      
      if (permissions.isTreinador && permissions.equipas.length > 0) {
        q = query(
          collection(db, 'jogos'),
          where('equipa', 'in', permissions.equipas),
          orderBy('data', 'desc')
        );
      } else {
        q = query(collection(db, 'jogos'), orderBy('data', 'desc'));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate ? doc.data().data.toDate() : new Date(doc.data().data),
      }));
      
      setJogos(data);
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
      toast.error('Erro ao carregar jogos');
    } finally {
      setLoading(false);
    }
  };

  const loadEscaloes = async () => {
    try {
      const snap = await getDocs(collection(db, 'escaloes'));
      let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (permissions.isTreinador && permissions.equipas.length > 0) {
        data = data.filter((esc) => permissions.equipas.includes(esc.nome));
      }

      data.sort((a, b) => a.nome.localeCompare(b.nome));
      setEscaloes(data);
    } catch (err) {
      console.error('Erro ao carregar escalões:', err);
      toast.error('Erro ao carregar escalões');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!permissions.isAdmin && !permissions.isDirecao && !permissions.isTreinador) {
      toast.error('Não tem permissão para criar jogos');
      return;
    }

    if (permissions.isTreinador && !permissions.equipas.includes(formData.equipa)) {
      toast.error('Não pode criar jogos para esta equipa');
      return;
    }

    const loadingToast = toast.loading(
      editingJogo ? 'A atualizar jogo...' : 'A criar jogo...'
    );

    try {
      const dataHora = new Date(`${formData.data}T${formData.hora}`);

      const jogoData = {
        data: Timestamp.fromDate(dataHora),
        equipa: formData.equipa,
        adversario: formData.adversario,
        local: formData.local,
        competicao: formData.competicao,
        estado: formData.estado,
        resultado: formData.resultado,
        updatedAt: Timestamp.now(),
      };

      if (editingJogo) {
        const ref = doc(db, 'jogos', editingJogo.id);
        await updateDoc(ref, jogoData);
        toast.success('Jogo atualizado!', { id: loadingToast });
      } else {
        await addDoc(collection(db, 'jogos'), {
          ...jogoData,
          createdBy: user.uid,
          createdAt: Timestamp.now(),
        });
        toast.success('Jogo criado!', { id: loadingToast });
      }

      setShowAddModal(false);
      setEditingJogo(null);
      resetForm();
      loadJogos();
    } catch (error) {
      console.error('Erro ao guardar jogo:', error);
      toast.error('Erro: ' + error.message, { id: loadingToast });
    }
  };

const handleDeleteJogo = async (jogoId, equipa) => {
  if (!permissions.isAdmin && !permissions.isDirecao) {
    alert('Não tem permissão para eliminar jogos');
    return;
  }

  if (permissions.isTreinador && !permissions.equipas.includes(equipa)) {
    alert('Não pode eliminar jogos de outras equipas');
    return;
  }

  if (!confirm('Tens a certeza? As estatísticas deste jogo também serão eliminadas.')) {
    return;
  }

  const loadingToast = toast.loading('A eliminar jogo...');
  try {
    const statsQuery = query(
      collection(db, 'estatisticas_jogo'),
      where('jogoId', '==', jogoId)
    );
    const statsSnap = await getDocs(statsQuery);
    
    for (const statDoc of statsSnap.docs) {
      await deleteDoc(doc(db, 'estatisticas_jogo', statDoc.id));
    }

    await deleteDoc(doc(db, 'jogos', jogoId));
    toast.success('Jogo eliminado!', { id: loadingToast });
    loadJogos();
  } catch (error) {
    console.error('Erro ao eliminar:', error);
    toast.error('Erro ao eliminar', { id: loadingToast });
  }
};


  const resetForm = () => {
    setFormData({
      data: '',
      hora: '',
      equipa: '',
      adversario: '',
      local: 'Casa',
      competicao: 'Campeonato',
      estado: 'agendado',
      resultado: {
        nos: 0,
        adversario: 0,
        sets: '',
      },
    });
  };

  const abrirModalAdicionar = () => {
    if (!permissions.isAdmin && !permissions.isDirecao && !permissions.isTreinador) {
      toast.error('Não tem permissão para criar jogos');
      return;
    }

    setEditingJogo(null);
    resetForm();
    setShowAddModal(true);
  };

  const abrirModalEditar = (jogo, e) => {
    e.stopPropagation();

    if (!permissions.isAdmin && !permissions.isDirecao && !permissions.isTreinador) {
      toast.error('Não tem permissão para editar jogos');
      return;
    }

    if (permissions.isTreinador && !permissions.equipas.includes(jogo.equipa)) {
      toast.error('Não pode editar jogos de outras equipas');
      return;
    }

    const dataJogo = jogo.data instanceof Date ? jogo.data : new Date(jogo.data);

    setFormData({
      data: dataJogo.toISOString().split('T')[0],
      hora: dataJogo.toTimeString().slice(0, 5),
      equipa: jogo.equipa || '',
      adversario: jogo.adversario || '',
      local: jogo.local || 'Casa',
      competicao: jogo.competicao || 'Campeonato',
      estado: jogo.estado || 'agendado',
      resultado: jogo.resultado || { nos: 0, adversario: 0, sets: '' },
    });
    setEditingJogo(jogo);
    setShowAddModal(true);
  };

  const filteredJogos = jogos.filter((jogo) => {
    const matchTexto =
      jogo.adversario?.toLowerCase().includes(search.toLowerCase()) ||
      jogo.equipa?.toLowerCase().includes(search.toLowerCase()) ||
      jogo.competicao?.toLowerCase().includes(search.toLowerCase());

    const matchEquipa = filtroEquipa ? jogo.equipa === filtroEquipa : true;
    const matchEstado = filtroEstado ? jogo.estado === filtroEstado : true;

    return matchTexto && matchEquipa && matchEstado;
  });

  const getEstadoBadge = (estado) => {
    const badges = {
      agendado: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Agendado', icon: Clock },
      em_curso: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Em Curso', icon: TrendingUp },
      finalizado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Finalizado', icon: CheckCircle },
      cancelado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado', icon: XCircle },
    };

    const badge = badges[estado] || badges.agendado;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const formatData = (data) => {
    const dataObj = data instanceof Date ? data : new Date(data);
    return dataObj.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (permissions.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Jogos</h1>
                <p className="text-sm text-gray-600">
                  {filteredJogos.length} {filteredJogos.length === 1 ? 'jogo' : 'jogos'}
                  {permissions.isTreinador && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {permissions.equipas.length} equipa{permissions.equipas.length > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={abrirModalAdicionar}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" />
              Novo Jogo
            </button>
          </div>
        </div>
      </header>

      {/* FILTROS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Procurar por adversário, equipa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filtroEquipa}
              onChange={(e) => setFiltroEquipa(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as equipas</option>
              {escaloes.map((esc) => (
                <option key={esc.id} value={esc.nome}>
                  {esc.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os estados</option>
              <option value="agendado">Agendado</option>
              <option value="em_curso">Em Curso</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* LISTA DE JOGOS */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredJogos.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum jogo encontrado
            </h3>
            <p className="text-gray-600">
              {jogos.length === 0
                ? 'Ainda não há jogos registados'
                : 'Tenta ajustar os filtros'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJogos.map((jogo) => (
              <div
                key={jogo.id}
                onClick={() => navigate(`/jogos/${jogo.id}/live`)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          {formatData(jogo.data)}
                        </span>
                        {getEstadoBadge(jogo.estado)}
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {jogo.local} • {jogo.competicao}
                        </span>
                      </div>
                    </div>

                    {(permissions.isAdmin || permissions.isDirecao || 
                      (permissions.isTreinador && permissions.equipas.includes(jogo.equipa))) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => abrirModalEditar(jogo, e)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJogo(jogo.id, jogo.equipa);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Placar */}
                  <div className="flex items-center justify-center gap-8 py-6">
                    <div className="text-center flex-1">
                      <p className="text-sm text-gray-600 mb-2">{jogo.equipa}</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {jogo.resultado?.nos || 0}
                      </p>
                    </div>

                    <div className="text-2xl font-bold text-gray-400">vs</div>

                    <div className="text-center flex-1">
                      <p className="text-sm text-gray-600 mb-2">{jogo.adversario}</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {jogo.resultado?.adversario || 0}
                      </p>
                    </div>
                  </div>

                  {jogo.resultado?.sets && (
                    <div className="text-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">
                        Sets: <span className="font-semibold">{jogo.resultado.sets}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL ADICIONAR/EDITAR */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingJogo ? 'Editar Jogo' : 'Novo Jogo'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) =>
                      setFormData({ ...formData, data: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) =>
                      setFormData({ ...formData, hora: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipa *
                  </label>
                  <select
                    value={formData.equipa}
                    onChange={(e) =>
                      setFormData({ ...formData, equipa: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  >
                    <option value="">Selecionar equipa</option>
                    {escaloes.map((esc) => (
                      <option key={esc.id} value={esc.nome}>
                        {esc.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adversário *
                  </label>
                  <input
                    type="text"
                    value={formData.adversario}
                    onChange={(e) =>
                      setFormData({ ...formData, adversario: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Nome do adversário"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local *
                  </label>
                  <select
                    value={formData.local}
                    onChange={(e) =>
                      setFormData({ ...formData, local: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  >
                    <option value="Casa">Casa</option>
                    <option value="Fora">Fora</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competição *
                  </label>
                  <select
                    value={formData.competicao}
                    onChange={(e) =>
                      setFormData({ ...formData, competicao: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  >
                    <option value="Campeonato">Campeonato</option>
                    <option value="Taça">Taça</option>
                    <option value="Torneio">Torneio</option>
                    <option value="Amigável">Amigável</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  >
                    <option value="agendado">Agendado</option>
                    <option value="em_curso">Em Curso</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Resultado */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Resultado</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nós
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.resultado.nos}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resultado: {
                            ...formData.resultado,
                            nos: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adversário
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.resultado.adversario}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resultado: {
                            ...formData.resultado,
                            adversario: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sets (ex: 3-1)
                    </label>
                    <input
                      type="text"
                      value={formData.resultado.sets}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resultado: {
                            ...formData.resultado,
                            sets: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="3-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {editingJogo ? 'Guardar' : 'Criar Jogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
