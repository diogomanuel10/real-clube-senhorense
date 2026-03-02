import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from "../../utils/firebase";

const NovoEpisodioForm = ({ atleta, onClose, onSuccess }) => {
    const [episodioForm, setEpisodioForm] = useState({
        dataInicio: new Date().toISOString().slice(0, 10),
        diagnosticoFuncional: '',
        planoTratamento: '',
        restricoesTreinoJogo: '',
        previsaoRetorno: '',
        documentoUrl: '',
        estado: 'ativo',
    });
    const [salvando, setSalvando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);

        try {
            await addDoc(collection(db, "episodiosClinicos"), {
                atletaId: atleta.id,
                ...episodioForm,
                criadoEm: new Date().toISOString(),
            });
            onSuccess();
        } catch (err) {
            console.error("Erro ao criar episódio:", err);
            alert("Erro ao criar episódio clínico");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 sm:p-4 z-50">
            <div
                className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900">
                    <h3 className="text-sm font-semibold text-white">
                        Novo episódio clínico
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-300 hover:text-white hover:bg-slate-700 rounded-full p-1.5 transition"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-4 sm:p-6 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de início
                            </label>
                            <input
                                type="date"
                                value={episodioForm.dataInicio}
                                onChange={(e) =>
                                    setEpisodioForm({
                                        ...episodioForm,
                                        dataInicio: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Diagnóstico funcional *
                            </label>
                            <textarea
                                rows={2}
                                value={episodioForm.diagnosticoFuncional}
                                onChange={(e) =>
                                    setEpisodioForm({
                                        ...episodioForm,
                                        diagnosticoFuncional: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="Ex: Entorse tibiotársica direita grau II"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Plano de tratamento
                            </label>
                            <textarea
                                rows={3}
                                value={episodioForm.planoTratamento}
                                onChange={(e) =>
                                    setEpisodioForm({
                                        ...episodioForm,
                                        planoTratamento: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="Ex: 2–3 sessões/semana, reforço proprioceptivo..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Restrições ao treino/jogo
                            </label>
                            <input
                                type="text"
                                value={episodioForm.restricoesTreinoJogo}
                                onChange={(e) =>
                                    setEpisodioForm({
                                        ...episodioForm,
                                        restricoesTreinoJogo: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="Ex: Sem salto, sem bloqueio, apenas parte técnica"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Previsão de retorno
                            </label>
                            <input
                                type="text"
                                value={episodioForm.previsaoRetorno}
                                onChange={(e) =>
                                    setEpisodioForm({
                                        ...episodioForm,
                                        previsaoRetorno: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="Ex: 3–4 semanas"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Link para documento (Word / Drive / PDF)
                            </label>
                            <input
                                type="url"
                                value={episodioForm.documentoUrl}
                                onChange={(e) =>
                                    setEpisodioForm({
                                        ...episodioForm,
                                        documentoUrl: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="https://drive.google.com/..."
                            />
                        </div>
                    </div>

                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={salvando}
                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {salvando ? 'A guardar...' : 'Guardar episódio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NovoEpisodioForm;
