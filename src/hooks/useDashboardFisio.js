// src/hooks/useDashboardFisio.js
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useClub } from '../contexts/ClubContext';

export function useDashboardFisio() {
  const { clubId } = useClub();

  const [stats, setStats] = useState({
    totalLesoes: 0,
    lesoesAtivas: 0,
    lesoesRecuperadas: 0,
    atletasEmRecuperacao: 0,
    sessoesSemana: 0,
    tempoMedioRecuperacao: 0,
  });

  const [episodiosAtivos, setEpisodiosAtivos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [historicoEpisodios, setHistoricoEpisodios] = useState([]);
  const [escaloes, setEscaloes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clubId) carregarDados();
  }, [clubId]); // ← clubId no dependency array

  const carregarDados = async () => {
    try {
      setLoading(true);

      // 1. Episódios Clínicos
      const episodiosSnap = await getDocs(collection(db, `clubs/${clubId}/episodiosClinicos`)); // ← NOVO
      const todosEpisodios = episodiosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const ativos = todosEpisodios.filter(e => e.estado === 'ativo' || e.estado === 'em_tratamento');
      const recuperados = todosEpisodios.filter(e => e.estado === 'alta' || e.estado === 'concluido');

      // 2. Sessões
      const sessoesSnap = await getDocs(collection(db, `clubs/${clubId}/sessoes`)); // ← NOVO
      const todasSessoes = sessoesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 3. Atletas
      const atletasSnap = await getDocs(collection(db, `clubs/${clubId}/atletas`)); // ← NOVO
      const todosAtletas = atletasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 4. Episódios enriquecidos com dados do atleta
      const episodiosComDados = ativos.map(episodio => {
        const atleta = todosAtletas.find(a => a.id === episodio.atletaId);
        const sessoesDoEpisodio = todasSessoes.filter(s => s.episodioClinicoId === episodio.id);
        return {
          ...episodio,
          atletaNome: atleta?.nome || 'Desconhecido',
          atletaEquipa: atleta?.equipa || 'Sem equipa',
          totalSessoes: sessoesDoEpisodio.length,
          ultimaSessao: sessoesDoEpisodio.length > 0
            ? sessoesDoEpisodio.sort((a, b) => b.data.localeCompare(a.data))[0].data
            : null,
        };
      });

      setEpisodiosAtivos(episodiosComDados);

      // 5. Tempo médio de recuperação
      const recuperadosComDatas = recuperados.filter(e => e.dataInicio && e.dataFim);
      const tempoMedio = recuperadosComDatas.length > 0
        ? Math.round(
            recuperadosComDatas.reduce((acc, e) => {
              const dias = Math.round((new Date(e.dataFim) - new Date(e.dataInicio)) / (1000 * 60 * 60 * 24));
              return acc + dias;
            }, 0) / recuperadosComDatas.length
          )
        : 0;

      // 6. Sessões da última semana
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - 7);
      const inicioSemanaISO = inicioSemana.toISOString().slice(0, 10);
      const hojeISO = hoje.toISOString().slice(0, 10);

      const sessoesSemana = todasSessoes.filter(s => s.data >= inicioSemanaISO && s.data <= hojeISO);

      // 7. Agendamentos (próximos 7 dias)
      const fimSemana = new Date(hoje);
      fimSemana.setDate(hoje.getDate() + 7);
      const fimSemanaISO = fimSemana.toISOString().slice(0, 10);

      const agendamentosFuturos = todasSessoes
        .filter(s => s.data >= hojeISO && s.data <= fimSemanaISO && s.estado !== 'concluida')
        .map(sessao => {
          const episodio = todosEpisodios.find(e => e.id === sessao.episodioClinicoId);
          const atleta = todosAtletas.find(a => a.id === episodio?.atletaId);
          return {
            ...sessao,
            atletaNome: atleta?.nome || 'Desconhecido',
            atletaEquipa: atleta?.equipa || 'Sem equipa',
            tipoEpisodio: episodio?.tipo || 'Não especificado',
          };
        })
        .sort((a, b) => a.data.localeCompare(b.data));

      setAgendamentos(agendamentosFuturos);

      // 8. Histórico de Episódios (últimos 10)
      const historicoOrdenado = todosEpisodios
        .sort((a, b) => (b.dataInicio || '2000-01-01').localeCompare(a.dataInicio || '2000-01-01'))
        .slice(0, 10)
        .map(episodio => {
          const atleta = todosAtletas.find(a => a.id === episodio.atletaId);
          return {
            ...episodio,
            atletaNome: atleta?.nome || 'Desconhecido',
            atletaEquipa: atleta?.equipa || 'Sem equipa',
            totalSessoes: todasSessoes.filter(s => s.episodioClinicoId === episodio.id).length,
          };
        });

      setHistoricoEpisodios(historicoOrdenado);

      // 9. Escalões com stats
      const escaloesSnap = await getDocs(collection(db, `clubs/${clubId}/escaloes`)); // ← NOVO
      const todosEscaloes = escaloesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const escaloesComStats = todosEscaloes.map(esc => {
        const atletasEscalao = todosAtletas.filter(a => a.equipa === esc.nome);
        const episodiosEscalao = todosEpisodios.filter(e => {
          const atleta = todosAtletas.find(a => a.id === e.atletaId);
          return atleta?.equipa === esc.nome;
        });
        return {
          ...esc,
          totalEpisodios: episodiosEscalao.length,
          episodiosAtivos: episodiosEscalao.filter(e => e.estado === 'ativo' || e.estado === 'em_tratamento').length,
          totalAtletas: atletasEscalao.length,
        };
      });

      setEscaloes(escaloesComStats);

      // 10. Alertas
      const alertasMock = ativos
        .filter(e => {
          if (e.gravidade === 'grave' || e.gravidade === 'alta') return true;
          if (!e.dataInicio) return false;
          return Math.round((hoje - new Date(e.dataInicio)) / (1000 * 60 * 60 * 24)) > 30;
        })
        .slice(0, 5)
        .map(e => {
          const atleta = todosAtletas.find(a => a.id === e.atletaId);
          return {
            tipo: (e.gravidade === 'grave' || e.gravidade === 'alta') ? 'grave' : 'prolongado',
            texto: `${atleta?.nome || 'Desconhecido'} - ${e.tipo || 'Episódio'} ${
              (e.gravidade === 'grave' || e.gravidade === 'alta') ? '(GRAVE)' : '(>30 dias)'
            }`,
            data: e.dataInicio,
          };
        });

      setAlertas(alertasMock);

      // 11. Stats finais
      setStats({
        totalLesoes: todosEpisodios.length,
        lesoesAtivas: ativos.length,
        lesoesRecuperadas: recuperados.length,
        atletasEmRecuperacao: new Set(ativos.map(e => e.atletaId)).size,
        sessoesSemana: sessoesSemana.length,
        tempoMedioRecuperacao: tempoMedio,
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard fisio:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    lesoesAtivas: episodiosAtivos,
    agendamentos,
    historicoLesoes: historicoEpisodios,
    escaloes,
    alertas,
    loading,
    recarregar: carregarDados,
  };
}
