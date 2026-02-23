import { 
  TrendingUp, Zap, Shield, Target, AlertCircle, AlertTriangle, 
  CheckCircle, TrendingDown, Activity, Award, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie 
} from 'recharts';

export default function Analytics({ stats, historico, setAtual, jogo, resultado }) {
  // ========== CALCULAR TOTAIS ==========
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

  // ========== ANÁLISES POR TIPO ==========
  const analisePorTipo = {
    ataque: {
      pontos: historico.filter(a => a.tipo === 'ataque_ponto').length,
      continuidade: historico.filter(a => a.tipo === 'ataque_continuidade').length,
      erros: historico.filter(a => a.tipo === 'ataque_erro').length,
    },
    servico: {
      aces: historico.filter(a => a.tipo === 'servico_ace').length,
      dificil: historico.filter(a => a.tipo === 'servico_dificil').length,
      facil: historico.filter(a => a.tipo === 'servico_facil').length,
      erros: historico.filter(a => a.tipo === 'servico_erro').length,
    },
    recepcao: {
      perfeita: historico.filter(a => a.tipo === 'recepcao_perfeita').length,
      muitoBoa: historico.filter(a => a.tipo === 'recepcao_muito_boa').length,
      boa: historico.filter(a => a.tipo === 'recepcao_boa').length,
      ma: historico.filter(a => a.tipo === 'recepcao_ma').length,
      erros: historico.filter(a => a.tipo === 'recepcao_erro').length,
    },
    bloco: {
      pontos: historico.filter(a => a.tipo === 'bloco_ponto').length,
      erros: historico.filter(a => a.tipo === 'bloco_erro').length,
    },
    defesa: {
      boas: historico.filter(a => a.tipo === 'defesa_boa').length,
      tocou: historico.filter(a => a.tipo === 'defesa_tocou').length,
      erros: historico.filter(a => a.tipo === 'defesa_erro').length,
    },
  };

  // ========== EFICIÊNCIAS ==========
  const eficienciaAtaque = totais.ataques > 0 
    ? ((totais.ataquesEficazes / totais.ataques) * 100).toFixed(0)
    : 0;

  const totalServicos = analisePorTipo.servico.aces + analisePorTipo.servico.dificil + 
                        analisePorTipo.servico.facil + analisePorTipo.servico.erros;
  const eficienciaServico = totalServicos > 0
    ? (((analisePorTipo.servico.aces + analisePorTipo.servico.dificil) / totalServicos) * 100).toFixed(0)
    : 0;

  const totalRecepcoes = analisePorTipo.recepcao.perfeita + analisePorTipo.recepcao.muitoBoa +
                         analisePorTipo.recepcao.boa + analisePorTipo.recepcao.ma + analisePorTipo.recepcao.erros;
  const eficienciaRecepcao = totalRecepcoes > 0
    ? (((analisePorTipo.recepcao.perfeita + analisePorTipo.recepcao.muitoBoa) / totalRecepcoes) * 100).toFixed(0)
    : 0;

  const totalBlocos = analisePorTipo.bloco.pontos + analisePorTipo.bloco.erros;
  const eficienciaBloco = totalBlocos > 0
    ? ((analisePorTipo.bloco.pontos / totalBlocos) * 100).toFixed(0)
    : 0;

  // ========== DIFERENÇA DE PONTOS ==========
  const diferencaPontos = resultado.nos - resultado.adversario;

  // ========== EVOLUÇÃO DE PONTOS ==========
  const evolucaoPontos = [];
  let pontosNos = 0;
  let pontosAdv = 0;
  
  [...historico].reverse().slice(0, 30).forEach((acao, idx) => {
    if (['ataque_ponto', 'servico_ace', 'bloco_ponto', 'erro_adversario'].includes(acao.tipo)) {
      pontosNos++;
    } else if (['erro_equipa', 'ponto_adversario', 'ataque_erro', 'servico_erro'].includes(acao.tipo)) {
      pontosAdv++;
    }
    
    if (idx % 3 === 0) {
      evolucaoPontos.push({
        momento: Math.floor(idx / 3) + 1,
        nos: pontosNos,
        adversario: pontosAdv,
      });
    }
  });

  // ========== DADOS PARA GRÁFICOS ==========
  
  // Gráfico de Ataque
  const dadosAtaque = [
    { name: 'Pontos', value: analisePorTipo.ataque.pontos, cor: '#10B981' },
    { name: 'Continuidade', value: analisePorTipo.ataque.continuidade, cor: '#3B82F6' },
    { name: 'Erros', value: analisePorTipo.ataque.erros, cor: '#EF4444' },
  ];

  // Gráfico de Serviço
  const dadosServico = [
    { name: 'Aces', value: analisePorTipo.servico.aces, cor: '#FBBF24' },
    { name: 'Difícil', value: analisePorTipo.servico.dificil, cor: '#3B82F6' },
    { name: 'Fácil', value: analisePorTipo.servico.facil, cor: '#6B7280' },
    { name: 'Erros', value: analisePorTipo.servico.erros, cor: '#EF4444' },
  ];

  // Gráfico de Receção
  const dadosRecepcao = [
    { name: 'Perfeita', value: analisePorTipo.recepcao.perfeita, cor: '#10B981' },
    { name: 'Muito Boa', value: analisePorTipo.recepcao.muitoBoa, cor: '#3B82F6' },
    { name: 'Boa', value: analisePorTipo.recepcao.boa, cor: '#60A5FA' },
    { name: 'Má', value: analisePorTipo.recepcao.ma, cor: '#F97316' },
    { name: 'Erros', value: analisePorTipo.recepcao.erros, cor: '#EF4444' },
  ];

  // Radar de Performance Geral
  const dadosRadar = [
    { categoria: 'Ataque', valor: parseInt(eficienciaAtaque) },
    { categoria: 'Serviço', valor: parseInt(eficienciaServico) },
    { categoria: 'Receção', valor: parseInt(eficienciaRecepcao) },
    { categoria: 'Bloco', valor: parseInt(eficienciaBloco) },
    { categoria: 'Defesa', valor: analisePorTipo.defesa.boas > 0 ? 75 : 50 },
  ];

  // Top 5 Atletas (pontos)
  // Top 5 Atletas (pontos) - com nomes dos atletas
const top5Atletas = Object.entries(stats)
  .map(([atletaId, stat]) => {
    // Buscar nome do atleta no histórico
    const acaoDoAtleta = historico.find(h => h.atletaId === atletaId);
    return {
      id: atletaId,
      nome: acaoDoAtleta?.atletaNome || 'Atleta',
      ...stat
    };
  })
  .sort((a, b) => b.pontos - a.pontos)
  .slice(0, 5)
  .filter(a => a.pontos > 0); // Só mostrar quem tem pontos


  // ========== INDICADORES INTELIGENTES ==========
  const indicadores = [];

  // Análise de Erros
  if (totais.erros > 15) {
    indicadores.push({
      tipo: 'perigo',
      titulo: 'Muitos Erros!',
      descricao: `${totais.erros} erros - REDUZIR RISCO`,
      icon: AlertTriangle,
    });
  } else if (totais.erros > 8) {
    indicadores.push({
      tipo: 'atencao',
      titulo: 'Atenção aos Erros',
      descricao: `${totais.erros} erros - manter controlo`,
      icon: AlertCircle,
    });
  } else {
    indicadores.push({
      tipo: 'sucesso',
      titulo: 'Poucos Erros ✓',
      descricao: `${totais.erros} erros - continuar assim!`,
      icon: CheckCircle,
    });
  }

  // Diferença de Pontos
  if (diferencaPontos >= 5) {
    indicadores.push({
      tipo: 'sucesso',
      titulo: 'A Ganhar! 🔥',
      descricao: `+${diferencaPontos} pontos de vantagem`,
      icon: TrendingUp,
    });
  } else if (diferencaPontos <= -5) {
    indicadores.push({
      tipo: 'perigo',
      titulo: 'A Perder 😰',
      descricao: `${diferencaPontos} pontos - REAGIR!`,
      icon: TrendingDown,
    });
  } else if (diferencaPontos > 0) {
    indicadores.push({
      tipo: 'atencao',
      titulo: 'Vantagem Curta',
      descricao: `+${diferencaPontos} - não relaxar`,
      icon: Activity,
    });
  } else if (diferencaPontos < 0) {
    indicadores.push({
      tipo: 'atencao',
      titulo: 'Precisa Reagir',
      descricao: `${diferencaPontos} - focar no básico`,
      icon: Activity,
    });
  }

  // Eficiência de Ataque
  if (eficienciaAtaque >= 50) {
    indicadores.push({
      tipo: 'sucesso',
      titulo: 'Ataque Eficaz ⚡',
      descricao: `${eficienciaAtaque}% - continuar a atacar!`,
      icon: Zap,
    });
  } else if (eficienciaAtaque >= 35) {
    indicadores.push({
      tipo: 'atencao',
      titulo: 'Ataque Regular',
      descricao: `${eficienciaAtaque}% - variar jogadas`,
      icon: Target,
    });
  } else if (totais.ataques > 5) {
    indicadores.push({
      tipo: 'perigo',
      titulo: 'Ataque Fraco',
      descricao: `${eficienciaAtaque}% - melhorar colocação`,
      icon: AlertTriangle,
    });
  }

  // Eficiência de Serviço
  if (analisePorTipo.servico.aces >= 5) {
    indicadores.push({
      tipo: 'sucesso',
      titulo: 'Serviço Forte 🔥',
      descricao: `${analisePorTipo.servico.aces} aces - pressionar!`,
      icon: Award,
    });
  } else if (analisePorTipo.servico.erros >= 5) {
    indicadores.push({
      tipo: 'perigo',
      titulo: 'Erros de Serviço',
      descricao: `${analisePorTipo.servico.erros} erros - REDUZIR RISCO`,
      icon: AlertTriangle,
    });
  }

  // Receção
  const bonsRecepcoes = analisePorTipo.recepcao.perfeita + analisePorTipo.recepcao.muitoBoa;
  if (eficienciaRecepcao >= 60) {
    indicadores.push({
      tipo: 'sucesso',
      titulo: 'Boa Receção ✓',
      descricao: `${eficienciaRecepcao}% positiva`,
      icon: ThumbsUp,
    });
  } else if (totalRecepcoes > 5 && eficienciaRecepcao < 40) {
    indicadores.push({
      tipo: 'perigo',
      titulo: 'Receção Fraca',
      descricao: `Apenas ${eficienciaRecepcao}% positiva`,
      icon: ThumbsDown,
    });
  }

  const ultimasAcoes = historico.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ========== INDICADORES DE PERFORMANCE ========== */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-xl mb-4 text-purple-400">🎯 Análise em Tempo Real</h3>
        
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

      {/* ========== RADAR DE PERFORMANCE ========== */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="font-bold text-xl mb-4 text-blue-400">📊 Performance Global</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={dadosRadar}>
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
            <div className="font-bold text-2xl text-green-400">{eficienciaAtaque}%</div>
            <div className="text-gray-400 text-xs">Ataque</div>
          </div>
          <div>
            <div className="font-bold text-2xl text-yellow-400">{eficienciaServico}%</div>
            <div className="text-gray-400 text-xs">Serviço</div>
          </div>
          <div>
            <div className="font-bold text-2xl text-blue-400">{eficienciaRecepcao}%</div>
            <div className="text-gray-400 text-xs">Receção</div>
          </div>
          <div>
            <div className="font-bold text-2xl text-red-400">{eficienciaBloco}%</div>
            <div className="text-gray-400 text-xs">Bloco</div>
          </div>
          <div>
            <div className="font-bold text-2xl text-purple-400">{totais.defesas}</div>
            <div className="text-gray-400 text-xs">Defesas</div>
          </div>
        </div>
      </div>

      {/* ========== GRÁFICOS DETALHADOS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATAQUE */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-green-400">🔥 Análise de Ataque</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosAtaque}>
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
                {dadosAtaque.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-center mt-3">
            <span className="text-3xl font-bold text-green-400">{eficienciaAtaque}%</span>
            <span className="text-sm text-gray-400 ml-2">eficácia</span>
          </div>
        </div>

        {/* SERVIÇO */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-yellow-400">⚡ Análise de Serviço</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dadosServico.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosServico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-3">
            <span className="text-3xl font-bold text-yellow-400">{analisePorTipo.servico.aces}</span>
            <span className="text-sm text-gray-400 ml-2">aces</span>
          </div>
        </div>

        {/* RECEÇÃO */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-blue-400">🎯 Qualidade de Receção</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosRecepcao} layout="vertical">
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
                {dadosRecepcao.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-center mt-3">
            <span className="text-3xl font-bold text-blue-400">{eficienciaRecepcao}%</span>
            <span className="text-sm text-gray-400 ml-2">positiva</span>
          </div>
        </div>

        {/* TOP 5 ATLETAS */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-purple-400">🏆 Top 5 Pontuadores</h3>
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
        </div>
      </div>

      {/* ========== EVOLUÇÃO DE PONTOS ========== */}
      {evolucaoPontos.length > 2 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-xl mb-4 text-blue-400">📈 Evolução de Pontos</h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolucaoPontos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="momento" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
                label={{ value: 'Sequência de jogadas', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="nos" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name={jogo.equipa}
                dot={{ fill: '#3B82F6', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="adversario" 
                stroke="#EF4444" 
                strokeWidth={3}
                name={jogo.adversario}
                dot={{ fill: '#EF4444', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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
