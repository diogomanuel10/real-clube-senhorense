import React, { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    updateDoc,
    addDoc,
    deleteDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { Activity, ListOrdered, BarChart3, Plus } from "lucide-react";
import NovoEpisodioForm from "./NovoEpisodioForm";
import HistoricoEpisodios from "./HistoricoEpisodios";
import EstatisticasLesoes from "./EstatisticasLesoes";

const FisioterapiaTab = ({ atleta, user }) => {
    const [episodios, setEpisodios] = useState([]);
    const [loadingEpisodios, setLoadingEpisodios] = useState(true);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [episodioAvaliacoesAtivo, setEpisodioAvaliacoesAtivo] = useState(null);
    const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
    const [episodioAvaliacoesLista, setEpisodioAvaliacoesLista] = useState(null); // só lista

    const [episodioModalAvaliacao, setEpisodioModalAvaliacao] = useState(null);   // modal
    const [avaliacaoParaEditar, setAvaliacaoParaEditar] = useState(null);
    const [avaliacaoForm, setAvaliacaoForm] = useState({
        momento: "inicio",
        data: "",
        descricao: "",
    });


    const [subtab, setSubtab] = useState("visao-geral"); // "visao-geral" | "historico" | "estatisticas"

    const [showNovoEpisodio, setShowNovoEpisodio] = useState(false);

    const [episodioAtivo, setEpisodioAtivo] = useState(null);
    const [sessoes, setSessoes] = useState([]);
    const [loadingSessoes, setLoadingSessoes] = useState(false);
    const [episodioParaSessao, setEpisodioParaSessao] = useState(null);
    const [sessaoForm, setSessaoForm] = useState({
        dataSessao: "",
        nota: "",
        intervencoes: "",
        dorAntes: "",
        dorDepois: "",
    });

    const podeEditar = user?.role === "admin" || user?.role === "fisio";

    const carregarEpisodios = async () => {
        if (!atleta?.id) return;
        setLoadingEpisodios(true);
        try {
            const qEpis = query(
                collection(db, "episodiosClinicos"),
                where("atletaId", "==", atleta.id),
                orderBy("dataInicio", "desc")
            );
            const snap = await getDocs(qEpis);
            const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setEpisodios(lista);
        } catch (err) {
            console.error("Erro ao carregar episódios:", err);
            alert("Erro ao carregar episódios clínicos.");
        } finally {
            setLoadingEpisodios(false);
        }
    };

    useEffect(() => {
        carregarEpisodios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [atleta?.id]);

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

    const carregarAvaliacoes = async (episodioId) => {
        if (episodioAvaliacoesLista === episodioId) {
            setEpisodioAvaliacoesLista(null);
            setAvaliacoes([]);
            return;
        }

        setLoadingAvaliacoes(true);
        try {
            const ref = collection(db, "episodiosClinicos", episodioId, "avaliacoes");
            const snap = await getDocs(query(ref, orderBy("data", "asc")));
            setAvaliacoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setEpisodioAvaliacoesLista(episodioId);
        } catch (err) {
            console.error("Erro ao carregar avaliações:", err);
            alert("Erro ao carregar avaliações deste episódio.");
        } finally {
            setLoadingAvaliacoes(false);
        }
    };


    const guardarAvaliacao = async () => {
        const episodioId = episodioModalAvaliacao;
        if (!episodioId) return;

        try {
            const refAvaliacoes = collection(db, "episodiosClinicos", episodioId, "avaliacoes");

            if (avaliacaoParaEditar) {
                const docRef = doc(refAvaliacoes, avaliacaoParaEditar.id);
                await updateDoc(docRef, {
                    ...avaliacaoForm,
                    data: avaliacaoForm.data || new Date().toISOString().slice(0, 10),
                    updatedAt: new Date().toISOString(),
                });
            } else {
                await addDoc(refAvaliacoes, {
                    ...avaliacaoForm,
                    data: avaliacaoForm.data || new Date().toISOString().slice(0, 10),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }

            await carregarAvaliacoes(episodioId);
            setEpisodioModalAvaliacao(null);
            setAvaliacaoParaEditar(null);
            setAvaliacaoForm({ momento: "inicio", data: "", descricao: "" });
        } catch (err) {
            console.error("Erro ao guardar avaliação:", err);
            alert("Erro ao guardar avaliação clínica");
        }
    };


    const fecharEpisodio = async (ep) => {
        if (!window.confirm("Marcar este episódio como fechado (alta)?")) return;

        try {
            const ref = doc(db, "episodiosClinicos", ep.id);
            await updateDoc(ref, {
                estado: "alta",
                dataAlta: new Date().toISOString().slice(0, 10),
            });
            await carregarEpisodios();
        } catch (err) {
            console.error("Erro ao fechar episódio:", err);
            alert("Erro ao fechar episódio clínico");
        }
    };

    const guardarSessao = async () => {
        if (!episodioParaSessao) return;

        try {
            const refSessoes = collection(
                db,
                "episodiosClinicos",
                episodioParaSessao,
                "sessoes"
            );
            await addDoc(refSessoes, {
                ...sessaoForm,
                dorAntes:
                    sessaoForm.dorAntes !== "" ? Number(sessaoForm.dorAntes) : null,
                dorDepois:
                    sessaoForm.dorDepois !== "" ? Number(sessaoForm.dorDepois) : null,
                createdAt: new Date().toISOString(),
            });

            await carregarSessoes(episodioParaSessao);
            setEpisodioParaSessao(null);
            setSessaoForm({
                dataSessao: "",
                nota: "",
                intervencoes: "",
                dorAntes: "",
                dorDepois: "",
            });
        } catch (err) {
            console.error("Erro ao criar sessão:", err);
            alert("Erro ao criar sessão de fisioterapia");
        }
    };

    const episodiosAtivos = episodios.filter((e) => e.estado === "ativo");

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-700" />
                        Departamento Médico / Fisioterapia
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600">
                        Gestão dos episódios clínicos, sessões de fisioterapia e análise de
                        padrões de lesão.
                    </p>
                </div>

                {podeEditar && (
                    <button
                        type="button"
                        onClick={() => setShowNovoEpisodio(true)}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Novo episódio clínico
                    </button>
                )}
            </div>

            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 overflow-x-auto no-scrollbar text-xs sm:text-sm">
                <button
                    onClick={() => setSubtab("visao-geral")}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg font-medium flex items-center gap-2 ${subtab === "visao-geral"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                >
                    <Activity className="w-3 h-3" />
                    Visão geral
                </button>
                <button
                    onClick={() => setSubtab("historico")}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg font-medium flex items-center gap-2 ${subtab === "historico"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                >
                    <ListOrdered className="w-3 h-3" />
                    Histórico
                </button>
                <button
                    onClick={() => setSubtab("estatisticas")}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg font-medium flex items-center gap-2 ${subtab === "estatisticas"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                >
                    <BarChart3 className="w-3 h-3" />
                    Estatísticas
                </button>
            </div>

            {subtab === "visao-geral" && (
                <div className="space-y-4">
                    {loadingEpisodios ? (
                        <p className="text-sm text-slate-500">A carregar episódios...</p>
                    ) : episodiosAtivos.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            Não existem episódios ativos para este atleta.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {episodiosAtivos.map((ep) => (
                                <div
                                    key={ep.id}
                                    className="border border-red-200 bg-red-50 rounded-xl p-3 sm:p-4 flex flex-col gap-3"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {ep.diagnosticoFuncional || "Sem diagnóstico definido"}
                                            </p>
                                            <p className="text-[11px] sm:text-xs text-gray-500">
                                                Início: {ep.dataInicio || "-"}
                                                {ep.dataAlta && ` • Alta: ${ep.dataAlta}`}
                                            </p>
                                            {ep.restricoesTreinoJogo && (
                                                <p className="text-[11px] sm:text-xs text-amber-700 mt-1">
                                                    Restrição: {ep.restricoesTreinoJogo}
                                                </p>
                                            )}
                                            {ep.previsaoRetorno && (
                                                <p className="text-[11px] sm:text-xs text-blue-700 mt-1">
                                                    Previsão de retorno: {ep.previsaoRetorno}
                                                </p>
                                            )}
                                            {ep.documentoUrl && (
                                                <p className="mt-1 text-[11px] sm:text-xs">
                                                    <a
                                                        href={ep.documentoUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-600 underline"
                                                    >
                                                        Abrir documento associado
                                                    </a>
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                Ativo
                                            </span>

                                            {podeEditar && (
                                                <button
                                                    type="button"
                                                    onClick={() => fecharEpisodio(ep)}
                                                    className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50"
                                                >
                                                    Fechar episódio
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => carregarSessoes(ep.id)}
                                                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                                            >
                                                {episodioAtivo === ep.id
                                                    ? "Esconder sessões"
                                                    : "Ver sessões"}
                                            </button>

                                            {podeEditar && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEpisodioParaSessao(ep.id);
                                                        setSessaoForm({
                                                            dataSessao: "",
                                                            nota: "",
                                                            intervencoes: "",
                                                            dorAntes: "",
                                                            dorDepois: "",
                                                        });
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs hover:bg-slate-800"
                                                >
                                                    Nova sessão
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Avaliações do episódio */}
                                    <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] sm:text-xs font-semibold text-slate-700">
                                                Avaliações
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => carregarAvaliacoes(ep.id)}
                                                    className="text-[11px] sm:text-xs text-slate-700 underline"
                                                >
                                                    {episodioAvaliacoesLista === ep.id
                                                        ? "Esconder avaliações"
                                                        : "Ver avaliações"}
                                                </button>
                                                {podeEditar && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAvaliacaoParaEditar(null);
                                                            setAvaliacaoForm({
                                                                momento: "inicio",
                                                                data: "",
                                                                descricao: "",
                                                            });
                                                            setEpisodioAvaliacoesAtivo(ep.id);
                                                        }}
                                                        className="text-[11px] sm:text-xs text-blue-700 underline"
                                                    >
                                                        Nova avaliação
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {episodioAvaliacoesAtivo === ep.id && (
                                            <div className="space-y-2 mt-1">
                                                {loadingAvaliacoes ? (
                                                    <p className="text-[11px] text-slate-500">
                                                        A carregar avaliações...
                                                    </p>
                                                ) : avaliacoes.length === 0 ? (
                                                    <p className="text-[11px] text-slate-500">
                                                        Ainda não existem avaliações registadas.
                                                    </p>
                                                ) : (
                                                    avaliacoes.map((av) => (
                                                        <div
                                                            key={av.id}
                                                            className="text-[11px] sm:text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-2 flex justify-between gap-3"
                                                        >
                                                            <div>
                                                                <p className="font-semibold">
                                                                    {av.momento === "inicio"
                                                                        ? "Início"
                                                                        : av.momento === "intermedio"
                                                                            ? "Intermédio"
                                                                            : "Fim"}{" "}
                                                                    • {av.data || "-"}
                                                                </p>
                                                                {av.descricao && (
                                                                    <p className="mt-1 leading-snug">{av.descricao}</p>
                                                                )}
                                                            </div>

                                                            {podeEditar && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setAvaliacaoParaEditar(av);
                                                                        setAvaliacaoForm({
                                                                            momento: av.momento || "inicio",
                                                                            data: av.data || "",
                                                                            descricao: av.descricao || "",
                                                                        });
                                                                        setEpisodioAvaliacoesAtivo(ep.id);
                                                                    }}
                                                                    className="self-start text-[11px] text-blue-700 underline"
                                                                >
                                                                    Editar
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {episodioAtivo === ep.id && (
                                        <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
                                            {loadingSessoes ? (
                                                <p className="text-xs text-slate-500">
                                                    A carregar sessões...
                                                </p>
                                            ) : sessoes.length === 0 ? (
                                                <p className="text-xs text-slate-500">
                                                    Ainda sem sessões registadas.
                                                </p>
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
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {subtab === "historico" && (
                <HistoricoEpisodios atletaId={atleta.id} episodios={episodios} />
            )}

            {subtab === "estatisticas" && (
                <EstatisticasLesoes atletaId={atleta.id} episodios={episodios} />
            )}

            {/* Modal NOVA / EDITAR AVALIAÇÃO */}
            {episodioAvaliacoesAtivo && (podeEditar || avaliacaoParaEditar) && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div
                        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900">
                            <h3 className="text-sm font-semibold text-white">
                                {avaliacaoParaEditar ? "Editar avaliação" : "Nova avaliação"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setAvaliacaoParaEditar(null);
                                    setEpisodioAvaliacoesAtivo(null);
                                    setAvaliacaoForm({
                                        momento: "inicio",
                                        data: "",
                                        descricao: "",
                                    });
                                }}
                                className="text-slate-300 hover:text-white hover:bg-slate-700 rounded-full p-1.5 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Momento
                                    </label>
                                    <select
                                        value={avaliacaoForm.momento}
                                        onChange={(e) =>
                                            setAvaliacaoForm({
                                                ...avaliacaoForm,
                                                momento: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    >
                                        <option value="inicio">Início</option>
                                        <option value="intermedio">Intermédio</option>
                                        <option value="fim">Fim</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data
                                    </label>
                                    <input
                                        type="date"
                                        value={avaliacaoForm.data}
                                        onChange={(e) =>
                                            setAvaliacaoForm({
                                                ...avaliacaoForm,
                                                data: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição / Resultado da avaliação
                                </label>
                                <textarea
                                    rows={3}
                                    value={avaliacaoForm.descricao}
                                    onChange={(e) =>
                                        setAvaliacaoForm({
                                            ...avaliacaoForm,
                                            descricao: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    placeholder="Ex: Avaliação funcional inicial, testes de força, mobilidade, VAS dor, etc."
                                />
                            </div>
                        </div>

                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setAvaliacaoParaEditar(null);
                                    setEpisodioAvaliacoesAtivo(null);
                                    setAvaliacaoForm({
                                        momento: "inicio",
                                        data: "",
                                        descricao: "",
                                    });
                                }}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => guardarAvaliacao(episodioAvaliacoesAtivo)}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold"
                            >
                                {avaliacaoParaEditar ? "Guardar alterações" : "Guardar avaliação"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {showNovoEpisodio && (
                <NovoEpisodioForm
                    atleta={atleta}
                    onClose={() => setShowNovoEpisodio(false)}
                    onSuccess={() => {
                        setShowNovoEpisodio(false);
                        carregarEpisodios();
                    }}
                />
            )}

            {episodioParaSessao && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div
                        className="bg-white rounded-2xl max-w-lg w_full shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900">
                            <h3 className="text-sm font-semibold text-white">
                                Nova sessão de fisioterapia
                            </h3>
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
                                        setSessaoForm({
                                            ...sessaoForm,
                                            dataSessao: e.target.value,
                                        })
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
                                        setSessaoForm({
                                            ...sessaoForm,
                                            nota: e.target.value,
                                        })
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
                                        setSessaoForm({
                                            ...sessaoForm,
                                            intervencoes: e.target.value,
                                        })
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
                                            setSessaoForm({
                                                ...sessaoForm,
                                                dorAntes: e.target.value,
                                            })
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
                                            setSessaoForm({
                                                ...sessaoForm,
                                                dorDepois: e.target.value,
                                            })
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
                                onClick={guardarSessao}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold"
                            >
                                Guardar sessão
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FisioterapiaTab;
