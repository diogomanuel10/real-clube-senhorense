import { X, Settings2, Plus, Trash2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import {
  addDoc,
  deleteDoc,
  doc,
  collection,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useClub } from '../../contexts/ClubContext';
import { DIAS_SEMANA } from "../../constants/treinos";

// ========== MODAL PLANOS (já está ok, mas vou melhorar um pouco) ==========
export const ModalPlanos = ({ escaloes, planos, onClose, onUpdate }) => {
  const { clubId } = useClub();
  const [novoPlano, setNovoPlano] = useState({
    equipa: "",
    diasSemana: [],
    horaInicio: "",
    horaFim: "",
    local: "",
  });

  const toggleDiaSemana = (dia) => {
    setNovoPlano((prev) => {
      const atual = prev.diasSemana;
      if (atual.includes(dia)) {
        return { ...prev, diasSemana: atual.filter((d) => d !== dia) };
      } else {
        return { ...prev, diasSemana: [...atual, dia] };
      }
    });
  };

  const handleCriarPlano = async (e) => {
    e.preventDefault();
    if (!novoPlano.equipa || novoPlano.diasSemana.length === 0) {
      alert("Preenche escalão e pelo menos um dia da semana.");
      return;
    }

    try {
      await addDoc(collection(db, "clubs", clubId, "planosTreino"), novoPlano);
      setNovoPlano({
        equipa: "",
        diasSemana: [],
        horaInicio: "",
        horaFim: "",
        local: "",
      });
      onUpdate();
      alert("Plano criado!");
    } catch (err) {
      console.error("Erro ao criar plano:", err);
      alert("Erro: " + err.message);
    }
  };

  const handleDeletePlano = async (id) => {
    if (!window.confirm("Eliminar este plano?")) return;
    try {
      await deleteDoc(doc(db, "clubs", clubId, "planosTreino", id));
      onUpdate();
      alert("Plano eliminado!");
    } catch (err) {
      alert("Erro ao eliminar: " + err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Planos de Treino
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Define dias da semana e horários para cada escalão
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Formulário novo plano */}
          <form
            onSubmit={handleCriarPlano}
            className="border border-slate-200 rounded-xl p-3 sm:p-4 bg-slate-50"
          >
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Novo Plano
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Escalão *
                </label>
                <select
                  value={novoPlano.equipa}
                  onChange={(e) =>
                    setNovoPlano({ ...novoPlano, equipa: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  {escaloes.map((esc) => (
                    <option key={esc.id} value={esc.nome}>
                      {esc.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dias da semana *
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() => toggleDiaSemana(dia.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${novoPlano.diasSemana.includes(dia.value)
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white border border-slate-300 text-slate-700 hover:border-blue-400"
                        }`}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Hora início *
                  </label>
                  <input
                    type="time"
                    value={novoPlano.horaInicio}
                    onChange={(e) =>
                      setNovoPlano({
                        ...novoPlano,
                        horaInicio: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Hora fim *
                  </label>
                  <input
                    type="time"
                    value={novoPlano.horaFim}
                    onChange={(e) =>
                      setNovoPlano({
                        ...novoPlano,
                        horaFim: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Local
                </label>
                <input
                  type="text"
                  value={novoPlano.local}
                  onChange={(e) =>
                    setNovoPlano({ ...novoPlano, local: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Pavilhão Principal"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Plano</span>
              </button>
            </div>
          </form>

          {/* Lista de planos */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Planos Atuais
            </h3>
            {planos.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                Ainda não existem planos.
              </p>
            ) : (
              <div className="space-y-2">
                {planos.map((plano) => (
                  <div
                    key={plano.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {plano.equipa}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {plano.diasSemana
                          .map(
                            (d) =>
                              DIAS_SEMANA.find((dia) => dia.value === d)?.label
                          )
                          .join(", ")}{" "}
                        · {plano.horaInicio}–{plano.horaFim}
                      </p>
                      {plano.local && (
                        <p className="text-xs text-slate-500 truncate">{plano.local}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeletePlano(plano.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-2 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== MODAL PLANO DO TREINO (só leitura + botão editar) ==========
export const ModalPlanoTreino = ({ treino, onClose, onEditarClick }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-gradient-to-r from-[#0b1635] to-[#152452] text-white z-10 rounded-t-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">{treino.equipa}</h2>
              <p className="text-sm text-slate-200 mt-1">
                {treino.data} · {treino.horaInicio}–{treino.horaFim}
              </p>
              {treino.local && (
                <p className="text-xs text-slate-300 mt-1 truncate">📍 {treino.local}</p>
              )}
            </div>
            <button
              onClick={onEditarClick}
              className="w-full sm:w-auto px-3 py-2 bg-[#f5c623] text-[#0b1635] rounded-lg text-xs font-semibold hover:bg-[#f5c623]/90 transition flex items-center justify-center gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Editar Detalhes
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Estado vazio */}
          {!treino.descricao && !treino.planoTreino && !treino.fundamento && !treino.objetivo && (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm font-medium">Sem plano definido</p>
              <p className="text-xs mt-1">Clica em "Editar Detalhes" para adicionar.</p>
            </div>
          )}

          {treino.descricao && (
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 mb-1">Descrição</p>
              <p className="text-sm text-slate-900 whitespace-pre-wrap">{treino.descricao}</p>
            </div>
          )}

          {treino.objetivo && (
            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 mb-1">🎯 Objetivo</p>
              <p className="text-sm text-slate-900 whitespace-pre-wrap">{treino.objetivo}</p>
            </div>
          )}

          {treino.fundamento && (
            <div className="p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs font-semibold text-emerald-700 mb-1">🏐 Fundamento</p>
              <p className="text-sm text-slate-900 whitespace-pre-wrap">{treino.fundamento}</p>
            </div>
          )}

          {treino.planoTreino && (
            <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-700 mb-1">📋 Plano de Treino</p>
              <p className="text-sm text-slate-900 whitespace-pre-wrap">{treino.planoTreino}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};


// ========== MODAL DETALHES DO TREINO (RESPONSIVO) ==========
export const ModalDetalhes = ({ treino, onClose, onEditarClick }) => {
  const { clubId } = useClub();
  const [atletas, setAtletas] = useState([]);
  const [modalJustificacao, setModalJustificacao] = useState({ open: false, atletaId: null }); // ← NOVO
  const [textoJustificacao, setTextoJustificacao] = useState(""); // ← NOVO
  const [presencas, setPresencas] = useState([]);
  const [savingPresenca, setSavingPresenca] = useState(false);

  const carregarAtletas = async () => {
    try {
      const atletasSnap = await getDocs(collection(db, "clubs", clubId, "atletas"));
      const todos = atletasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const doEscalao = todos.filter((a) => a.equipa === treino.equipa);
      setAtletas(doEscalao);

      const q = query(collection(db, "clubs", clubId, "presencas"), where("treinoId", "==", treino.id));
      const presSnap = await getDocs(q);
      const lista = presSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPresencas(lista);
    } catch (err) {
      console.error("Erro ao carregar atletas:", err);
    }
  };

  const marcarPresenca = async (atletaId, novoEstado, justificacao = "") => {
    setSavingPresenca(true);

    try {
      const existente = presencas.find(
        (p) => p.atletaId === atletaId && p.treinoId === treino.id
      );
      const agora = new Date();

      if (novoEstado === null) {
        if (existente) {
          await deleteDoc(doc(db, "clubs", clubId, "presencas", existente.id));
          setPresencas((prev) => prev.filter((p) => p.id !== existente.id));
        }
      } else if (existente) {
        const dadosUpdate = {
          estado: novoEstado,
          updatedAt: agora,
        };

        if (novoEstado === "atraso") {
          const inicioTreino = new Date(`${treino.data}T${treino.horaInicio}:00`);
          const atrasoMinutos = Math.floor((agora - inicioTreino) / (1000 * 60));
          dadosUpdate.atrasoMinutos = Math.max(0, atrasoMinutos);
          dadosUpdate.nota = `Atraso de ${dadosUpdate.atrasoMinutos} min`;
        }

        if (novoEstado === "justificada") { dadosUpdate.justificacao = justificacao; }

        await updateDoc(doc(db, "clubs", clubId, "presencas", existente.id), dadosUpdate);

        setPresencas((prev) =>
          prev.map((p) => (p.id === existente.id ? { ...p, ...dadosUpdate } : p))
        );
      } else {
        const dadosNovo = {
          treinoId: treino.id,
          atletaId,
          estado: novoEstado,
          createdAt: agora,
          updatedAt: agora,
        };

        if (novoEstado === "atraso") {
          const inicioTreino = new Date(`${treino.data}T${treino.horaInicio}:00`);
          const atrasoMinutos = Math.floor((agora - inicioTreino) / (1000 * 60));
          dadosNovo.atrasoMinutos = Math.max(0, atrasoMinutos);
          dadosNovo.nota = `Atraso de ${dadosNovo.atrasoMinutos} min`;
        }

        const ref = await addDoc(collection(db, "clubs", clubId, "presencas"), dadosNovo);
        setPresencas((prev) => [...prev, { id: ref.id, ...dadosNovo }]);
      }
    } finally {
      setSavingPresenca(false);
    }
  };

  useEffect(() => {
    carregarAtletas();
  }, [treino]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-gradient-to-r from-[#0b1635] to-[#152452] text-white z-10 rounded-t-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold truncate">{treino.equipa}</h2>
                <p className="text-sm text-slate-200 mt-1">
                  {treino.data} · {treino.horaInicio}–{treino.horaFim}
                </p>
                {treino.local && (
                  <p className="text-xs text-slate-300 mt-1 truncate">📍 {treino.local}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">

            {/* Lista de Atletas - RESPONSIVO */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#f5c623] rounded"></div>
                Atletas do escalão ({atletas.length})
              </h3>

              {atletas.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Nenhum atleta neste escalão.
                </p>
              ) : (
                <div className="space-y-3">
                  {atletas.map((atleta) => {
                    const presenca = presencas.find(
                      (p) => p.atletaId === atleta.id && p.treinoId === treino.id
                    );
                    const estado = presenca?.estado || null;

                    return (
                      <div
                        key={atleta.id}
                        className="border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition p-3"
                      >
                        {/* Info do atleta */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-800 flex-shrink-0">
                            {atleta.nome?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {atleta.nome}
                            </p>
                            <p className="text-xs text-slate-500">
                              {atleta.posicao || "Sem posição"}
                            </p>
                          </div>
                        </div>

                        {/* Botões de presença - GRID RESPONSIVO */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            disabled={savingPresenca}
                            onClick={() => marcarPresenca(atleta.id, "presente")}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${estado === "presente"
                              ? "bg-emerald-500 text-white border-emerald-600 shadow-md"
                              : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                              }`}
                          >
                            ✓ Presente
                          </button>

                          <button
                            type="button"
                            disabled={savingPresenca}
                            onClick={() => marcarPresenca(atleta.id, "atraso")}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${estado === "atraso"
                              ? "bg-orange-500 text-white border-orange-600 shadow-md"
                              : "bg-white text-orange-700 border-orange-300 hover:bg-orange-50"
                              }`}
                          >
                            ⏱ Atraso
                          </button>

                          <button
                            type="button"
                            disabled={savingPresenca}
                            onClick={() => marcarPresenca(atleta.id, "falta")}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${estado === "falta"
                              ? "bg-red-500 text-white border-red-600 shadow-md"
                              : "bg-white text-red-700 border-red-300 hover:bg-red-50"
                              }`}
                          >
                            ✗ Falta
                          </button>

                          <button
                            type="button"
                            disabled={savingPresenca}
                            onClick={() => {
                              setTextoJustificacao(presenca?.justificacao || "");
                              setModalJustificacao({ open: true, atletaId: atleta.id });
                            }}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${estado === "justificada"
                              ? "bg-amber-500 text-white border-amber-600 shadow-md"
                              : "bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
                              }`}
                          >
                            ℹ Justif.
                          </button>
                        </div>

                        {/* Mostra nota de atraso se existir */}
                        {estado === "atraso" && presenca?.nota && (
                          <p className="text-xs text-orange-700 mt-2 bg-orange-50 px-2 py-1 rounded">
                            {presenca.nota}
                          </p>
                        )}

                        {estado === "justificada" && presenca?.justificacao && (
                          <p className="text-xs text-amber-700 mt-2 bg-amber-50 px-2 py-1 rounded">
                            📝 {presenca.justificacao}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {modalJustificacao.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-slate-900 mb-1">Justificar Falta</h3>
            <p className="text-xs text-slate-500 mb-4">
              {atletas.find((a) => a.id === modalJustificacao.atletaId)?.nome}
            </p>
            <textarea
              value={textoJustificacao}
              onChange={(e) => setTextoJustificacao(e.target.value)}
              placeholder="Ex: Doença, exame, seleção federativa..."
              className="w-full p-3 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500 min-h-[100px]"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setModalJustificacao({ open: false, atletaId: null })}
                className="flex-1 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await marcarPresenca(modalJustificacao.atletaId, "justificada", textoJustificacao);
                  setModalJustificacao({ open: false, atletaId: null });
                }}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


// ========== MODAL EDITAR TREINO (RESPONSIVO) ==========
export const ModalEditarTreino = ({ treino, onClose, onSave }) => {
  const { clubId } = useClub();
  const [formTreino, setFormTreino] = useState({
    descricao: treino.descricao || "",
    planoTreino: treino.planoTreino || "",
    fundamento: treino.fundamento || "",
    objetivo: treino.objetivo || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "clubs", clubId, "treinos", treino.id), formTreino, { merge: true });
      alert("Detalhes do treino guardados!");
      onSave(formTreino); // o widget trata de fechar e redirecionar
      // ← SEM onClose() aqui
    } catch (err) {
      console.error("Erro ao guardar detalhes:", err);
      alert("Erro ao guardar: " + err.message);
    }
  };


  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Editar Detalhes do Treino
              </h2>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {treino.equipa} · {treino.data}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descrição do Treino
            </label>
            <textarea
              value={formTreino.descricao}
              onChange={(e) =>
                setFormTreino({ ...formTreino, descricao: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              rows={3}
              placeholder="Ex: Treino focado em defesa e contra-ataque"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              🎯 Objetivo do Treino
            </label>
            <textarea
              value={formTreino.objetivo}
              onChange={(e) =>
                setFormTreino({ ...formTreino, objetivo: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              rows={3}
              placeholder="Ex: Melhorar a comunicação em quadra e trabalhar transições"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              🏐 Fundamento Trabalhado
            </label>
            <textarea
              value={formTreino.fundamento}
              onChange={(e) =>
                setFormTreino({ ...formTreino, fundamento: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              rows={3}
              placeholder="Ex: Manchete, passe, defesa baixa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              📋 Plano de Treino
            </label>
            <textarea
              value={formTreino.planoTreino}
              onChange={(e) =>
                setFormTreino({ ...formTreino, planoTreino: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              rows={5}
              placeholder={`Ex:
- Aquecimento (15 min): Alongamentos + corrida leve
- Fundamentos (30 min): Manchete em duplas, passe em trio
- Tático (30 min): Sistema 5-1, rotações
- Jogo treino (30 min): 6v6
- Volta à calma (10 min): Alongamentos`}
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 py-2 bg-[#0b1635] text-white rounded-lg font-medium hover:bg-[#152452] transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Detalhes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
