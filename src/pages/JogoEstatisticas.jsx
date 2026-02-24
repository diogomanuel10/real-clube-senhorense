import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  Plus,
  TrendingUp,
  Award,
  Target,
  Zap,
  Shield,
  Users,
  Edit,
  Trash2,
  BarChart3,
  Trophy,
} from 'lucide-react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../utils/firebase';

export default function JogoEstatisticas({ user }) {
  const { jogoId } = useParams();
  const permissions = usePermissions(user);
  const navigate = useNavigate();

  const [jogo, setJogo] = useState(null);
  const [estatisticas, setEstatisticas] = useState([]);
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [formData, setFormData] = useState({
    atletaId: '',
    pontos: 0,
    aces: 0,
    bloqueios: 0,
    ataques: 0,
    ataquesEficazes: 0,
    defesas: 0,
    levantamentos: 0,
    erros: 0,
    titular: true,
  });

  useEffect(() => {
    if (!permissions.loading && jogoId) {
      loadJogo();
      loadEstatisticas();
    }
  }, [permissions.loading, jogoId]);

  const loadJogo = async () => {
    try {
      const docRef = doc(db, 'jogos', jogoId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const jogoData = {
          id: docSnap.id,
          ...docSnap.data(),
          data: docSnap.data().data?.toDate ? docSnap.data().data.toDate() : new Date(docSnap.data().data),
        };
        setJogo(jogoData);

        // Carregar atletas da equipa do jogo
        await loadAtletas(jogoData.equipa);
      } else {
        toast.error('Jogo não encontrado');
        navigate('/jogos');
      }
    } catch (error) {
      console.error('Erro ao carregar jogo:', error);
      toast.error('Erro ao carregar jogo');
    }
  };

  const loadAtletas = async (equipa) => {
    try {
      const q = query(
        collection(db, 'atletas'),
        where('equipa', '==', equipa)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAtletas(data);
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
    }
  };

  const loadEstatisticas = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'estatisticas_jogo'),
        where('jogoId', '==', jogoId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!permissions.isAdmin && !permissions.isDirecao && !permissions.isTreinador) {
      alert('Não tem permissão');
      return;
    }

    if (permissions.isTreinador && !permissions.equipas.includes(jogo.equipa)) {
      alert('Não pode adicionar estatísticas para esta equipa');
      return;
    }

    const loadingToast = toast.loading(
      editingStat ? 'A atualizar...' : 'A adicionar...'
    );

    try {
      const atleta = atletas.find((a) => a.id === formData.atletaId);

      const statData = {
        jogoId,
        atletaId: formData.atletaId,
        atletaNome: atleta?.nome || '',
        equipa: jogo.equipa,
        pontos: parseInt(formData.pontos) || 0,
        aces: parseInt(formData.aces) || 0,
        bloqueios: parseInt(formData.bloqueios) || 0,
        ataques: parseInt(formData.ataques) || 0,
        ataquesEficazes: parseInt(formData.ataquesEficazes) || 0,
        defesas: parseInt(formData.defesas) || 0,
        levantamentos: parseInt(formData.levantamentos) || 0,
        erros: parseInt(formData.erros) || 0,
        titular: formData.titular,
        updatedAt: Timestamp.now(),
      };

      if (editingStat) {
        const ref = doc(db, 'estatisticas_jogo', editingStat.id);
        await updateDoc(ref, statData);
        toast.success('Estatísticas atualizadas!', { id: loadingToast });
      } else {
        await addDoc(collection(db, 'estatisticas_jogo'), {
          ...statData,
          createdAt: Timestamp.now(),
        });
        toast.success('Estatísticas adicionadas!', { id: loadingToast });
      }

      setShowAddModal(false);
      setEditingStat(null);
      resetForm();
      loadEstatisticas();
    } catch (error) {
      console.error('Erro ao guardar:', error);
      toast.error('Erro: ' + error.message, { id: loadingToast });
    }
  };

  const handleDelete = async (statId) => {
    if (!permissions.isAdmin && !permissions.isDirecao && !permissions.isTreinador) {
      alert('Não tem permissão');
      return;
    }

    if (!confirm('Eliminar estas estatísticas?')) return;

    const loadingToast = toast.loading('A eliminar...');
    try {
      await deleteDoc(doc(db, 'estatisticas_jogo', statId));
      toast.success('Eliminado!', { id: loadingToast });
      loadEstatisticas();
    } catch (error) {
      console.error('Erro ao eliminar:', error);
      toast.error('Erro ao eliminar', { id: loadingToast });
    }
  };

  const resetForm = () => {
    setFormData({
      atletaId: '',
      pontos: 0,
      aces: 0,
      bloqueios: 0,
      ataques: 0,
      ataquesEficazes: 0,
      defesas: 0,
      levantamentos: 0,
      erros: 0,
      titular: true,
    });
  };

  const abrirModalAdicionar = () => {
    if (!permissions.isAdmin && !permissions.isDirecao && !permissions.isTreinador) {
      alert('Não tem permissão');
      return;
    }

    if (permissions.isTreinador && !permissions.equipas.includes(jogo?.equipa)) {
      alert('Não pode adicionar estatísticas para esta equipa');
      return;
    }

    setEditingStat(null);
    resetForm();
    setShowAddModal(true);
  };

  const abrirModalEditar = (stat) => {
    if (!permissions.isAdmin && !permissions.isDirecao && !permissions.isTreinador) {
      alert('Não tem permissão');
      return;
    }

    setFormData({
      atletaId: stat.atletaId || '',
      pontos: stat.pontos || 0,
      aces: stat.aces || 0,
      bloqueios: stat.bloqueios || 0,
      ataques: stat.ataques || 0,
      ataquesEficazes: stat.ataquesEficazes || 0,
      defesas: stat.defesas || 0,
      levantamentos: stat.levantamentos || 0,
      erros: stat.erros || 0,
      titular: stat.titular !== false,
    });
    setEditingStat(stat);
    setShowAddModal(true);
  };

  // Calcular totais da equipa
  const totais = estatisticas.reduce(
    (acc, stat) => ({
      pontos: acc.pontos + (stat.pontos || 0),
      aces: acc.aces + (stat.aces || 0),
      bloqueios: acc.bloqueios + (stat.bloqueios || 0),
      ataques: acc.ataques + (stat.ataques || 0),
      ataquesEficazes: acc.ataquesEficazes + (stat.ataquesEficazes || 0),
      defesas: acc.defesas + (stat.defesas || 0),
      levantamentos: acc.levantamentos + (stat.levantamentos || 0),
      erros: acc.erros + (stat.erros || 0),
    }),
    { pontos: 0, aces: 0, bloqueios: 0, ataques: 0, ataquesEficazes: 0, defesas: 0, levantamentos: 0, erros: 0 }
  );

  // Top performers
  const topPontos = [...estatisticas].sort((a, b) => (b.pontos || 0) - (a.pontos || 0)).slice(0, 3);
  const topAces = [...estatisticas].sort((a, b) => (b.aces || 0) - (a.aces || 0)).slice(0, 3);
  const topBloqueios = [...estatisticas].sort((a, b) => (b.bloqueios || 0) - (a.bloqueios || 0)).slice(0, 3);

  if (permissions.loading || !jogo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const calcularMVP = () => {
    if (estatisticas.length === 0) return null;

    const pontuacoes = estatisticas.map(atleta => {
      const pontos = atleta.pontos || 0;
      const aces = (atleta.aces || 0) * 2;
      const bloqueios = (atleta.bloqueios || 0) * 2;
      const defesas = (atleta.defesas || 0) * 0.5;
      const erros = (atleta.erros || 0) * -1.5;

      const eficienciaAtaque = atleta.ataques > 0
        ? ((atleta.ataquesEficazes || 0) / atleta.ataques) * 100
        : 0;
      const bonusEficiencia = eficienciaAtaque > 40 ? 5 : 0;

      const pontuacaoFinal = pontos + aces + bloqueios + defesas + erros + bonusEficiencia;

      return {
        ...atleta,
        pontuacaoMVP: pontuacaoFinal,
        eficienciaAtaque,
      };
    });

    return pontuacoes.reduce((melhor, atual) =>
      atual.pontuacaoMVP > melhor.pontuacaoMVP ? atual : melhor
    );
  };

  // AGORA SIM, chama a função:
  const mvp = calcularMVP();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/jogos')}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Estatísticas do Jogo</h1>
                <p className="text-sm text-gray-600">
                  {jogo.equipa} vs {jogo.adversario}
                </p>
              </div>
            </div>

            {(permissions.isAdmin || permissions.isDirecao ||
              (permissions.isTreinador && permissions.equipas.includes(jogo.equipa))) && (
                <button onClick={abrirModalAdicionar} className="btn-primary text-sm">
                  <Plus className="w-4 h-4" />
                  Adicionar Stats
                </button>
              )}
          </div>

          {/* Placar */}
          <div className="flex items-center justify-center gap-8 py-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">{jogo.equipa}</p>
              <p className="text-3xl font-bold text-gray-900">{jogo.resultado?.nos || 0}</p>
            </div>
            <div className="text-xl font-bold text-gray-400">vs</div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">{jogo.adversario}</p>
              <p className="text-3xl font-bold text-gray-900">{jogo.resultado?.adversario || 0}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* TOTAIS DA EQUIPA */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Pontos</span>
            </div>
            <p className="text-3xl font-bold">{totais.pontos}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Aces</span>
            </div>
            <p className="text-3xl font-bold">{totais.aces}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Bloqueios</span>
            </div>
            <p className="text-3xl font-bold">{totais.bloqueios}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Defesas</span>
            </div>
            <p className="text-3xl font-bold">{totais.defesas}</p>
          </div>
        </div>

        {/* MVP + TOP PERFORMERS */}
        {estatisticas.length > 0 && (
          <>
            {/* MVP */}
            {mvp && (
              <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">MVP do Jogo</h2>
                        <p className="text-white/80 text-sm">Melhor em Campo</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black">{mvp.pontos}</p>
                      <p className="text-white/80 text-sm">pontos</p>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                    <p className="text-3xl font-bold mb-1">{mvp.atletaNome}</p>
                    {mvp.titular && (
                      <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm">
                        Titular
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{mvp.aces || 0}</p>
                      <p className="text-white/80 text-xs">Aces</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{mvp.bloqueios || 0}</p>
                      <p className="text-white/80 text-xs">Blocos</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{mvp.ataquesEficazes || 0}/{mvp.ataques || 0}</p>
                      <p className="text-white/80 text-xs">Ataques</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">
                        {mvp.ataques > 0 ? mvp.eficienciaAtaque.toFixed(0) : 0}%
                      </p>
                      <p className="text-white/80 text-xs">Eficiência</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{mvp.defesas || 0}</p>
                      <p className="text-white/80 text-xs">Defesas</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TOP PERFORMERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Pontuadores
                </h3>
                <div className="space-y-3">
                  {topPontos.map((stat, idx) => (
                    <div key={stat.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-gray-100 text-gray-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-700">{stat.atletaNome}</span>
                      </div>
                      <span className="font-bold text-gray-900">{stat.pontos}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Top Aces
                </h3>
                <div className="space-y-3">
                  {topAces.map((stat, idx) => (
                    <div key={stat.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-gray-100 text-gray-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-700">{stat.atletaNome}</span>
                      </div>
                      <span className="font-bold text-gray-900">{stat.aces}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Top Bloqueios
                </h3>
                <div className="space-y-3">
                  {topBloqueios.map((stat, idx) => (
                    <div key={stat.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-gray-100 text-gray-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-700">{stat.atletaNome}</span>
                      </div>
                      <span className="font-bold text-gray-900">{stat.bloqueios}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}


        {/* TABELA DE ESTATÍSTICAS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estatísticas Individuais
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : estatisticas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sem estatísticas
              </h3>
              <p className="text-gray-600 mb-4">
                Ainda não foram adicionadas estatísticas para este jogo
              </p>
              {(permissions.isAdmin || permissions.isDirecao ||
                (permissions.isTreinador && permissions.equipas.includes(jogo.equipa))) && (
                  <button onClick={abrirModalAdicionar} className="btn-primary text-sm">
                    <Plus className="w-4 h-4" />
                    Adicionar Estatísticas
                  </button>
                )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Atleta
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Pontos
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Aces
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Bloqueios
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Ataques
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Defesas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Erros
                    </th>
                    {(permissions.isAdmin || permissions.isDirecao ||
                      (permissions.isTreinador && permissions.equipas.includes(jogo.equipa))) && (
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Ações
                        </th>
                      )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {estatisticas.map((stat) => {
                    const isMVP = mvp && stat.id === mvp.id; // ← ADICIONA ESTA LINHA

                    return (
                      <tr key={stat.id} className={`${isMVP ? 'bg-yellow-50 border-l-4 border-yellow-500' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isMVP && <Trophy className="w-4 h-4 text-yellow-500" />}
                            <span className="font-medium text-gray-900">{stat.atletaNome}</span>
                            {stat.titular && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Titular
                              </span>
                            )}
                            {isMVP && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">
                                MVP
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-900">
                          {stat.pontos || 0}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {stat.aces || 0}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {stat.bloqueios || 0}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {stat.ataquesEficazes || 0}/{stat.ataques || 0}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {stat.defesas || 0}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {stat.erros || 0}
                        </td>
                        {(permissions.isAdmin || permissions.isDirecao ||
                          (permissions.isTreinador && permissions.equipas.includes(jogo.equipa))) && (
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => abrirModalEditar(stat)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(stat.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingStat ? 'Editar Estatísticas' : 'Adicionar Estatísticas'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atleta *
                </label>
                <select
                  value={formData.atletaId}
                  onChange={(e) => setFormData({ ...formData, atletaId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                  disabled={!!editingStat}
                >
                  <option value="">Selecionar atleta</option>
                  {atletas.map((atleta) => (
                    <option key={atleta.id} value={atleta.id}>
                      {atleta.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="titular"
                  checked={formData.titular}
                  onChange={(e) => setFormData({ ...formData, titular: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="titular" className="text-sm font-medium text-gray-700">
                  Titular
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pontos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pontos}
                    onChange={(e) => setFormData({ ...formData, pontos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aces
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.aces}
                    onChange={(e) => setFormData({ ...formData, aces: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bloqueios
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bloqueios}
                    onChange={(e) => setFormData({ ...formData, bloqueios: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ataques
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.ataques}
                    onChange={(e) => setFormData({ ...formData, ataques: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ataques Eficazes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.ataquesEficazes}
                    onChange={(e) => setFormData({ ...formData, ataquesEficazes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Defesas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.defesas}
                    onChange={(e) => setFormData({ ...formData, defesas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Levantamentos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.levantamentos}
                    onChange={(e) => setFormData({ ...formData, levantamentos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Erros
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.erros}
                    onChange={(e) => setFormData({ ...formData, erros: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
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
                  {editingStat ? 'Guardar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
