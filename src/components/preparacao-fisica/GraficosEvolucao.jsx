import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from "../../utils/firebase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const GraficosEvolucao = ({ atletaId }) => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metricaSelecionada, setMetricaSelecionada] = useState('saltoVertical');

  useEffect(() => {
    carregarAvaliacoes();
  }, [atletaId]);

  const carregarAvaliacoes = async () => {
    try {
      const q = query(
        collection(db, 'avaliacoes_fisicas'),
        where('atletaId', '==', atletaId),
        orderBy('data', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data?.toDate()
      }));
      
      setAvaliacoes(dados);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const metricas = {
    // Antropometria
    peso: { label: 'Peso (kg)', path: 'antropometria.peso', cor: '#3B82F6' },
    imc: { label: 'IMC', path: 'antropometria.imc', cor: '#8B5CF6' },
    massaGorda: { label: '% Massa Gorda', path: 'antropometria.massaGorda', cor: '#EF4444' },
    
    // Força
    saltoVertical: { label: 'Salto Vertical (cm)', path: 'testesForça.saltoVertical', cor: '#10B981' },
    agachamento1RM: { label: '1RM Agachamento (kg)', path: 'testesForça.agachamento1RM', cor: '#F59E0B' },
    pesoMorto1RM: { label: '1RM Peso Morto (kg)', path: 'testesForça.pesoMorto1RM', cor: '#EF4444' },
    
    // Velocidade
    sprint10m: { label: 'Sprint 10m (seg)', path: 'testesVelocidade.sprint10m', cor: '#EC4899' },
    sprint20m: { label: 'Sprint 20m (seg)', path: 'testesVelocidade.sprint20m', cor: '#8B5CF6' },
    
    // Resistência
    yoYoIntermittent: { label: 'Yo-Yo Test (m)', path: 'testesResistencia.yoYoIntermittent', cor: '#06B6D4' },
    cooperTest: { label: 'Teste Cooper (m)', path: 'testesResistencia.cooperTest', cor: '#14B8A6' }
  };

  const obterValor = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const prepararDadosGrafico = () => {
    return avaliacoes.map(avaliacao => ({
      data: avaliacao.data?.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
      valor: obterValor(avaliacao, metricas[metricaSelecionada].path)
    })).filter(item => item.valor !== null && item.valor !== undefined);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (avaliacoes.length < 2) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500">São necessárias pelo menos 2 avaliações para visualizar evolução.</p>
      </div>
    );
  }

  const dadosGrafico = prepararDadosGrafico();

  return (
    <div className="space-y-4">
      {/* Seletor de Métrica */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione a métrica para visualizar:
        </label>
        <select
          value={metricaSelecionada}
          onChange={(e) => setMetricaSelecionada(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <optgroup label="Antropometria">
            <option value="peso">Peso</option>
            <option value="imc">IMC</option>
            <option value="massaGorda">% Massa Gorda</option>
          </optgroup>
          <optgroup label="Força">
            <option value="saltoVertical">Salto Vertical</option>
            <option value="agachamento1RM">1RM Agachamento</option>
            <option value="pesoMorto1RM">1RM Peso Morto</option>
          </optgroup>
          <optgroup label="Velocidade">
            <option value="sprint10m">Sprint 10m</option>
            <option value="sprint20m">Sprint 20m</option>
          </optgroup>
          <optgroup label="Resistência">
            <option value="yoYoIntermittent">Yo-Yo Test</option>
            <option value="cooperTest">Teste Cooper</option>
          </optgroup>
        </select>
      </div>

      {/* Gráfico */}
      {dadosGrafico.length > 0 ? (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução: {metricas[metricaSelecionada].label}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="data" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="valor" 
                name={metricas[metricaSelecionada].label}
                stroke={metricas[metricaSelecionada].cor}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Estatísticas */}
         <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-500">Primeiro Valor</p>
              <p className="text-xl font-semibold text-gray-900">
                {dadosGrafico[0]?.valor?.toFixed(1) || '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Último Valor</p>
              <p className="text-xl font-semibold text-gray-900">
                {dadosGrafico[dadosGrafico.length - 1]?.valor?.toFixed(1) || '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Variação Total</p>
              <p className={`text-xl font-semibold ${
                dadosGrafico[dadosGrafico.length - 1]?.valor > dadosGrafico[0]?.valor 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {dadosGrafico[0]?.valor && dadosGrafico[dadosGrafico.length - 1]?.valor
                  ? `${((dadosGrafico[dadosGrafico.length - 1].valor - dadosGrafico[0].valor) / dadosGrafico[0].valor * 100).toFixed(1)}%`
                  : '-'
                }
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Sem dados disponíveis para esta métrica.</p>
        </div>
      )}
    </div>
  );
};

export default GraficosEvolucao;
