import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from "../../utils/firebase";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';

const MonitorizacaoCarga = ({ atletaId }) => {
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(30); // dias

  useEffect(() => {
    carregarSessoes();
  }, [atletaId, periodo]);

  const carregarSessoes = async () => {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - periodo);

      const q = query(
        collection(db, 'sessoes_treino_fisico'),
        where('atletaId', '==', atletaId),
        where('data', '>=', dataLimite),
        orderBy('data', 'desc')
      );

      const snapshot = await getDocs(q);
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate()
      }));

      setSessoes(dados);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularCargaAguda = () => {
    // Carga aguda = média dos últimos 7 dias
    const ultimos7Dias = sessoes.filter(s => {
      const diff = (new Date() - s.data) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });

    if (ultimos7Dias.length === 0) return 0;
    const soma = ultimos7Dias.reduce((acc, s) => acc + (s.cargaTotal || 0), 0);
    return Math.round(soma / 7);
  };

  const calcularCargaCronica = () => {
    // Carga crónica = média dos últimos 28 dias
    const ultimos28Dias = sessoes.filter(s => {
      const diff = (new Date() - s.data) / (1000 * 60 * 60 * 24);
      return diff <= 28;
    });

    if (ultimos28Dias.length === 0) return 0;
    const soma = ultimos28Dias.reduce((acc, s) => acc + (s.cargaTotal || 0), 0);
    return Math.round(soma / 28);
  };

  const calcularRatioACWR = () => {
    // Acute:Chronic Workload Ratio
    const aguda = calcularCargaAguda();
    const cronica = calcularCargaCronica();
    
    if (cronica === 0) return 0;
    return (aguda / cronica).toFixed(2);
  };

  const interpretarACWR = (ratio) => {
    if (ratio < 0.8) return { status: 'Baixo', cor: 'blue', mensagem: 'Carga pode estar baixa demais' };
    if (ratio >= 0.8 && ratio <= 1.3) return { status: 'Ótimo', cor: 'green', mensagem: 'Zona ideal para performance' };
    if (ratio > 1.3 && ratio <= 1.5) return { status: 'Moderado', cor: 'yellow', mensagem: 'Atenção ao risco de lesão' };
    return { status: 'Alto Risco', cor: 'red', mensagem: 'Risco elevado de lesão - reduzir carga' };
  };

  const prepararDadosGraficoCarga = () => {
    const sessoesOrdenadas = [...sessoes].reverse();
    return sessoesOrdenadas.map(s => ({
      data: s.data?.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
      carga: s.cargaTotal || 0
    }));
  };

  const prepararDadosBemEstar = () => {
    const sessoesOrdenadas = [...sessoes].reverse();
    return sessoesOrdenadas.map(s => ({
      data: s.data?.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
      sono: s.bemEstar?.sono || 0,
      energia: s.bemEstar?.energia || 0,
      prontidao: s.bemEstar?.prontidao || 0,
      dores: s.bemEstar?.doresMusculares || 0
    }));
  };

  const calcularMediaBemEstar = () => {
    if (sessoes.length === 0) return { sono: 0, energia: 0, prontidao: 0, dores: 0 };

    const soma = sessoes.reduce((acc, s) => ({
      sono: acc.sono + (s.bemEstar?.sono || 0),
      energia: acc.energia + (s.bemEstar?.energia || 0),
      prontidao: acc.prontidao + (s.bemEstar?.prontidao || 0),
      dores: acc.dores + (s.bemEstar?.doresMusculares || 0)
    }), { sono: 0, energia: 0, prontidao: 0, dores: 0 });

    return {
      sono: (soma.sono / sessoes.length).toFixed(1),
      energia: (soma.energia / sessoes.length).toFixed(1),
      prontidao: (soma.prontidao / sessoes.length).toFixed(1),
      dores: (soma.dores / sessoes.length).toFixed(1)
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const ratio = parseFloat(calcularRatioACWR());
  const interpretacao = interpretarACWR(ratio);
  const mediaBemEstar = calcularMediaBemEstar();

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Monitorização de Carga</h3>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={14}>Últimos 14 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={60}>Últimos 60 dias</option>
        </select>
      </div>

      {sessoes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500">Sem sessões de treino registadas neste período.</p>
        </div>
      ) : (
        <>
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Carga Aguda (7 dias)</h4>
              <p className="text-3xl font-bold text-blue-600">{calcularCargaAguda()}</p>
              <p className="text-xs text-gray-500 mt-1">Média diária de carga</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Carga Crónica (28 dias)</h4>
              <p className="text-3xl font-bold text-purple-600">{calcularCargaCronica()}</p>
              <p className="text-xs text-gray-500 mt-1">Média diária de carga</p>
            </div>

            <div className={`bg-white p-6 rounded-lg border-2 shadow-sm ${
              interpretacao.cor === 'green' ? 'border-green-500' :
              interpretacao.cor === 'yellow' ? 'border-yellow-500' :
              interpretacao.cor === 'red' ? 'border-red-500' : 'border-blue-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-500">Ratio A:C</h4>
                {interpretacao.cor === 'red' && <AlertTriangle className="text-red-500" size={20} />}
              </div>
              <p className={`text-3xl font-bold ${
                interpretacao.cor === 'green' ? 'text-green-600' :
                interpretacao.cor === 'yellow' ? 'text-yellow-600' :
                interpretacao.cor === 'red' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {ratio}
              </p>
              <p className="text-xs text-gray-600 mt-1">{interpretacao.mensagem}</p>
            </div>
          </div>

          {/* Gráfico de Carga */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução da Carga de Treino</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepararDadosGraficoCarga()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="carga" name="Carga Total" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bem-Estar */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Bem-Estar</h3>
            
            {/* Médias */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Sono Médio</p>
                <p className="text-2xl font-bold text-blue-600">{mediaBemEstar.sono}/5</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Energia Média</p>
                <p className="text-2xl font-bold text-green-600">{mediaBemEstar.energia}/5</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Prontidão Média</p>
                <p className="text-2xl font-bold text-purple-600">{mediaBemEstar.prontidao}/10</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Dores Médias</p>
                <p className="text-2xl font-bold text-orange-600">{mediaBemEstar.dores}/5</p>
              </div>
            </div>

            {/* Gráfico de Bem-Estar */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepararDadosBemEstar()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sono" name="Sono" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="energia" name="Energia" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="prontidao" name="Prontidão" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="dores" name="Dores" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Alertas */}
          {ratio > 1.5 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start">
                <AlertTriangle className="text-red-500 mr-3 mt-0.5" size={20} />
                <div>
                  <h4 className="text-red-800 font-semibold">Alerta: Risco Elevado de Lesão</h4>
                  <p className="text-red-700 text-sm mt-1">
                    O ratio Aguda:Crónica está acima de 1.5, indicando um aumento abrupto de carga. 
                    Considere reduzir a intensidade ou volume dos treinos nos próximos dias.
                  </p>
                </div>
              </div>
            </div>
          )}

          {mediaBemEstar.prontidao < 5 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <div className="flex items-start">
                <AlertTriangle className="text-yellow-600 mr-3 mt-0.5" size={20} />
                <div>
                  <h4 className="text-yellow-800 font-semibold">Atenção: Prontidão Baixa</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    A prontidão média para treinar está abaixo de 5/10. O atleta pode estar a acumular fadiga. 
                    Considere sessões de regeneração ou redução de volume.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonitorizacaoCarga;
