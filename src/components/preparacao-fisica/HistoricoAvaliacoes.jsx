import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from "../../utils/firebase";
import { Calendar, TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';

const HistoricoAvaliacoes = ({ atletaId, onSelectAvaliacao }) => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAvaliacoes();
  }, [atletaId]);

  const carregarAvaliacoes = async () => {
    try {
      const q = query(
        collection(db, 'avaliacoes_fisicas'),
        where('atletaId', '==', atletaId),
        orderBy('data', 'desc')
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

  const calcularVariacao = (valorAtual, valorAnterior) => {
    if (!valorAtual || !valorAnterior) return null;
    const diferenca = valorAtual - valorAnterior;
    const percentual = ((diferenca / valorAnterior) * 100).toFixed(1);
    return { diferenca, percentual };
  };

  const renderVariacao = (variacao) => {
    if (!variacao) return null;
    
    const isPositivo = variacao.diferenca > 0;
    const isNegativo = variacao.diferenca < 0;
    
    return (
      <span className={`text-xs flex items-center gap-1 ${
        isPositivo ? 'text-green-600' : isNegativo ? 'text-red-600' : 'text-gray-500'
      }`}>
        {isPositivo && <TrendingUp size={14} />}
        {isNegativo && <TrendingDown size={14} />}
        {!isPositivo && !isNegativo && <Minus size={14} />}
        {isPositivo && '+'}
        {variacao.diferenca.toFixed(1)} ({variacao.percentual}%)
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (avaliacoes.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500">Ainda não existem avaliações físicas para este atleta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {avaliacoes.map((avaliacao, index) => {
        const avaliacaoAnterior = avaliacoes[index + 1];
        
        return (
          <div
            key={avaliacao.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {avaliacao.data?.toLocaleDateString('pt-PT', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
                {index === 0 && (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded mt-1">
                    Mais Recente
                  </span>
                )}
              </div>
              
              <button
                onClick={() => onSelectAvaliacao && onSelectAvaliacao(avaliacao)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Eye size={16} />
                Ver Detalhes
              </button>
            </div>

            {/* Antropometria */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Peso</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{avaliacao.antropometria?.peso || '-'} kg</p>
                  {avaliacaoAnterior && renderVariacao(
                    calcularVariacao(
                      avaliacao.antropometria?.peso,
                      avaliacaoAnterior.antropometria?.peso
                    )
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">IMC</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{avaliacao.antropometria?.imc || '-'}</p>
                  {avaliacaoAnterior && renderVariacao(
                    calcularVariacao(
                      avaliacao.antropometria?.imc,
                      avaliacaoAnterior.antropometria?.imc
                    )
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">% Massa Gorda</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{avaliacao.antropometria?.massaGorda || '-'}%</p>
                  {avaliacaoAnterior && renderVariacao(
                    calcularVariacao(
                      avaliacao.antropometria?.massaGorda,
                      avaliacaoAnterior.antropometria?.massaGorda
                    )
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Altura</p>
                <p className="text-lg font-semibold">{avaliacao.antropometria?.altura || '-'} cm</p>
              </div>
            </div>

            {/* Testes Destacados */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-500 mb-1">Salto Vertical</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{avaliacao.testesForça?.saltoVertical || '-'} cm</p>
                  {avaliacaoAnterior && renderVariacao(
                    calcularVariacao(
                      avaliacao.testesForça?.saltoVertical,
                      avaliacaoAnterior.testesForça?.saltoVertical
                    )
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">1RM Agachamento</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{avaliacao.testesForça?.agachamento1RM || '-'} kg</p>
                  {avaliacaoAnterior && renderVariacao(
                    calcularVariacao(
                      avaliacao.testesForça?.agachamento1RM,
                      avaliacaoAnterior.testesForça?.agachamento1RM
                    )
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Sprint 10m</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{avaliacao.testesVelocidade?.sprint10m || '-'} s</p>
                  {avaliacaoAnterior && renderVariacao(
                    calcularVariacao(
                      avaliacao.testesVelocidade?.sprint10m,
                      avaliacaoAnterior.testesVelocidade?.sprint10m
                    )
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Yo-Yo Test</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{avaliacao.testesResistencia?.yoYoIntermittent || '-'} m</p>
                  {avaliacaoAnterior && renderVariacao(
                    calcularVariacao(
                      avaliacao.testesResistencia?.yoYoIntermittent,
                      avaliacaoAnterior.testesResistencia?.yoYoIntermittent
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Observações */}
            {avaliacao.observacoes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-1">Observações</p>
                <p className="text-sm text-gray-700">{avaliacao.observacoes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HistoricoAvaliacoes;
