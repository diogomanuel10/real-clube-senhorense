// src/hooks/useDashboardFisio.js
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';

export function useDashboardFisio() {
  const [stats, setStats] = useState({
    totalEpisodios: 0,
    episodiosAtivos: 0,
    episodiosRecuperados: 0,
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
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // 1. Carregar Episódios Clínicos
      const episodiosSnap = await getDocs(collection(db, 'episodiosClinicos'));
      const todosEpisodios = episodiosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const ativos = todosEpisodios.filter(e => e.estado === 'ativo' || e.estado === 'em_tratamento');
      const recuperados = todosEpisodios.filter(e => e.estado === 'alta' || e.estado === 'concluido');

      // 2. Carregar Todas as Sessões
      const sessoesSnap = await getDocs(collection(db, 'sessoes'));
      const todasSessoes = sessoesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 3. Carregar Atletas
      const atletasSnap = await getDocs(collection(db, 'atletas'));
      const todosAtletas = atletasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 4. Enriquecer episódios com dados do atleta e sessões relacionadas
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

      // 5. Calcular tempo médio de recuperação
      const recuperadosComDatas = recuperados.filter(e => e.dataInicio && e.dataFim);
      const tempoMedio = recuperadosComDatas.length > 0
        ? Math.round(
            recuperadosComDatas.reduce((acc, e) => {
              const inicio = new Date(e.dataInicio);
              const fim = new Date(e.dataFim);
              const dias = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
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

      const sessoesSemana = todasSessoes.filter(
        s => s.data >= inicioSemanaISO && s.data <= hojeISO
      );

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
        .sort((a, b) => {
          const dataA = a.dataInicio || '2000-01-01';
          const dataB = b.dataInicio || '2000-01-01';
          return dataB.localeCompare(dataA);
        })
        .slice(0, 10)
        .map(episodio => {
          const atleta = todosAtletas.find(a => a.id === episodio.atletaId);
          const sessoesDoEpisodio = todasSessoes.filter(s => s.episodioClinicoId === episodio.id);
          return {
            ...episodio,
            atletaNome: atleta?.nome || 'Desconhecido',
            atletaEquipa: atleta?.equipa || 'Sem equipa',
            totalSessoes: sessoesDoEpisodio.length,
          };
        });

      setHistoricoEpisodios(historicoOrdenado);

      // 9. Estatísticas por Escalão
      const escaloesSnap = await getDocs(collection(db, 'escaloes'));
      const todosEscaloes = escaloesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const escaloesComStats = todosEscaloes.map(esc => {
        const atletasEscalao = todosAtletas.filter(a => a.equipa === esc.nome);
        const episodiosEscalao = todosEpisodios.filter(e => {
          const atleta = todosAtletas.find(a => a.id === e.atletaId);
          return atleta?.equipa === esc.nome;
        });
        const episodiosAtivosEscalao = episodiosEscalao.filter(e => 
          e.estado === 'ativo' || e.estado === 'em_tratamento'
        );

        return {
          ...esc,
          totalEpisodios: episodiosEscalao.length,
          episodiosAtivos: episodiosAtivosEscalao.length,
          totalAtletas: atletasEscalao.length,
        };
      });

      setEscaloes(escaloesComStats);

      // 10. Alertas (episódios graves ou prolongados)
      const alertasMock = ativos
        .filter(e => {
          if (e.gravidade === 'grave' || e.gravidade === 'alta') return true;
          if (!e.dataInicio) return false;
          const inicio = new Date(e.dataInicio);
          const diasEpisodio = Math.round((hoje - inicio) / (1000 * 60 * 60 * 24));
          return diasEpisodio > 30;
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

      // 11. Definir Estatísticas
const atletasComEpisodioAtivo = new Set(ativos.map(e => e.atletaId)).size;

setStats({
  // nomes pensados para os cards
  totalLesoes: todosEpisodios.length,
  lesoesAtivas: ativos.length,
  lesoesRecuperadas: recuperados.length,
  atletasEmRecuperacao: atletasComEpisodioAtivo,
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
  lesoesAtivas: episodiosAtivos,  // Manter nome antigo para compatibilidade
  agendamentos,
  historicoLesoes: historicoEpisodios,  // Manter nome antigo para compatibilidade
  escaloes,
  alertas,
  loading,
  recarregar: carregarDados,
};
}
