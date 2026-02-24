import { 
  TrendingUp, Zap, Shield, Target, AlertCircle, AlertTriangle, 
  CheckCircle, TrendingDown, Activity, Award, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie 
} from 'recharts';

export default function Analytics({ stats, historico, setAtual, jogo, resultadosPorSet }) {
  // ========== CALCULAR TOTAIS GLOBAIS ==========
  const totais = Object.values(stats).reduce(
    (acc, stat) => ({
      pontos: acc.pontos + (stat.pontos || 0),
      aces: acc.aces + (stat.aces || 0),
      bloqueios: acc.bloqueios + (stat.bloqueios || 0),
      defesas: acc.defesas + (stat.defesas || 0),
      erros: acc.erros + (stat.erros || 0),
      ataquesEficazes: acc.ataquesEficazes + (stat.ataquesEficazes || 0),
      ataques: acc.ataques + (stat.ataques || 0),
    }),
    { pontos: 0, aces: 0, bloqueios: 0, defesas: 0, erros: 0, ataquesEficazes: 0, ataques: 0 }
  );

  // ========== FILTRAR HISTÓRICO POR SET ==========
  const historicoSetAtual = historico.filter(a => a.set === setAtual);
  const historicoGlobal = historico;

  // ========== ANÁLISES POR TIPO (SET ATUAL) ==========
  const analisePorTipoSet = {
    ataque: {
      pontos: historicoSetAtual.filter(a => a.tipo === 'ataque_ponto').length,
      continuidade: historicoSetAtual.filter(a => a.tipo === 'ataque_continuidade').length,
      erros: historicoSetAtual.filter(a => a.tipo === 'ataque_erro').length,
    },
    servico: {
      aces: historicoSetAtual.filter(a => a.tipo === 'servico_ace').length,
      dificil: historicoSetAtual.filter(a => a.tipo === 'servico_dificil').length,
      facil: historicoSetAtual.filter(a => a.tipo === 'servico_facil').length,
      erros: historicoSetAtual.filter(a => a.tipo === 'servico_erro').length,
    },
    recepcao: {
      perfeita: historicoSetAtual.filter(a => a.tipo === 'recepcao_perfeita').length,
      muitoBoa: historicoSetAtual.filter(a => a.tipo === 'recepcao_muito_boa').length,
      boa: historicoSetAtual.filter(a => a.tipo === 'recepcao_boa').length,
      ma: historicoSetAtual.filter(a => a.tipo === 'recepcao_ma').length,
      erros: historicoSetAtual.filter(a => a.tipo === 'recepcao_erro').length,
    },
    bloco: {
      pontos: historicoSetAtual.filter(a => a.tipo === 'bloco_ponto').length,
      erros: historicoSetAtual.filter(a => a.tipo === 'bloco_erro').length,
    },
    defesa: {
      boas: historicoSetAtual.filter(a => a.tipo === 'defesa_boa').length,
      tocou: historicoSetAtual.filter(a => a.tipo === 'defesa_tocou').length,
      erros: historicoSetAtual.filter(a => a.tipo === 'defesa_erro').length,
    },
  };

  // ========== ANÁLISES GLOBAIS (TODOS OS SETS) ==========
  const analisePorTipoGlobal = {
    ataque: {
      pontos: historicoGlobal.filter(a => a.tipo === 'ataque_ponto').length,
      continuidade: historicoGlobal.filter(a => a.tipo === 'ataque_continuidade').length,
      erros: historicoGlobal.filter(a => a.tipo === 'ataque_erro').length,
    },
    servico: {
      aces: historicoGlobal.filter(a => a.tipo === 'servico_ace').length,
      dificil: historicoGlobal.filter(a => a.tipo === 'servico_dificil').length,
      facil: historicoGlobal.filter(a => a.tipo === 'servico_facil').length,
      erros: historicoGlobal.filter(a => a.tipo === 'servico_erro').length,
    },
    recepcao: {
      perfeita: historicoGlobal.filter(a => a.tipo === 'recepcao_perfeita').length,
      muitoBoa: historicoGlobal.filter(a => a.tipo === 'recepcao_muito_boa').length,
      boa: historicoGlobal.filter(a => a.tipo === 'recepcao_boa').length,
      ma: historicoGlobal.filter(a => a.tipo === 'recepcao_ma').length,
      erros: historicoGlobal.filter(a => a.tipo === 'recepcao_erro').length,
    },
    bloco: {
      pontos: historicoGlobal.filter(a => a.tipo === 'bloco_ponto').length,
      erros: historicoGlobal.filter(a => a.tipo === 'bloco_erro').length,
    },
    defesa: {
      boas: historicoGlobal.filter(a => a.tipo === 'defesa_boa').length,
      tocou: historicoGlobal.filter(a => a.tipo === 'defesa_tocou').length,
      erros: historicoGlobal.filter(a => a.tipo === 'defesa_erro').length,
    },
  };

  // ========== COMPARAÇÃO ENTRE SETS ==========
  const dadosComparacaoSets = Object.keys(resultadosPorSet)
    .filter(set => resultadosPorSet[set].nos > 0 || resultadosPorSet[set].adversario > 0)
    .map(set => {
      const historicoDoSet = historico.filter(a => a.set === parseInt(set));
      
      return {
        set: `Set ${set}`,
        nos: resultadosPorSet[set].nos,
        adversario: resultadosPorSet[set].adversario,
        aces: historicoDoSet.filter(a => a.tipo === 'servico_ace').length,
        erros: historicoDoSet.filter(a => 
          a.tipo === 'ataque_erro' || 
          a.tipo === 'servico_erro' || 
          a.tipo === 'erro_equipa'
        ).length,
        ataquesPonto: historicoDoSet.filter(a => a.tipo === 'ataque_ponto').length,
      };
    });

  // ========== EFICIÊNCIAS (SET ATUAL) ==========
  const totalAtaquesSet = analisePorTipoSet.ataque.pontos + analisePorTipoSet.ataque.continuidade + analisePorTipoSet.ataque.erros;
  const eficienciaAtaqueSet = totalAtaquesSet > 0 
    ? ((analisePorTipoSet.ataque.pontos / totalAtaquesSet) * 100).toFixed(0)
    : 0;

  const totalServicosSet = analisePorTipoSet.servico.aces + analisePorTipoSet.servico.dificil + 
                        analisePorTipoSet.servico.facil + analisePorTipoSet.servico.erros;
  const eficienciaServicoSet = totalServicosSet > 0
    ? (((analisePorTipoSet.servico.aces + analisePorTipoSet.servico.dificil) / totalServicosSet) * 100).toFixed(0)
    : 0;

  const totalRecepcoesSet = analisePorTipoSet.recepcao.perfeita + analisePorTipoSet.recepcao.muitoBoa +
                         analisePorTipoSet.recepcao.boa + analisePorTipoSet.recepcao.ma + analisePorTipoSet.recepcao.erros;
  const eficienciaRecepcaoSet = totalRecepcoesSet > 0
    ? (((analisePorTipoSet.recepcao.perfeita + analisePorTipoSet.recepcao.muitoBoa) / totalRecepcoesSet) * 100).toFixed(0)
    : 0;

  const totalBlocosSet = analisePorTipoSet.bloco.pontos + analisePorTipoSet.bloco.erros;
  const eficienciaBlocoSet = totalBlocosSet > 0
    ? ((analisePorTipoSet.bloco.pontos / totalBlocosSet) * 100).toFixed(0)
    : 0;

  // ========== EFICIÊNCIAS GLOBAIS ==========
  const totalAtaquesGlobal = totais.ataques;
  const eficienciaAtaqueGlobal = totalAtaquesGlobal > 0 
    ? ((totais.ataquesEficazes / totalAtaquesGlobal) * 100).toFixed(0)
    : 0;

  const totalServicosGlobal = analisePorTipoGlobal.servico.aces + analisePorTipoGlobal.servico.dificil + 
                        analisePorTipoGlobal.servico.facil + analisePorTipoGlobal.servico.erros;
  const eficienciaServicoGlobal = totalServicosGlobal > 0
    ? (((analisePorTipoGlobal.servico.aces + analisePorTipoGlobal.servico.dificil) / totalServicosGlobal) * 100).toFixed(0)
    : 0;

  // ========== DIFERENÇA DE PONTOS (SET ATUAL) ==========
  const resultadoSet = resultadosPorSet[setAtual] || { nos: 0, adversario: 0 };
  const diferencaPontosSet = resultadoSet.nos - resultadoSet.adversario;

  // ========== DADOS PARA GRÁFICOS ==========
  
  // Gráfico de Ataque (Set Atual)
  const dadosAtaqueSet = [
    { name: 'Pontos', value: analisePorTipoSet.ataque.pontos, cor: '#10B981' },
    { name: 'Continuidade', value: analisePorTipoSet.ataque.continuidade, cor: '#3B82F6' },
    { name: 'Erros', value: analisePorTipoSet.ataque.erros, cor: '#EF4444' },
  ];

  // Gráfico de Serviço (Set Atual)
  const dadosServicoSet = [
    { name: 'Aces', value: analisePorTipoSet.servico.aces, cor: '#FBBF24' },
    { name: 'Difícil', value: analisePorTipoSet.servico.dificil, cor: '#3B82F6' },
    { name: 'Fácil', value: analisePorTipoSet.servico.facil, cor: '#6B7280' },
    { name: 'Erros', value: analisePorTipoSet.servico.erros, cor: '#EF4444' },
  ];

  // Gráfico de Receção (Set Atual)
  const dadosRecepcaoSet = [
    { name: 'Perfeita', value: analisePorTipoSet.recepcao.perfeita, cor: '#10B981' },
    { name: 'Muito Boa', value: analisePorTipoSet.recepcao.muitoBoa, cor: '#3B82F6' },
    { name: 'Boa', value: analisePorTipoSet.recepcao.boa, cor: '#60A5FA' },
    { name: 'Má', value: analisePorTipoSet.recepcao.ma, cor: '#F97316' },
    { name: 'Erros', value: analisePorTipoSet.recepcao.erros, cor: '#EF4444' },
  ];

  // Radar de Performance (Set Atual)
  const dadosRadarSet = [
    { categoria: 'Ataque', valor: parseInt(eficienciaAtaqueSet) },
    { categoria: 'Serviço', valor: parseInt(eficienciaServicoSet) },
    { categoria: 'Receção', valor: parseInt(eficienciaRecepcaoSet) },
    { categoria: 'Bloco', valor: parseInt(eficienciaBlocoSet) },
    { categoria: 'Defesa', valor: analisePorTipoSet.defesa.boas > 0 ? 75 : 50 },
  ];

  // Top 5 Atletas (Global)
  const top5Atletas = Object.entries(stats)
    .map(([atletaId, stat]) => {
      const acaoDoAtleta = historico.find(h => h.atletaId === atletaId);
      return {
        id: atletaId,
        nome: acaoDoAtleta?.atletaNome || 'Atleta',
        ...stat
      };
    })
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 5)
    .filter(a => a.pontos > 0);

  // ========== INDICADORES INTELIGENTES (SET ATUAL) ==========
  const errosSet = historicoSetAtual.filter(a => 
    a.tipo.includes('erro') || a.tipo === 'erro_equipa'
  ).length;

  const indicadores = [];

  // Análise de Erros
  if (errosSet > 8) {
    indicadores.push({
      tipo: 'perigo',
      titulo: 'Muitos Erros neste Set!',
      descricao: `${errosSet} erros - REDUZIR RISCO`,
      icon: AlertTriangle,
    });
  } else if (errosSet > 4) {
    indicadores.push({
      tipo: 'atencao',
      titulo: 'Atenção aos Erros',
      descricao: `${errosSet} erros - manter controlo`,
      icon: AlertCircle,
    });
  } else {
    indicadores.push({
      tipo: 'sucesso',
      titulo: 'Poucos Erros ✓',
      descricao: `${errosSet} erros - continuar assim!`,
      icon: CheckCircle,
    });
  }

  // Diferença de Pontos
  if (diferencaPontosSet >= 5) {
    indicadores.push({
      tipo: 'sucesso',
      titulo: 'A Ganhar o Set! 🔥',
      descricao: `+${diferencaPontosSet} pontos de vantagem`,
      icon: TrendingUp,
    });
  } else if (diferencaPontosSet <= -5) {
    indicadores.push({
      tipo: 'perigo',
      titulo: 'A Perder o Set 😰',
      descricao: `${diferencaPontosSet} pontos - REAGIR!`,
      icon: TrendingDown,
    });
  } else if (diferencaPontosSet > 0) {
    indicadores.push({
      tipo: 'atencao',
      titulo: 'Vantagem Curta',
      descricao: `+${diferencaPontosSet} - não relaxar`,
      icon: Activity,
    });
  } else if (diferencaPontosSet < 0) {
    indicadores.push({
      tipo: 'atencao',
      titulo: 'Precisa Reagir',
      descricao: `${diferencaPontosSet} - focar no básico`,
      icon: Activity,
    });
  }

  // Eficiência de Ataque
  if (eficienciaAtaqueSet >= 50) {
    indicadores.push({
      tipo: 'sucesso',
      titulo: 'Ataque Eficaz ⚡',
      descricao: `${eficienciaAtaqueSet}% neste set`,
      icon: Zap,
    });
  } else if (eficienciaAtaqueSet >= 35) {
    indicadores.push({
      tipo: 'atencao',
      titulo: 'Ataque Regular',
      descricao: `${eficienciaAtaqueSet}% - variar jogadas`,
      icon: Target,
    });
  } else if (totalAtaquesSet > 5) {
    indicadores.push({
      tipo: 'perigo',
      titulo: 'Ataque Fraco',
      descricao: `${eficienciaAtaqueSet}% - melhorar colocação`,
      icon: AlertTriangle,
    });
  }

  // Eficiência de Serviço
  if (analisePorTipoSet.servico.aces >= 3) {
    indicadores.push({
      tipo: 'sucesso',
      titulo: 'Serviço Forte 🔥',
      descricao: `${analisePorTipoSet.servico.aces} aces neste set`,
      icon: Award,
    });
  } else if (analisePorTipoSet.servico.erros >= 3) {
    indicadores.push({
      tipo: 'perigo',
      titulo: 'Erros de Serviço',
      descricao: `${analisePorTipoSet.servico.erros} erros - REDUZIR RISCO`,
      icon: AlertTriangle,
    });
  }

  const ultimasAcoes = historico.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ========== TABS: SET ATUAL vs JOGO COMPLETO ========== */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-purple-400">📊 Análise</h3>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-600 rounded-lg font-bold">
              Set {setAtual}
            </span>
            <span className="px-3 py-1 bg-gray-700 rounded-lg">
              {resultadoSet.nos} - {resultadoSet.adversario}
            </span>
          </div>
        </div>

        {/* Resumo de Todos os Sets */}
        <div className="grid grid-cols-5 gap-2">
          {Object.keys(resultadosPorSet).map(set => {
            const res = resultadosPorSet[set];
            const temDados = res.nos > 0 || res.adversario > 0;
            
            return (
              <div
                key={set}
                className={`text-center p-3 rounded-lg transition ${
                  parseInt(set) === setAtual
                    ? 'bg-blue-600 text-white'
                    : temDados
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-800 text-gray-600'
                }`}
              >
                <div className="text-xs mb-1">Set {set}</div>
                <div className="font-bold">
                  {temDados ? `${res.nos}-${res.adversario}` : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== INDICADORES DE PERFORMANCE (SET ATUAL) ========== */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-xl mb-4 text-purple-400">🎯 Análise do Set {setAtual}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {indicadores.map((indicador, idx) => {
            const Icon = indicador.icon;
            const cores = {
              perigo: 'bg-red-900/30 border-red-700 text-red-400',
              atencao: 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
              sucesso: 'bg-green-900/30 border-green-700 text-green-400',
            };

            return (
              <div
                key={idx}
                className={`border-2 rounded-lg p-4 ${cores[indicador.tipo]}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-sm mb-1">{indicador.titulo}</h4>
                    <p className="text-xs opacity-90">{indicador.descricao}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== COMPARAÇÃO ENTRE SETS ========== */}
      {dadosComparacaoSets.length > 1 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-xl mb-4 text-green-400">📈 Evolução por Set</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosComparacaoSets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="set" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="nos" fill="#3B82F6" name={jogo.equipa} radius={[8, 8, 0, 0]} />
              <Bar dataKey="adversario" fill="#EF4444" name={jogo.adversario} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Mini stats por set */}
          <div className="grid grid-cols-5 gap-3 mt-4">
            {dadosComparacaoSets.map((setData, idx) => (
              <div key={idx} className="bg-gray-700 rounded-lg p-3 text-center text-xs">
                <div className="font-bold mb-2">{setData.set}</div>
                <div className="space-y-1 text-gray-400">
                  <div>⚡ {setData.aces} aces</div>
                  <div>❌ {setData.erros} erros</div>
                  <div>🔥 {setData.ataquesPonto} ataques</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== RADAR DE PERFORMANCE (SET ATUAL) ========== */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-xl mb-4 text-blue-400">📊 Performance do Set {setAtual}</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={dadosRadarSet}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="categoria" tick={{ fill: '#9CA3AF' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
            <Radar 
              name="Eficiência %" 
              dataKey="valor" 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.6} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-5 gap-2 mt-4 text-center text-sm">
          <div>
            <div className="font-bold text-2xl text-green-400">{eficienciaAtaqueSet}%</div>
            <div className="text-gray-400 text-xs">Ataque</div>
          </div>
          <div>
            <div className="font-bold text-2xl text-yellow-400">{eficienciaServicoSet}%</div>
            <div className="text-gray-400 text-xs">Serviço</div>
          </div>
          <div>
            <div className="font-bold text-2xl text-blue-400">{eficienciaRecepcaoSet}%</div>
            <div className="text-gray-400 text-xs">Receção</div>
          </div>
          <div>
            <div className="font-bold text-2xl text-red-400">{eficienciaBlocoSet}%</div>
            <div className="text-gray-400 text-xs">Bloco</div>
          </div>
          <div>
            <div className="font-bold text-2xl text-purple-400">{analisePorTipoSet.defesa.boas + analisePorTipoSet.defesa.tocou}</div>
            <div className="text-gray-400 text-xs">Defesas</div>
          </div>
        </div>
      </div>

      {/* ========== GRÁFICOS DETALHADOS (SET ATUAL) ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATAQUE */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-green-400">🔥 Análise de Ataque (Set {setAtual})</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosAtaqueSet}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {dadosAtaqueSet.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-center mt-3">
            <span className="text-3xl font-bold text-green-400">{eficienciaAtaqueSet}%</span>
            <span className="text-sm text-gray-400 ml-2">eficácia</span>
          </div>
        </div>

        {/* SERVIÇO */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-yellow-400">⚡ Análise de Serviço (Set {setAtual})</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dadosServicoSet.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosServicoSet.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-3">
            <span className="text-3xl font-bold text-yellow-400">{analisePorTipoSet.servico.aces}</span>
            <span className="text-sm text-gray-400 ml-2">aces</span>
          </div>
        </div>

        {/* RECEÇÃO */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-blue-400">🎯 Qualidade de Receção (Set {setAtual})</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosRecepcaoSet} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {dadosRecepcaoSet.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-center mt-3">
            <span className="text-3xl font-bold text-blue-400">{eficienciaRecepcaoSet}%</span>
            <span className="text-sm text-gray-400 ml-2">positiva</span>
          </div>
        </div>

        {/* TOP 5 ATLETAS (GLOBAL) */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-purple-400">🏆 Top 5 Pontuadores (Jogo)</h3>
          
          {top5Atletas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Ainda sem pontos registados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {top5Atletas.map((atleta, idx) => (
                <div key={atleta.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? 'bg-yellow-500 text-black' :
                      idx === 1 ? 'bg-gray-400 text-black' :
                      idx === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="font-medium text-sm">{atleta.nome}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">{atleta.pontos}</div>
                    <div className="text-xs text-gray-400">pontos</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== ÚLTIMAS AÇÕES ========== */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-xl mb-4 text-green-400">⚡ Últimas 5 Ações</h3>
        
        {ultimasAcoes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhuma ação registada ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ultimasAcoes.map((acao, idx) => (
              <div
                key={acao.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  idx === 0 ? 'bg-blue-900/40 border-2 border-blue-700' : 'bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {idx === 0 && (
                    <span className="text-xs bg-green-600 px-2 py-1 rounded-full font-bold">
                      ÚLTIMA
                    </span>
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {acao.atletaNome || 'Ação Geral'}
                    </p>
                    <p className="text-xs text-gray-400">Set {acao.set}</p>
                  </div>
                </div>
                
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                    acao.tipo.includes('ponto') || acao.tipo.includes('ace') || acao.tipo === 'erro_adversario'
                      ? 'bg-green-600'
                      : acao.tipo.includes('erro')
                      ? 'bg-red-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {acao.tipo.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
