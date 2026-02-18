import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';

export function useDashboardTreinador(equipas) {
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
    if (!equipas || equipas.length === 0) {
      setLoading(false);
      return;
    }
    
    carregarDados();
  }, [equipas]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // 1. Carregar atletas das minhas equipas
      const atletasSnap = await getDocs(collection(db, 'atletas'));
      const todosAtletas = atletasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const meusAtletas = todosAtletas.filter(a => equipas.includes(a.equipa));
      setAtletas(meusAtletas);

      const meusAtletasIds = meusAtletas.map(a => a.id);

      // 2. Carregar treinos
      const hoje = new Date().toISOString().slice(0, 10);
      const treinosSnap = await getDocs(collection(db, 'treinos'));
      const todosTreinos = treinosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const treinosHj = todosTreinos.filter(t => 
        t.data === hoje && equipas.includes(t.equipa)
      );
      setTreinosHoje(treinosHj);

      const treinosHjIds = treinosHj.map(t => t.id);

      // 3. Próximos treinos (7 dias)
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + 7);
      const dataFimISO = dataFim.toISOString().slice(0, 10);
      
      const proximos = todosTreinos
        .filter(t => 
          t.data > hoje && 
          t.data <= dataFimISO && 
          equipas.includes(t.equipa)
        )
        .sort((a, b) => a.data.localeCompare(b.data))
        .slice(0, 5);
      setProximosTreinos(proximos);

      // 4. CARREGAR PRESENÇAS DE HOJE
      const presencasSnap = await getDocs(collection(db, 'presencas'));
      const todasPresencas = presencasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Contar presenças de hoje dos meus atletas nos meus treinos
      const presencasHj = todasPresencas.filter(p => 
        treinosHjIds.includes(p.treinoId) &&
        meusAtletasIds.includes(p.atletaId) &&
        p.estado === 'presente'
      );
      
      const presencasHoje = presencasHj.length;
      const totalEsperado = treinosHj.length * meusAtletas.length;

      // 5. Calcular taxa de assiduidade (últimos 30 dias)
      const data30DiasAtras = new Date();
      data30DiasAtras.setDate(data30DiasAtras.getDate() - 30);
      const data30ISO = data30DiasAtras.toISOString().slice(0, 10);
      
      // Treinos dos últimos 30 dias
      const treinosRecentes = todosTreinos.filter(t =>
        t.data >= data30ISO && 
        t.data <= hoje && 
        equipas.includes(t.equipa)
      );
      
      const treinosRecentesIds = treinosRecentes.map(t => t.id);
      
      // Contar presenças dos últimos 30 dias
      const presencas30Dias = todasPresencas.filter(p =>
        treinosRecentesIds.includes(p.treinoId) &&
        meusAtletasIds.includes(p.atletaId) &&
        p.estado === 'presente'
      );
      
      const totalPresencas = presencas30Dias.length;
      const totalPossivel = treinosRecentes.length * meusAtletas.length;
      const taxaAssiduidade = totalPossivel > 0 
        ? Math.round((totalPresencas / totalPossivel) * 100) 
        : 0;

      // 6. Quotas em atraso
      let atletasQuotasAtrasadas = 0;
      try {
        const quotasSnap = await getDocs(collection(db, 'quotas'));
        const todasQuotas = quotasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const quotasAtrasadas = todasQuotas.filter(q => 
          !q.pago && 
          meusAtletasIds.includes(q.atletaId)
        );
        atletasQuotasAtrasadas = new Set(quotasAtrasadas.map(q => q.atletaId)).size;
      } catch {
        atletasQuotasAtrasadas = 0;
      }

      setStats({
        totalAtletas: meusAtletas.length,
        presencasHoje,
        totalEsperado,
        taxaAssiduidade,
        atletasQuotasAtrasadas,
      });

      // 7. Atletas em destaque
      const hojeDia = new Date().getDate();
      const hojeMes = new Date().getMonth();
      
      // Aniversariantes
      const aniversariantes = meusAtletas.filter(a => {
        if (!a.dataNascimento) return false;
        const dataNasc = new Date(a.dataNascimento);
        return dataNasc.getDate() === hojeDia && dataNasc.getMonth() === hojeMes;
      });

      // Lesionados
      const lesionados = meusAtletas.filter(a => 
        a.lesionado === true || a.estado === 'lesionado'
      );

      // Top 3 Assiduidade (calcular por atleta)
      const atletasComAssiduidade = meusAtletas.map((atleta) => {
        // Contar presenças deste atleta nos últimos 30 dias
        const presencasAtleta = presencas30Dias.filter(p => 
          p.atletaId === atleta.id
        ).length;
        
        const treinosAtleta = treinosRecentes.length;
        const assiduidade = treinosAtleta > 0
          ? Math.round((presencasAtleta / treinosAtleta) * 100)
          : 0;

        return { ...atleta, assiduidade };
      });

      const topAssiduidade = atletasComAssiduidade
        .sort((a, b) => b.assiduidade - a.assiduidade)
        .slice(0, 3);

      setAtletasDestaque({
        lesionados,
        aniversariantes,
        topAssiduidade,
      });

      // 8. Comunicados relevantes
      const comunicadosSnap = await getDocs(collection(db, 'comunicados'));
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
    stats,
    atletas,
    treinosHoje,
    proximosTreinos,
    atletasDestaque,
    comunicados,
    loading,
    recarregar: carregarDados,
  };
}
