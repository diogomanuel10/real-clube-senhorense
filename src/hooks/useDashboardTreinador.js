import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useClub } from '../contexts/ClubContext';

export function useDashboardTreinador(equipas) {
  const { clubId } = useClub();

  const [stats, setStats] = useState({
    totalAtletas: 0,
    presencasHoje: 0,
    totalEsperado: 0,
    taxaAssiduidade: 0,
    atletasQuotasAtrasadas: 0,
  });

  const [atletas, setAtletas] = useState([]);
  const [treinosHoje, setTreinosHoje] = useState([]);
  const [proximosTreinos, setProximosTreinos] = useState([]);
  const [atletasDestaque, setAtletasDestaque] = useState({
    lesionados: [],
    aniversariantes: [],
    topAssiduidade: [],
  });
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!equipas || equipas.length === 0 || !clubId) {
      setLoading(false);
      return;
    }
    carregarDados();
  }, [equipas, clubId]); // ← clubId no dependency array

  const carregarDados = async () => {
    try {
      setLoading(true);

      // 1. Atletas
      const atletasSnap = await getDocs(collection(db, `clubs/${clubId}/atletas`)); // ← NOVO
      const todosAtletas = atletasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const meusAtletas = todosAtletas.filter(a => equipas.includes(a.equipa));
      setAtletas(meusAtletas);
      const meusAtletasIds = meusAtletas.map(a => a.id);

      // 2. Treinos
      const hoje = new Date().toISOString().slice(0, 10);
      const treinosSnap = await getDocs(collection(db, `clubs/${clubId}/treinos`)); // ← NOVO
      const todosTreinos = treinosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const treinosHj = todosTreinos.filter(t => t.data === hoje && equipas.includes(t.equipa));
      setTreinosHoje(treinosHj);
      const treinosHjIds = treinosHj.map(t => t.id);

      // 3. Próximos treinos (7 dias)
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + 7);
      const dataFimISO = dataFim.toISOString().slice(0, 10);

      const proximos = todosTreinos
        .filter(t => t.data > hoje && t.data <= dataFimISO && equipas.includes(t.equipa))
        .sort((a, b) => a.data.localeCompare(b.data))
        .slice(0, 5);
      setProximosTreinos(proximos);

      // 4. Presenças de hoje
      const presencasSnap = await getDocs(collection(db, `clubs/${clubId}/presencas`)); // ← NOVO
      const todasPresencas = presencasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const presencasHj = todasPresencas.filter(p =>
        treinosHjIds.includes(p.treinoId) &&
        meusAtletasIds.includes(p.atletaId) &&
        p.estado === 'presente'
      );

      const presencasHoje = presencasHj.length;
      const totalEsperado = treinosHj.length * meusAtletas.length;

      // 5. Taxa assiduidade (30 dias)
      const data30DiasAtras = new Date();
      data30DiasAtras.setDate(data30DiasAtras.getDate() - 30);
      const data30ISO = data30DiasAtras.toISOString().slice(0, 10);

      const treinosRecentes = todosTreinos.filter(t =>
        t.data >= data30ISO && t.data <= hoje && equipas.includes(t.equipa)
      );
      const treinosRecentesIds = treinosRecentes.map(t => t.id);

      const presencas30Dias = todasPresencas.filter(p =>
        treinosRecentesIds.includes(p.treinoId) &&
        meusAtletasIds.includes(p.atletaId) &&
        p.estado === 'presente'
      );

      const totalPossivel = treinosRecentes.length * meusAtletas.length;
      const taxaAssiduidade = totalPossivel > 0
        ? Math.round((presencas30Dias.length / totalPossivel) * 100)
        : 0;

      // 6. Quotas em atraso
      let atletasQuotasAtrasadas = 0;
      try {
        const quotasSnap = await getDocs(collection(db, `clubs/${clubId}/quotas`)); // ← NOVO
        const todasQuotas = quotasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const quotasAtrasadas = todasQuotas.filter(q => !q.pago && meusAtletasIds.includes(q.atletaId));
        atletasQuotasAtrasadas = new Set(quotasAtrasadas.map(q => q.atletaId)).size;
      } catch {
        atletasQuotasAtrasadas = 0;
      }

      setStats({ totalAtletas: meusAtletas.length, presencasHoje, totalEsperado, taxaAssiduidade, atletasQuotasAtrasadas });

      // 7. Atletas em destaque
      const hojeDia = new Date().getDate();
      const hojeMes = new Date().getMonth();

      const aniversariantes = meusAtletas.filter(a => {
        if (!a.dataNascimento) return false;
        const dataNasc = new Date(a.dataNascimento);
        return dataNasc.getDate() === hojeDia && dataNasc.getMonth() === hojeMes;
      });

      const lesionados = meusAtletas.filter(a => a.lesionado === true || a.estado === 'lesionado');

      const atletasComAssiduidade = meusAtletas.map((atleta) => {
        const presencasAtleta = presencas30Dias.filter(p => p.atletaId === atleta.id).length;
        const assiduidade = treinosRecentes.length > 0
          ? Math.round((presencasAtleta / treinosRecentes.length) * 100)
          : 0;
        return { ...atleta, assiduidade };
      });

      const topAssiduidade = atletasComAssiduidade
        .sort((a, b) => b.assiduidade - a.assiduidade)
        .slice(0, 3);

      setAtletasDestaque({ lesionados, aniversariantes, topAssiduidade });

      // 8. Comunicados
      const comunicadosSnap = await getDocs(collection(db, `clubs/${clubId}/comunicados`)); // ← NOVO
      const todosComunicados = comunicadosSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));

      const comunicadosRelevantes = todosComunicados.filter(c => {
        if (!c.destinatarios || c.destinatarios.includes('todos')) return true;
        return c.destinatarios.some(dest => equipas.includes(dest));
      }).slice(0, 5);

      setComunicados(comunicadosRelevantes);

    } catch (error) {
      console.error('Erro ao carregar dashboard treinador:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats, atletas, treinosHoje, proximosTreinos,
    atletasDestaque, comunicados, loading,
    recarregar: carregarDados,
  };
}
