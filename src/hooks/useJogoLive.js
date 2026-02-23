import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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

export function useJogoLive(jogoId) {
  const navigate = useNavigate();
  
  const [jogo, setJogo] = useState(null);
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historico, setHistorico] = useState([]);
  const [setAtual, setSetAtual] = useState(1);
  const [atletasEmCampo, setAtletasEmCampo] = useState([]);
  const [resultadoTemp, setResultadoTemp] = useState({ nos: 0, adversario: 0 });
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (jogoId) {
      loadJogo();
      loadHistorico();
    }
  }, [jogoId]);

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

        // ATAQUE
        if (tipo === 'ataque_ponto') {
          newStats[acao.atletaId].ataques += 1;
          newStats[acao.atletaId].ataquesEficazes += 1;
          newStats[acao.atletaId].pontos += 1;
        } else if (tipo === 'ataque_continuidade') {
          newStats[acao.atletaId].ataques += 1;
        } else if (tipo === 'ataque_erro') {
          newStats[acao.atletaId].ataques += 1;
          newStats[acao.atletaId].erros += 1;
          newStats[acao.atletaId].errosAtaque += 1;
        }
        // SERVIÇO
        else if (tipo === 'servico_ace') {
          newStats[acao.atletaId].aces += 1;
          newStats[acao.atletaId].pontos += 1;
        } else if (tipo === 'servico_erro') {
          newStats[acao.atletaId].erros += 1;
          newStats[acao.atletaId].errosServico += 1;
        }
        // BLOCO
        else if (tipo === 'bloco_ponto') {
          newStats[acao.atletaId].bloqueios += 1;
          newStats[acao.atletaId].pontos += 1;
        }
        // DEFESA
        else if (tipo === 'defesa_boa' || tipo === 'defesa_tocou') {
          newStats[acao.atletaId].defesas += 1;
        }
        // COMPATIBILIDADE COM SISTEMA ANTIGO
        else if (tipo === 'ace') {
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
      
      // ATAQUE
      if (tipo === 'ataque_ponto') {
        newStats[atletaId].ataques += 1;
        newStats[atletaId].ataquesEficazes += 1;
        newStats[atletaId].pontos += 1;
      } else if (tipo === 'ataque_continuidade') {
        newStats[atletaId].ataques += 1;
      } else if (tipo === 'ataque_erro') {
        newStats[atletaId].ataques += 1;
        newStats[atletaId].erros += 1;
        newStats[atletaId].errosAtaque += 1;
      }
      // SERVIÇO
      else if (tipo === 'servico_ace') {
        newStats[atletaId].aces += 1;
        newStats[atletaId].pontos += 1;
      } else if (tipo === 'servico_erro') {
        newStats[atletaId].erros += 1;
        newStats[atletaId].errosServico += 1;
      }
      // BLOCO
      else if (tipo === 'bloco_ponto') {
        newStats[atletaId].bloqueios += 1;
        newStats[atletaId].pontos += 1;
      }
      // DEFESA
      else if (tipo === 'defesa_boa' || tipo === 'defesa_tocou') {
        newStats[atletaId].defesas += 1;
      }

      setStats(newStats);
      toast.success('✓', { duration: 500 });
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao registar');
    }
  };

  const registarAcaoGeral = async (tipo) => {
    try {
      const acao = {
        jogoId,
        atletaId: null,
        atletaNome: tipo === 'erro_adversario' ? 'Adversário' : 'Equipa',
        tipo,
        set: setAtual,
        timestamp: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'acoes_jogo'), acao);
      setHistorico([{ id: docRef.id, ...acao }, ...historico]);

      // Atualizar resultado automaticamente
      if (tipo === 'erro_adversario') {
        const novoResultado = { ...resultadoTemp, nos: resultadoTemp.nos + 1 };
        setResultadoTemp(novoResultado);
        await updateDoc(doc(db, 'jogos', jogoId), {
          resultado: novoResultado,
          updatedAt: Timestamp.now(),
        });
      } else if (tipo === 'ponto_adversario') {
        const novoResultado = {
          ...resultadoTemp,
          adversario: resultadoTemp.adversario + 1,
        };
        setResultadoTemp(novoResultado);
        await updateDoc(doc(db, 'jogos', jogoId), {
          resultado: novoResultado,
          updatedAt: Timestamp.now(),
        });
      } else if (tipo === 'erro_equipa') {
        const novoResultado = {
          ...resultadoTemp,
          adversario: resultadoTemp.adversario + 1,
        };
        setResultadoTemp(novoResultado);
        await updateDoc(doc(db, 'jogos', jogoId), {
          resultado: novoResultado,
          updatedAt: Timestamp.now(),
        });
      }

      toast.success('✓', { duration: 500 });
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro');
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

  const atualizarResultado = async (novoResultado) => {
    try {
      await updateDoc(doc(db, 'jogos', jogoId), {
        resultado: novoResultado,
        updatedAt: Timestamp.now(),
      });

      setJogo({ ...jogo, resultado: novoResultado });
      setResultadoTemp(novoResultado);
      toast.success('Resultado atualizado!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar');
    }
  };

  const adicionarPonto = async (equipa, valor = 1) => {
    try {
      const novoValor = resultadoTemp[equipa] + valor;
      
      if (novoValor < 0) {
        toast.error('Pontuação não pode ser negativa');
        return;
      }

      const novoResultado = {
        ...resultadoTemp,
        [equipa]: novoValor,
      };

      await updateDoc(doc(db, 'jogos', jogoId), {
        resultado: novoResultado,
        updatedAt: Timestamp.now(),
      });

      setResultadoTemp(novoResultado);
      setJogo({ ...jogo, resultado: novoResultado });
      
      toast.success(valor > 0 ? '✓ +1' : '✓ -1', { duration: 500 });
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar');
    }
  };

  const resetarSetEPlacar = async (novoSet) => {
    if (!confirm(`Iniciar Set ${novoSet}? Isto vai resetar o placar.`)) {
      return;
    }

    try {
      const resultadoZero = { nos: 0, adversario: 0 };
      
      await updateDoc(doc(db, 'jogos', jogoId), {
        resultado: resultadoZero,
        updatedAt: Timestamp.now(),
      });

      setResultadoTemp(resultadoZero);
      setJogo({ ...jogo, resultado: resultadoZero });
      setSetAtual(novoSet);
      
      toast.success(`Set ${novoSet} iniciado!`);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao resetar');
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
          ...estatisticas,
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

  return {
    jogo,
    atletas,
    loading,
    historico,
    setAtual,
    setSetAtual,
    atletasEmCampo,
    resultadoTemp,
    setResultadoTemp,
    stats,
    registarAcao,
    registarAcaoGeral,
    desfazerUltima,
    toggleAtletaEmCampo,
    atualizarResultado,
    adicionarPonto,
    resetarSetEPlacar,
    finalizarJogo,
  };
}
