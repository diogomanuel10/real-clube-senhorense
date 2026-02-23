import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  Save,
  RotateCcw,
  Users,
  RefreshCw,
  Edit,
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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../utils/firebase';

export default function JogoLive({ user }) {
  const { jogoId } = useParams();
  const permissions = usePermissions(user);
  const navigate = useNavigate();

  const [jogo, setJogo] = useState(null);
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState([]);
  const [setAtual, setSetAtual] = useState(1);
  const [atletasEmCampo, setAtletasEmCampo] = useState([]);
  const [showSubstituicoes, setShowSubstituicoes] = useState(false);
  const [showEditarResultado, setShowEditarResultado] = useState(false);
  const [resultadoTemp, setResultadoTemp] = useState({ nos: 0, adversario: 0 });

  // Estatísticas em tempo real
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!permissions.loading && jogoId) {
      loadJogo();
      loadHistorico();
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
          data: docSnap.data().data?.toDate
            ? docSnap.data().data.toDate()
            : new Date(docSnap.data().data),
        };
        setJogo(jogoData);
        setResultadoTemp({
          nos: jogoData.resultado?.nos || 0,
          adversario: jogoData.resultado?.adversario || 0,
        });
        await loadAtletas(jogoData.equipa);
      } else {
        toast.error('Jogo não encontrado');
        navigate('/jogos');
      }
    } catch (error) {
      console.error('Erro ao carregar jogo:', error);
      toast.error('Erro ao carregar jogo');
    } finally {
      setLoading(false);
    }
  };

  const loadAtletas = async (equipa) => {
    try {
      const q = query(collection(db, 'atletas'), where('equipa', '==', equipa));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAtletas(data);

      // Inicializar stats
      const initialStats = {};
      data.forEach((atleta) => {
        initialStats[atleta.id] = {
          pontos: 0,
          aces: 0,
          bloqueios: 0,
          ataques: 0,
          ataquesEficazes: 0,
          defesas: 0,
          erros: 0,
          errosAtaque: 0,
          errosServico: 0,
        };
      });
      setStats(initialStats);
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
    }
  };

  const loadHistorico = async () => {
    try {
      const q = query(
        collection(db, 'acoes_jogo'),
        where('jogoId', '==', jogoId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setHistorico(data);
      recalcularStats(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const recalcularStats = (acoes) => {
    const newStats = {};

    atletas.forEach((atleta) => {
      newStats[atleta.id] = {
        pontos: 0,
        aces: 0,
        bloqueios: 0,
        ataques: 0,
        ataquesEficazes: 0,
        defesas: 0,
        erros: 0,
        errosAtaque: 0,
        errosServico: 0,
      };
    });

    acoes.forEach((acao) => {
      if (newStats[acao.atletaId]) {
        const tipo = acao.tipo;

        if (tipo === 'ace') {
          newStats[acao.atletaId].aces += 1;
          newStats[acao.atletaId].pontos += 1;
        } else if (tipo === 'bloqueio') {
          newStats[acao.atletaId].bloqueios += 1;
          newStats[acao.atletaId].pontos += 1;
        } else if (tipo === 'ataque') {
          newStats[acao.atletaId].ataques += 1;
          newStats[acao.atletaId].ataquesEficazes += 1;
          newStats[acao.atletaId].pontos += 1;
        } else if (tipo === 'defesa') {
          newStats[acao.atletaId].defesas += 1;
        } else if (tipo === 'erro_ataque') {
          newStats[acao.atletaId].erros += 1;
          newStats[acao.atletaId].errosAtaque += 1;
        } else if (tipo === 'erro_servico') {
          newStats[acao.atletaId].erros += 1;
          newStats[acao.atletaId].errosServico += 1;
        }
      }
    });

    setStats(newStats);
  };

  const registarAcao = async (atletaId, tipo) => {
    if (!permissions.isAdmin && !permissions.isDirecao && !permissions.isTreinador) {
      toast.error('Sem permissão');
      return;
    }

    const atleta = atletas.find((a) => a.id === atletaId);
    if (!atleta) return;

    try {
      const acao = {
        jogoId,
        atletaId,
        atletaNome: atleta.nome,
        tipo,
        set: setAtual,
        timestamp: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'acoes_jogo'), acao);
      setHistorico([{ id: docRef.id, ...acao }, ...historico]);

      // Atualizar stats locais
      const newStats = { ...stats };
      if (tipo === 'ace') {
        newStats[atletaId].aces += 1;
        newStats[atletaId].pontos += 1;
      } else if (tipo === 'bloqueio') {
        newStats[atletaId].bloqueios += 1;
        newStats[atletaId].pontos += 1;
      } else if (tipo === 'ataque') {
        newStats[atletaId].ataques += 1;
        newStats[atletaId].ataquesEficazes += 1;
        newStats[atletaId].pontos += 1;
      } else if (tipo === 'defesa') {
        newStats[atletaId].defesas += 1;
      } else if (tipo === 'erro_ataque') {
        newStats[atletaId].erros += 1;
        newStats[atletaId].errosAtaque += 1;
      } else if (tipo === 'erro_servico') {
        newStats[atletaId].erros += 1;
        newStats[atletaId].errosServico += 1;
      }

      setStats(newStats);
      toast.success('✓', { duration: 500 });
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao registar');
    }
  };

  const desfazerUltima = async () => {
    if (historico.length === 0) {
      toast.error('Nada para desfazer');
      return;
    }

    try {
      const ultima = historico[0];
      await deleteDoc(doc(db, 'acoes_jogo', ultima.id));

      const novoHistorico = historico.slice(1);
      setHistorico(novoHistorico);
      recalcularStats(novoHistorico);

      toast.success('Desfeito');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro');
    }
  };

  const toggleAtletaEmCampo = (atletaId) => {
    if (atletasEmCampo.includes(atletaId)) {
      setAtletasEmCampo(atletasEmCampo.filter((id) => id !== atletaId));
    } else {
      if (atletasEmCampo.length >= 7) {
        toast.error('Máximo 7 atletas em campo');
        return;
      }
      setAtletasEmCampo([...atletasEmCampo, atletaId]);
    }
  };

  const atualizarResultado = async () => {
    try {
      await updateDoc(doc(db, 'jogos', jogoId), {
        resultado: resultadoTemp,
        updatedAt: Timestamp.now(),
      });

      setJogo({ ...jogo, resultado: resultadoTemp });
      setShowEditarResultado(false);
      toast.success('Resultado atualizado!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar');
    }
  };

  const finalizarJogo = async () => {
    if (!confirm('Finalizar jogo e guardar estatísticas?')) return;

    const loadingToast = toast.loading('A guardar...');

    try {
      await updateDoc(doc(db, 'jogos', jogoId), {
        estado: 'finalizado',
        resultado: resultadoTemp,
        updatedAt: Timestamp.now(),
      });

      const batch = writeBatch(db);

      Object.entries(stats).forEach(([atletaId, estatisticas]) => {
        const atleta = atletas.find((a) => a.id === atletaId);
        if (!atleta) return;

        const temStats = Object.values(estatisticas).some((v) => v > 0);
        if (!temStats) return;

        const docRef = doc(collection(db, 'estatisticas_jogo'));
        batch.set(docRef, {
          jogoId,
          atletaId,
          atletaNome: atleta.nome,
          equipa: jogo.equipa,
          pontos: estatisticas.pontos,
          aces: estatisticas.aces,
          bloqueios: estatisticas.bloqueios,
          ataques: estatisticas.ataques,
          ataquesEficazes: estatisticas.ataquesEficazes,
          defesas: estatisticas.defesas,
          erros: estatisticas.erros,
          errosAtaque: estatisticas.errosAtaque,
          errosServico: estatisticas.errosServico,
          titular: atletasEmCampo.includes(atletaId),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();

      toast.success('Jogo finalizado!', { id: loadingToast });
      navigate('/jogos');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao finalizar', { id: loadingToast });
    }
  };

  if (loading || !jogo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const atletasNoCampo = atletas.filter((a) => atletasEmCampo.includes(a.id));
  const atletasNoBanco = atletas.filter((a) => !atletasEmCampo.includes(a.id));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HEADER FIXO */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/jogos')}
              className="p-2 text-gray-400 hover:text-white rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <select
                value={setAtual}
                onChange={(e) => setSetAtual(Number(e.target.value))}
                className="px-3 py-2 bg-gray-700 rounded-lg text-sm font-bold"
              >
                <option value={1}>Set 1</option>
                <option value={2}>Set 2</option>
                <option value={3}>Set 3</option>
                <option value={4}>Set 4</option>
                <option value={5}>Set 5</option>
              </select>

              <button
                onClick={() => setShowSubstituicoes(!showSubstituicoes)}
                className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg"
              >
                <Users className="w-5 h-5" />
              </button>

              <button onClick={desfazerUltima} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                <RotateCcw className="w-5 h-5" />
              </button>

              <button onClick={finalizarJogo} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold">
                <Save className="w-5 h-5 inline mr-2" />
                Finalizar
              </button>
            </div>
          </div>

          {/* Placar com botão de edição */}
          <div className="flex items-center justify-center gap-6 py-2 bg-gray-900 rounded-lg relative">
            <button
              onClick={() => setShowEditarResultado(true)}
              className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <div className="text-center">
              <p className="text-xs text-gray-400">{jogo.equipa}</p>
              <p className="text-2xl font-bold">{resultadoTemp.nos}</p>
            </div>
            <div className="text-lg text-gray-500">vs</div>
            <div className="text-center">
              <p className="text-xs text-gray-400">{jogo.adversario}</p>
              <p className="text-2xl font-bold">{resultadoTemp.adversario}</p>
            </div>
          </div>
        </div>
      </header>

      {/* MODAL EDITAR RESULTADO */}
      {showEditarResultado && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowEditarResultado(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Atualizar Resultado</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">{jogo.equipa}</label>
                <input
                  type="number"
                  min="0"
                  value={resultadoTemp.nos}
                  onChange={(e) => setResultadoTemp({ ...resultadoTemp, nos: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-2xl font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{jogo.adversario}</label>
                <input
                  type="number"
                  min="0"
                  value={resultadoTemp.adversario}
                  onChange={(e) => setResultadoTemp({ ...resultadoTemp, adversario: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-2xl font-bold text-center"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditarResultado(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={atualizarResultado}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SUBSTITUIÇÕES */}
      {showSubstituicoes && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSubstituicoes(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Gerir Atletas em Campo</h2>
            <p className="text-sm text-gray-400 mb-4">
              Seleciona 7 atletas titulares (atualmente: {atletasEmCampo.length}/7)
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {atletas.map((atleta) => {
                const emCampo = atletasEmCampo.includes(atleta.id);
                return (
                  <button
                    key={atleta.id}
                    onClick={() => toggleAtletaEmCampo(atleta.id)}
                    className={`p-4 rounded-lg text-left transition ${
                      emCampo
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-bold">{atleta.nome}</div>
                    <div className="text-xs opacity-75">
                      {stats[atleta.id]?.pontos || 0} pts • {stats[atleta.id]?.erros || 0} erros
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowSubstituicoes(false)}
              className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* ATLETAS EM CAMPO */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {atletasNoCampo.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nenhum atleta em campo</h3>
            <p className="text-gray-400 mb-6">
              Clica no botão de substituições para selecionar os 7 atletas titulares
            </p>
            <button
              onClick={() => setShowSubstituicoes(true)}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold"
            >
              <Users className="w-5 h-5 inline mr-2" />
              Selecionar Atletas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-400 mb-3">
              Em Campo ({atletasNoCampo.length}/7)
            </h2>

            {atletasNoCampo.map((atleta) => {
              const atletaStats = stats[atleta.id];
              return (
                <div key={atleta.id} className="bg-gray-800 rounded-xl p-4">
                  {/* Nome e Stats */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold">{atleta.nome}</h3>
                      <div className="text-sm text-gray-400">
                        {atletaStats.pontos} pts • {atletaStats.aces} aces •{' '}
                        {atletaStats.bloqueios} bloq • {atletaStats.defesas} def
                      </div>
                      {atletaStats.erros > 0 && (
                        <div className="text-xs text-red-400 mt-1">
                          ❌ {atletaStats.erros} erros (At: {atletaStats.errosAtaque} | Srv: {atletaStats.errosServico})
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-400">
                        {atletaStats.pontos}
                      </div>
                      <div className="text-xs text-gray-500">pontos</div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <button
                      onClick={() => registarAcao(atleta.id, 'ace')}
                      className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-lg transition active:scale-95"
                    >
                      <div className="text-2xl font-bold">⚡</div>
                      <div className="text-xs mt-1">ACE</div>
                      <div className="text-lg font-bold">{atletaStats.aces}</div>
                    </button>

                    <button
                      onClick={() => registarAcao(atleta.id, 'ataque')}
                      className="bg-green-600 hover:bg-green-700 p-4 rounded-lg transition active:scale-95"
                    >
                      <div className="text-2xl font-bold">🔥</div>
                      <div className="text-xs mt-1">Ataque</div>
                      <div className="text-lg font-bold">{atletaStats.ataquesEficazes}</div>
                    </button>

                    <button
                      onClick={() => registarAcao(atleta.id, 'bloqueio')}
                      className="bg-red-600 hover:bg-red-700 p-4 rounded-lg transition active:scale-95"
                    >
                      <div className="text-2xl font-bold">🛡️</div>
                      <div className="text-xs mt-1">Bloqueio</div>
                      <div className="text-lg font-bold">{atletaStats.bloqueios}</div>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => registarAcao(atleta.id, 'defesa')}
                      className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition active:scale-95"
                    >
                      <div className="text-xl font-bold">🎯</div>
                      <div className="text-xs mt-1">Defesa</div>
                      <div className="text-sm font-bold">{atletaStats.defesas}</div>
                    </button>

                    <button
                      onClick={() => registarAcao(atleta.id, 'erro_ataque')}
                      className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition active:scale-95"
                    >
                      <div className="text-xl font-bold">❌</div>
                      <div className="text-xs mt-1">Erro Atq</div>
                      <div className="text-sm font-bold">{atletaStats.errosAtaque}</div>
                    </button>

                    <button
                      onClick={() => registarAcao(atleta.id, 'erro_servico')}
                      className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition active:scale-95"
                    >
                      <div className="text-xl font-bold">❌</div>
                      <div className="text-xs mt-1">Erro Srv</div>
                      <div className="text-sm font-bold">{atletaStats.errosServico}</div>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Banco */}
            {atletasNoBanco.length > 0 && (
              <div className="pt-6 border-t border-gray-700">
                <h2 className="text-lg font-bold text-gray-400 mb-3">
                  No Banco ({atletasNoBanco.length})
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {atletasNoBanco.map((atleta) => (
                    <div
                      key={atleta.id}
                      className="bg-gray-800 p-3 rounded-lg text-sm opacity-60"
                    >
                      <div className="font-bold">{atleta.nome}</div>
                      <div className="text-xs text-gray-500">
                        {stats[atleta.id]?.pontos || 0} pts • {stats[atleta.id]?.erros || 0} erros
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Últimas Ações */}
        {historico.length > 0 && (
          <div className="mt-6 bg-gray-800 rounded-xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Últimas 5 Ações
            </h3>
            <div className="space-y-2">
              {historico.slice(0, 5).map((acao) => (
                <div
                  key={acao.id}
                  className="flex items-center justify-between bg-gray-700 p-2 rounded text-sm"
                >
                  <span className="font-medium">{acao.atletaNome}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">Set {acao.set}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      acao.tipo.includes('erro') ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                      {acao.tipo.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
