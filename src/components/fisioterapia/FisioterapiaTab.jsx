import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from "../../utils/firebase";
import { Activity, Calendar, TrendingUp, Plus, AlertCircle, FileText } from 'lucide-react';
import NovoEpisodioForm from './NovoEpisodioForm';
import HistoricoEpisodios from './HistoricoEpisodios';
import EstatisticasLesoes from './EstatisticasLesoes';

const FisioterapiaTab = ({ atleta, user }) => {
    const podeEditar = user?.role === "fisioterapeuta" || user?.role === "admin";
    const [activeSubTab, setActiveSubTab] = useState('resumo');
    const [showNovoEpisodio, setShowNovoEpisodio] = useState(false);
    const [episodios, setEpisodios] = useState([]);
    const [episodiosAtivos, setEpisodiosAtivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [episodioAtivo, setEpisodioAtivo] = useState(null);
    const [sessoes, setSessoes] = useState([]);
    const [loadingSessoes, setLoadingSessoes] = useState(false);
    const [episodioParaSessao, setEpisodioParaSessao] = useState(null);
    const [sessaoForm, setSessaoForm] = useState({
        dataSessao: '',
        nota: '',
        intervencoes: '',
        dorAntes: '',
        dorDepois: '',
    });

    useEffect(() => {
        carregarDados();
    }, [atleta.id]);

    const carregarDados = async () => {
        try {
            const qEpis = query(
                collection(db, "episodiosClinicos"),
                where("atletaId", "==", atleta.id),
                orderBy("dataInicio", "desc")
            );
            const snap = await getDocs(qEpis);
            const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setEpisodios(lista);
            setEpisodiosAtivos(lista.filter(ep => ep.estado === 'ativo'));
        } catch (err) {
            console.error("Erro ao carregar episódios:", err);
        } finally {
            setLoading(false);
        }
    };

    const carregarSessoes = async (episodioId) => {
        if (episodioAtivo === episodioId) {
            setEpisodioAtivo(null);
            setSessoes([]);
            return;
        }

        setLoadingSessoes(true);
        try {
            const ref = collection(db, "episodiosClinicos", episodioId, "sessoes");
            const snap = await getDocs(query(ref, orderBy("dataSessao", "desc")));
            setSessoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setEpisodioAtivo(episodioId);
        } catch (err) {
            console.error("Erro ao carregar sessões:", err);
            alert("Erro ao carregar sessões deste episódio.");
        } finally {
            setLoadingSessoes(false);
        }
    };

    const fecharEpisodio = async (episodioId) => {
        if (!window.confirm("Marcar este episódio como fechado (alta)?")) return;
        try {
            const ref = doc(db, "episodiosClinicos", episodioId);
            await updateDoc(ref, {
                estado: "alta",
                dataAlta: new Date().toISOString().slice(0, 10),
            });
            await carregarDados();
        } catch (err) {
            console.error("Erro ao fechar episódio:", err);
            alert("Erro ao fechar episódio clínico");
        }
    };

    const guardarNovaSessao = async () => {
        try {
            const refSessoes = collection(
                db,
                "episodiosClinicos",
                episodioParaSessao,
                "sessoes"
            );
            await addDoc(refSessoes, {
                ...sessaoForm,
                dorAntes: sessaoForm.dorAntes !== "" ? Number(sessaoForm.dorAntes) : null,
                dorDepois: sessaoForm.dorDepois !== "" ? Number(sessaoForm.dorDepois) : null,
                responsavel: user?.name || 'Sistema',
                createdAt: new Date().toISOString(),
            });

            await carregarSessoes(episodioParaSessao);
            setEpisodioParaSessao(null);
            setSessaoForm({
                dataSessao: '',
                nota: '',
                intervencoes: '',
                dorAntes: '',
                dorDepois: '',
            });
        } catch (err) {
            console.error("Erro ao criar sessão:", err);
            alert("Erro ao criar sessão de fisioterapia");
        }
    };

    const calcularEstadoAtual = () => {
        if (episodiosAtivos.length === 0) {
            return {
                cor: 'green',
                bgIndicador: 'bg-green-500',
                texto: 'Sem Lesões',
                detalhe: 'Atleta apto para treino e competição'
            };
        }

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
    };

    const calcularDiasLesao = () => {
        if (episodiosAtivos.length === 0) return null;
        const episodio = episodiosAtivos[0];
        if (!episodio.dataInicio) return null;
        const dataInicio = new Date(episodio.dataInicio);
        const hoje = new Date();
        return Math.floor((hoje - dataInicio) / (1000 * 60 * 60 * 24));
    };

    const calcularDiasAteRetorno = () => {
        if (episodiosAtivos.length === 0) return null;
        const episodio = episodiosAtivos[0];
        if (!episodio.previsaoRetorno) return null;
        
        // Extrair número de dias/semanas da previsão
        const texto = episodio.previsaoRetorno.toLowerCase();
        const matchSemanas = texto.match(/(\d+)[\s-]*semanas?/);
        const matchDias = texto.match(/(\d+)[\s-]*dias?/);
        
        if (matchSemanas) return parseInt(matchSemanas[1]) * 7;
        if (matchDias) return parseInt(matchDias[1]);
        
        return null;
    };

    const subTabs = [
        { id: 'resumo', label: 'Resumo', icon: Activity },
        { id: 'historico', label: 'Histórico', icon: Calendar },
        { id: 'estatisticas', label: 'Estatísticas', icon: TrendingUp }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header com ações rápidas */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Fisioterapia</h2>
                {podeEditar && (
                    <button
                        onClick={() => setShowNovoEpisodio(true)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
                    >
                        <Plus size={18} />
                        Novo Episódio Clínico
                    </button>
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
                                className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                                    activeSubTab === tab.id
                                        ? 'border-slate-700 text-slate-700'
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
                                    <h3 className="text-sm font-medium text-gray-500">Episódios Ativos</h3>
                                    <AlertCircle className="text-red-600" size={20} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {episodiosAtivos.length}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {episodiosAtivos.length === 0 ? 'Nenhuma lesão ativa' : 
                                     episodiosAtivos.length === 1 ? 'Lesão em tratamento' : 'Lesões em tratamento'}
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-500">Dias em Lesão</h3>
                                    <Calendar className="text-orange-600" size={20} />
                                </div>
                                {episodiosAtivos.length > 0 ? (
                                    <>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {calcularDiasLesao() || 0}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Dias desde início
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-lg text-gray-400">-</p>
                                )}
                            </div>

                            <div className={`bg-white p-4 sm:p-6 rounded-lg border-2 shadow-sm ${
                                calcularEstadoAtual().cor === 'green' ? 'border-green-400' :
                                calcularEstadoAtual().cor === 'yellow' ? 'border-yellow-400' :
                                'border-red-400'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-500">Estado Atual</h3>
                                    <Activity className={`${
                                        calcularEstadoAtual().cor === 'green' ? 'text-green-600' :
                                        calcularEstadoAtual().cor === 'yellow' ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`} size={20} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-block w-3 h-3 rounded-full ${calcularEstadoAtual().bgIndicador}`}></span>
                                    <p className={`text-lg sm:text-xl font-bold ${
                                        calcularEstadoAtual().cor === 'green' ? 'text-green-700' :
                                        calcularEstadoAtual().cor === 'yellow' ? 'text-yellow-700' :
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

                        {/* Episódios Ativos Detalhados */}
                        {episodiosAtivos.length > 0 ? (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Episódios em Tratamento</h3>
                                <div className="space-y-3">
                                    {episodiosAtivos.map((ep) => (
                                        <div
                                            key={ep.id}
                                            className="border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col gap-3"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {ep.diagnosticoFuncional || "Sem diagnóstico definido"}
                                                    </p>
                                                    <p className="text-[11px] sm:text-xs text-gray-500">
                                                        Início: {ep.dataInicio || "-"}
                                                    </p>
                                                    {ep.planoTratamento && (
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {ep.planoTratamento}
                                                        </p>
                                                    )}
                                                    {ep.restricoesTreinoJogo && (
                                                        <p className="text-[11px] sm:text-xs text-amber-700 mt-1 font-medium">
                                                            ⚠️ {ep.restricoesTreinoJogo}
                                                        </p>
                                                    )}
                                                    {ep.previsaoRetorno && (
                                                        <p className="text-xs text-blue-600 mt-1">
                                                            Previsão de retorno: {ep.previsaoRetorno}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                        Ativo
                                                    </span>

                                                    {podeEditar && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => fecharEpisodio(ep.id)}
                                                                className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50"
                                                            >
                                                                Dar Alta
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => carregarSessoes(ep.id)}
                                                                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                                                            >
                                                                {episodioAtivo === ep.id ? "Esconder" : "Ver Sessões"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEpisodioParaSessao(ep.id);
                                                                    setSessaoForm({
                                                                        dataSessao: new Date().toISOString().slice(0, 10),
                                                                        nota: "",
                                                                        intervencoes: "",
                                                                        dorAntes: "",
                                                                        dorDepois: "",
                                                                    });
                                                                }}
                                                                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs hover:bg-slate-800"
                                                            >
                                                                Nova Sessão
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {episodioAtivo === ep.id && (
                                                <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
                                                    {loadingSessoes ? (
                                                        <p className="text-xs text-slate-500">A carregar sessões...</p>
                                                    ) : sessoes.length === 0 ? (
                                                        <p className="text-xs text-slate-500">Ainda sem sessões registadas.</p>
                                                    ) : (
                                                        sessoes.map((s) => (
                                                            <div
                                                                key={s.id}
                                                                className="text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-2"
                                                            >
                                                                <p className="font-semibold">
                                                                    {s.dataSessao || "Sem data"}{" "}
                                                                    {s.responsavel && <span>· {s.responsavel}</span>}
                                                                </p>
                                                                {typeof s.dorAntes === "number" && (
                                                                    <p className="text-[11px] text-slate-500">
                                                                        Dor antes: {s.dorAntes}/10{" "}
                                                                        {typeof s.dorDepois === "number" &&
                                                                            `· depois: ${s.dorDepois}/10`}
                                                                    </p>
                                                                )}
                                                                {s.nota && <p className="mt-1">{s.nota}</p>}
                                                                {s.intervencoes && (
                                                                    <p className="text-[11px] text-slate-600 mt-1">
                                                                        Intervenções: {s.intervencoes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                <Activity className="mx-auto h-12 w-12 text-green-600 mb-3" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sem Lesões Ativas</h3>
                                <p className="text-gray-600">
                                    Este atleta não tem episódios clínicos ativos. Está apto para treino e competição.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Histórico */}
                {activeSubTab === 'historico' && (
                    <HistoricoEpisodios atletaId={atleta.id} episodios={episodios} />
                )}

                {/* Estatísticas */}
                {activeSubTab === 'estatisticas' && (
                    <EstatisticasLesoes atletaId={atleta.id} episodios={episodios} />
                )}
            </div>

            {/* Modal Nova Sessão */}
            {episodioParaSessao && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900">
                            <h3 className="text-sm font-semibold text-white">Nova Sessão de Fisioterapia</h3>
                            <button
                                type="button"
                                onClick={() => setEpisodioParaSessao(null)}
                                className="text-slate-300 hover:text-white hover:bg-slate-700 rounded-full p-1.5 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data da sessão
                                </label>
                                <input
                                    type="date"
                                    value={sessaoForm.dataSessao}
                                    onChange={(e) =>
                                        setSessaoForm({ ...sessaoForm, dataSessao: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nota / conteúdo da sessão
                                </label>
                                <textarea
                                    rows={3}
                                    value={sessaoForm.nota}
                                    onChange={(e) =>
                                        setSessaoForm({ ...sessaoForm, nota: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    placeholder="Ex: Mobilização, reforço proprioceptivo, corrida leve..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Intervenções (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={sessaoForm.intervencoes}
                                    onChange={(e) =>
                                        setSessaoForm({ ...sessaoForm, intervencoes: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    placeholder="Ex: Tec. manual, exercício X, Y, Z"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dor antes (0–10)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={sessaoForm.dorAntes}
                                        onChange={(e) =>
                                            setSessaoForm({ ...sessaoForm, dorAntes: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dor depois (0–10)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={sessaoForm.dorDepois}
                                        onChange={(e) =>
                                            setSessaoForm({ ...sessaoForm, dorDepois: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setEpisodioParaSessao(null)}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={guardarNovaSessao}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold"
                            >
                                Guardar Sessão
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Novo Episódio */}
            {podeEditar && showNovoEpisodio && (
                <NovoEpisodioForm
                    atleta={atleta}
                    onClose={() => setShowNovoEpisodio(false)}
                    onSuccess={() => {
                        carregarDados();
                        setShowNovoEpisodio(false);
                    }}
                />
            )}
        </div>
    );
};

export default FisioterapiaTab;