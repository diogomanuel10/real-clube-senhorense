import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from "../../utils/firebase";
import { Activity, Calendar, Target, TrendingUp, Plus, AlertCircle } from 'lucide-react';
import AvaliacaoFisicaForm from './AvaliacaoFisicaForm';
import HistoricoAvaliacoes from './HistoricoAvaliacoes';
import GraficosEvolucao from './GraficosEvolucao';
import SessaoTreinoForm from './SessaoTreinoForm';
import MonitorizacaoCarga from './MonitorizacaoCarga';

const PreparacaoFisicaTab = ({ atleta, user }) => {
    const podeEditar = user?.role === "preparador" || user?.role === "admin";
    const [activeSubTab, setActiveSubTab] = useState('resumo');
    const [showAvaliacaoForm, setShowAvaliacaoForm] = useState(false);
    const [showSessaoForm, setShowSessaoForm] = useState(false);
    const [ultimaAvaliacao, setUltimaAvaliacao] = useState(null);
    const [proximaAvaliacao, setProximaAvaliacao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessoesCarga, setSessoesCarga] = useState([]);
    const [episodiosAtivos, setEpisodiosAtivos] = useState([]);

    useEffect(() => {
        carregarResumo();
    }, [atleta.id]);

    const carregarResumo = async () => {
        try {
            // Última avaliação física
            const q = query(
                collection(db, 'avaliacoes_fisicas'),
                where('atletaId', '==', atleta.id),
                orderBy('data', 'desc'),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const dados = snapshot.docs[0].data();
                setUltimaAvaliacao({
                    id: snapshot.docs[0].id,
                    ...dados,
                    data: dados.data?.toDate()
                });
                if (dados.proximaAvaliacao) {
                    setProximaAvaliacao(dados.proximaAvaliacao.toDate());
                }
            }

            // Episódios clínicos ativos (Fisioterapia)
            const qEpisodios = query(
                collection(db, 'episodiosClinicos'),
                where('atletaId', '==', atleta.id),
                where('estado', '==', 'ativo')
            );
            const snapEpisodios = await getDocs(qEpisodios);
            const listaEpisodios = snapEpisodios.docs.map(d => ({ id: d.id, ...d.data() }));
            setEpisodiosAtivos(listaEpisodios);

            // Sessões de treino para calcular ratio A:C
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - 28);
            const qSessoes = query(
                collection(db, 'sessoes_treino_fisico'),
                where('atletaId', '==', atleta.id),
                where('data', '>=', dataLimite),
                orderBy('data', 'desc')
            );
            const snapSessoes = await getDocs(qSessoes);
            setSessoesCarga(snapSessoes.docs.map(d => ({
                id: d.id,
                ...d.data(),
                data: d.data().data?.toDate()
            })));

        } catch (error) {
            console.error('Erro ao carregar resumo:', error);
        } finally {
            setLoading(false);
        }
    };

    const calcularEstadoAtual = () => {
        // 1. Verifica episódios clínicos ativos (Fisioterapia)
        if (episodiosAtivos.length > 0) {
            const episodio = episodiosAtivos[0];
            const temRestricoes = episodio.restricoesTreinoJogo?.trim();
            if (temRestricoes) {
                return {
                    cor: 'yellow',
                    bgIndicador: 'bg-yellow-500',
                    texto: 'Condicionado',
                    detalhe: episodio.restricoesTreinoJogo
                };
            }
            return {
                cor: 'red',
                bgIndicador: 'bg-red-500',
                texto: 'Lesionado',
                detalhe: episodio.diagnosticoFuncional || 'Episódio clínico ativo'
            };
        }

        // 2. Verifica ratio Aguda:Crónica
        const aguda = (() => {
            const ultimos7 = sessoesCarga.filter(s => {
                const diff = (new Date() - s.data) / (1000 * 60 * 60 * 24);
                return diff <= 7;
            });
            if (ultimos7.length === 0) return 0;
            return ultimos7.reduce((acc, s) => acc + (s.cargaTotal || 0), 0) / 7;
        })();

        const cronica = (() => {
            if (sessoesCarga.length === 0) return 0;
            return sessoesCarga.reduce((acc, s) => acc + (s.cargaTotal || 0), 0) / 28;
        })();

        const ratio = cronica > 0 ? aguda / cronica : 0;

        if (ratio > 1.5) {
            return {
                cor: 'orange',
                bgIndicador: 'bg-orange-500',
                texto: 'Carga Elevada',
                detalhe: `Ratio A:C de ${ratio.toFixed(2)} — risco de lesão aumentado`
            };
        }

        // 3. Tudo ok
        return {
            cor: 'green',
            bgIndicador: 'bg-green-500',
            texto: 'Apto para Treino',
            detalhe: 'Sem restrições'
        };
    };



    const calcularDiasDesdeAvaliacao = () => {
        if (!ultimaAvaliacao?.data) return null;
        const diff = Math.floor((new Date() - ultimaAvaliacao.data) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const calcularDiasAteProxima = () => {
        if (!proximaAvaliacao) return null;
        const diff = Math.floor((proximaAvaliacao - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const subTabs = [
        { id: 'resumo', label: 'Resumo', icon: Activity },
        { id: 'avaliacoes', label: 'Avaliações', icon: Calendar },
        { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
        { id: 'monitorizacao', label: 'Monitorização', icon: Target }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header com ações rápidas */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Preparação Física</h2>
                {podeEditar && (
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={() => setShowSessaoForm(true)}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            <Plus size={18} />
                            Registar Sessão
                        </button>
                        <button
                            onClick={() => setShowAvaliacaoForm(true)}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            Nova Avaliação
                        </button>
                    </div>
                )}
            </div>

            {/* Sub-navegação */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar">
                    {subTabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${activeSubTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Conteúdo */}
            <div>
                {/* Resumo */}
                {activeSubTab === 'resumo' && (
                    <div className="space-y-6">
                        {/* Cards de Resumo */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-500">Última Avaliação</h3>
                                    <Calendar className="text-blue-600" size={20} />
                                </div>
                                {ultimaAvaliacao ? (
                                    <>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {ultimaAvaliacao.data?.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Há {calcularDiasDesdeAvaliacao()} dias
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-lg text-gray-400">Sem avaliações</p>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-500">Próxima Avaliação</h3>
                                    <AlertCircle className="text-orange-600" size={20} />
                                </div>
                                {proximaAvaliacao ? (
                                    <>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {proximaAvaliacao.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {calcularDiasAteProxima() > 0
                                                ? `Em ${calcularDiasAteProxima()} dias`
                                                : calcularDiasAteProxima() === 0
                                                    ? 'Hoje'
                                                    : `Atrasada ${Math.abs(calcularDiasAteProxima())} dias`
                                            }
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-lg text-gray-400">Não agendada</p>
                                )}
                            </div>

                            <div className={`bg-white p-4 sm:p-6 rounded-lg border-2 shadow-sm ${calcularEstadoAtual().cor === 'green' ? 'border-green-400' :
                                    calcularEstadoAtual().cor === 'yellow' ? 'border-yellow-400' :
                                        calcularEstadoAtual().cor === 'orange' ? 'border-orange-400' :
                                            'border-red-400'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-500">Estado Atual</h3>
                                    <Activity className={`${calcularEstadoAtual().cor === 'green' ? 'text-green-600' :
                                            calcularEstadoAtual().cor === 'yellow' ? 'text-yellow-600' :
                                                calcularEstadoAtual().cor === 'orange' ? 'text-orange-600' :
                                                    'text-red-600'
                                        }`} size={20} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-block w-3 h-3 rounded-full ${calcularEstadoAtual().bgIndicador}`}></span>
                                    <p className={`text-lg sm:text-xl font-bold ${calcularEstadoAtual().cor === 'green' ? 'text-green-700' :
                                            calcularEstadoAtual().cor === 'yellow' ? 'text-yellow-700' :
                                                calcularEstadoAtual().cor === 'orange' ? 'text-orange-700' :
                                                    'text-red-700'
                                        }`}>
                                        {calcularEstadoAtual().texto}
                                    </p>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                                    {calcularEstadoAtual().detalhe}
                                </p>
                            </div>
                        </div>

                        {/* Dados da Última Avaliação */}
                        {ultimaAvaliacao && (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Última Avaliação</h3>

                                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                    {/* Antropometria */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Peso</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {ultimaAvaliacao.antropometria?.peso || '-'} <span className="text-sm font-normal">kg</span>
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">IMC</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {ultimaAvaliacao.antropometria?.imc || '-'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">% Massa Gorda</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {ultimaAvaliacao.antropometria?.massaGorda || '-'} <span className="text-sm font-normal">%</span>
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Altura</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {ultimaAvaliacao.antropometria?.altura || '-'} <span className="text-sm font-normal">cm</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Testes de Performance</h4>
                                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Salto Vertical</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                {ultimaAvaliacao.testesForça?.saltoVertical || '-'} <span className="text-sm font-normal">cm</span>
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">1RM Agachamento</p>
                                            <p className="text-xl font-bold text-purple-600">
                                                {ultimaAvaliacao.testesForça?.agachamento1RM || '-'} <span className="text-sm font-normal">kg</span>
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Sprint 10m</p>
                                            <p className="text-xl font-bold text-green-600">
                                                {ultimaAvaliacao.testesVelocidade?.sprint10m || '-'} <span className="text-sm font-normal">s</span>
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Yo-Yo Test</p>
                                            <p className="text-xl font-bold text-orange-600">
                                                {ultimaAvaliacao.testesResistencia?.yoYoIntermittent || '-'} <span className="text-sm font-normal">m</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {ultimaAvaliacao.observacoes && (
                                    <div className="mt-6 pt-6 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Observações</h4>
                                        <p className="text-sm text-gray-600">{ultimaAvaliacao.observacoes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Alerta se não houver avaliações */}
                        {!ultimaAvaliacao && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 mb-3" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sem Avaliações Físicas</h3>
                                <p className="text-gray-600 mb-4">
                                    Este atleta ainda não tem avaliações físicas registadas. Crie a primeira avaliação para começar a monitorizar o desempenho.
                                </p>
                                {podeEditar && (
                                    <button
                                        onClick={() => setShowAvaliacaoForm(true)}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Criar Primeira Avaliação
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Avaliações */}
                {activeSubTab === 'avaliacoes' && (
                    <HistoricoAvaliacoes atletaId={atleta.id} />
                )}

                {/* Evolução */}
                {activeSubTab === 'evolucao' && (
                    <GraficosEvolucao atletaId={atleta.id} />
                )}

                {/* Monitorização */}
                {activeSubTab === 'monitorizacao' && (
                    <MonitorizacaoCarga atletaId={atleta.id} />
                )}
            </div>

            {/* Modals */}
            {podeEditar && showAvaliacaoForm && (
                <AvaliacaoFisicaForm
                    atleta={atleta}
                    onClose={() => setShowAvaliacaoForm(false)}
                    onSuccess={() => {
                        carregarResumo();
                        setShowAvaliacaoForm(false);
                    }}
                />
            )}

            {podeEditar && showSessaoForm && (
                <SessaoTreinoForm
                    atleta={atleta}
                    onClose={() => setShowSessaoForm(false)}
                    onSuccess={() => {
                        setShowSessaoForm(false);
                    }}
                />
            )}
        </div>
    );
};

export default PreparacaoFisicaTab;
