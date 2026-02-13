import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import {
  CalendarDays,
  RefreshCw,
  Sparkles,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Clock
} from "lucide-react";
import { gerarTreinosParaPlano } from "../utils/gerarTreinos";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function Treinos({ user }) {
  const [treinadores, setTreinadores] = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [escaloes, setEscaloes] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [savingPresenca, setSavingPresenca] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [atletasDoTreino, setAtletasDoTreino] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [showPlanosModal, setShowPlanosModal] = useState(false);
  const [showEditarTreinoModal, setShowEditarTreinoModal] = useState(false);
  const [formTreino, setFormTreino] = useState({
    descricao: "",
    planoTreino: "",
    fundamento: "",
    objetivo: "",
  });
  const [novoPlano, setNovoPlano] = useState({
    equipa: "",
    diasSemana: [],
    horaInicio: "",
    horaFim: "",
    local: "",
  });

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  useEffect(() => {
    carregarEscaloes();
    carregarTreinos();
    carregarPlanos();
    carregarTreinadores();
  }, []);

  const guardarDetalhesToreino = async (e) => {
    e.preventDefault();
    if (!treinoSelecionado) return;

    try {
      await setDoc(
        doc(db, "treinos", treinoSelecionado.id),
        formTreino,
        { merge: true }
      );

      setTreinos((prev) =>
        prev.map((t) =>
          t.id === treinoSelecionado.id ? { ...t, ...formTreino } : t
        )
      );

      setTreinoSelecionado({ ...treinoSelecionado, ...formTreino });
      setShowEditarTreinoModal(false);
      alert("Detalhes do treino guardados!");
    } catch (err) {
      console.error("Erro ao guardar detalhes:", err);
      alert("Erro ao guardar: " + err.message);
    }
  };

  const carregarTreinadores = async () => {
    try {
      const snap = await getDocs(collection(db, "treinadores"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTreinadores(lista);
    } catch (err) {
      console.error("Erro ao carregar treinadores:", err);
    }
  };

  const handleClickTreino = async (treino) => {
    setTreinoSelecionado(treino);

    try {
      const atletasSnap = await getDocs(collection(db, "atletas"));
      const todos = atletasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const doEscalao = todos.filter((a) => a.equipa === treino.equipa);
      setAtletasDoTreino(doEscalao);

      const q = query(
        collection(db, "presencas"),
        where("treinoId", "==", treino.id)
      );
      const presSnap = await getDocs(q);
      const lista = presSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPresencas(lista);
    } catch (err) {
      console.error("Erro ao carregar atletas/presenças:", err);
    }
  };

  const marcarPresenca = async (atletaId, novoEstado) => {
    if (!treinoSelecionado) return;
    setSavingPresenca(true);

    try {
      const existente = presencas.find(
        (p) => p.atletaId === atletaId && p.treinoId === treinoSelecionado.id
      );

      const agora = new Date();

      if (novoEstado === null) {
        if (existente) {
          await deleteDoc(doc(db, "presencas", existente.id));
          setPresencas((prev) => prev.filter((p) => p.id !== existente.id));
        }
      } else if (existente) {
        await setDoc(
          doc(db, "presencas", existente.id),
          { estado: novoEstado, updatedAt: agora },
          { merge: true }
        );
        setPresencas((prev) =>
          prev.map((p) =>
            p.id === existente.id ? { ...p, estado: novoEstado, updatedAt: agora } : p
          )
        );
      } else {
        const ref = await addDoc(collection(db, "presencas"), {
          treinoId: treinoSelecionado.id,
          atletaId,
          estado: novoEstado,
          createdAt: agora,
          updatedAt: agora,
        });
        setPresencas((prev) => [
          ...prev,
          {
            id: ref.id,
            treinoId: treinoSelecionado.id,
            atletaId,
            estado: novoEstado,
            createdAt: agora,
            updatedAt: agora,
          },
        ]);
      }
    } finally {
      setSavingPresenca(false);
    }
  };

  const carregarEscaloes = async () => {
    try {
      const snap = await getDocs(collection(db, "escaloes"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => a.nome.localeCompare(b.nome));
      setEscaloes(data);
    } catch (err) {
      console.error("Erro ao carregar escalões:", err);
    }
  };

  const carregarTreinos = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "treinos"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTreinos(data);
    } catch (err) {
      console.error("Erro ao carregar treinos:", err);
    } finally {
      setLoading(false);
    }
  };

  const carregarPlanos = async () => {
    try {
      const snap = await getDocs(collection(db, "planosTreino"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPlanos(data);
    } catch (err) {
      console.error("Erro ao carregar planos:", err);
    }
  };

  const handleGerarTreinosAno = async () => {
    if (!window.confirm("Gerar todos os treinos para o ano?")) return;

    setGerando(true);
    try {
      const inicio = new Date("2025-09-01");
      const fim = new Date("2026-06-30");

      for (const plano of planos) {
        await gerarTreinosParaPlano(plano, inicio, fim);
      }

      await carregarTreinos();
      alert("Treinos gerados para o ano!");
    } catch (err) {
      console.error("Erro ao gerar treinos:", err);
      alert("Erro ao gerar treinos: " + err.message);
    } finally {
      setGerando(false);
    }
  };

  const handleGerirPlanos = () => {
    setShowPlanosModal(true);
  };

  const handleCriarPlano = async (e) => {
    e.preventDefault();
    if (!novoPlano.equipa || novoPlano.diasSemana.length === 0) {
      alert("Preenche escalão e pelo menos um dia da semana.");
      return;
    }

    try {
      await addDoc(collection(db, "planosTreino"), novoPlano);
      setNovoPlano({
        equipa: "",
        diasSemana: [],
        horaInicio: "",
        horaFim: "",
        local: "",
      });
      await carregarPlanos();
      alert("Plano criado!");
    } catch (err) {
      console.error("Erro ao criar plano:", err);
      alert("Erro: " + err.message);
    }
  };

  const handleDeletePlano = async (id) => {
    if (!window.confirm("Eliminar este plano?")) return;
    try {
      await deleteDoc(doc(db, "planosTreino", id));
      await carregarPlanos();
      alert("Plano eliminado!");
    } catch (err) {
      alert("Erro ao eliminar: " + err.message);
    }
  };

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

  const DIAS_SEMANA = [
    { label: "Segunda", value: 1 },
    { label: "Terça", value: 2 },
    { label: "Quarta", value: 3 },
    { label: "Quinta", value: 4 },
    { label: "Sexta", value: 5 },
    { label: "Sábado", value: 6 },
    { label: "Domingo", value: 0 },
  ];

  const getDiasDoMes = (ano, mes) => {
    const primeiro = new Date(ano, mes, 1);
    const ultimo = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimo.getDate();
    const offset = (primeiro.getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let dia = 1; dia <= diasNoMes; dia++) {
      cells.push(new Date(ano, mes, dia));
    }
    return cells;
  };

  const abrirModalEditarTreino = (treino) => {
    setFormTreino({
      descricao: treino.descricao || "",
      planoTreino: treino.planoTreino || "",
      fundamento: treino.fundamento || "",
      objetivo: treino.objetivo || "",
    });
    setShowEditarTreinoModal(true);
  };

  const dias = getDiasDoMes(currentYear, currentMonth);

  const treinosPorDia = treinos.reduce((acc, treino) => {
    if (!treino.data) return acc;
    const [y, m, d] = treino.data.split("-").map(Number);
    if (y === currentYear && m === currentMonth + 1) {
      if (!acc[d]) acc[d] = [];
      acc[d].push(treino);
    }
    return acc;
  }, {});

  const mudarMes = (delta) => {
    let novoMes = currentMonth + delta;
    let novoAno = currentYear;
    if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    }
    setCurrentMonth(novoMes);
    setCurrentYear(novoAno);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsivo */}
      <header className="px-4 md:px-8 pt-6 md:pt-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <CalendarDays className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Treinos</h1>
            <p className="text-xs md:text-sm text-slate-500">
              Calendário anual de treinos e presenças
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={handleGerirPlanos}
            className="px-3 md:px-4 py-2 rounded-xl bg-white text-slate-800 text-xs md:text-sm font-medium flex items-center space-x-2 border border-slate-200 hover:bg-slate-50"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Gerir planos</span>
            <span className="sm:hidden">Planos</span>
          </button>

          <button
            onClick={handleGerarTreinosAno}
            disabled={gerando}
            className="px-3 md:px-4 py-2 rounded-xl bg-slate-900 text-white text-xs md:text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gerando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">A gerar…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Gerar treinos do ano</span>
                <span className="sm:hidden">Gerar</span>
              </>
            )}
          </button>

          <button
            onClick={carregarTreinos}
            className="px-3 py-2 rounded-xl bg-white text-slate-700 text-xs md:text-sm border border-slate-200 flex items-center space-x-2 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">Atualizar</span>
          </button>
        </div>
      </header>

      <main className="px-4 md:px-8 pb-8">
        {/* Navegação de mês */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => mudarMes(-1)}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base md:text-lg font-semibold text-slate-900">
              {MESES[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={() => mudarMes(1)}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendário Modernizado */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header dos dias da semana */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-[#0b1635] to-[#152452] text-white">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia, idx) => (
              <div
                key={idx}
                className="text-center py-2 md:py-3 text-[10px] md:text-xs font-semibold uppercase tracking-wider border-r border-white/10 last:border-r-0"
              >
                {dia}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 md:py-32">
              <div className="text-center">
                <div className="h-10 w-10 md:h-12 md:w-12 border-3 border-[#f5c623] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xs md:text-sm text-slate-500">A carregar treinos...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {dias.map((date, idx) => {
                if (!date) {
                  return (
                    <div
                      key={idx}
                      className="aspect-square md:min-h-[160px] bg-slate-50/50 border-r border-b border-slate-100"
                    />
                  );
                }

                const dia = date.getDate();
                const isHoje = date.toDateString() === new Date().toDateString();
                const treinosDia = treinosPorDia[dia] || [];
                const temTreinos = treinosDia.length > 0;

                return (
                  <div
                    key={idx}
                    className={`
                      min-h-[120px] md:min-h-[160px] border-r border-b border-slate-100 last:border-r-0
                      transition-all duration-200 hover:bg-slate-50
                      ${isHoje ? "bg-blue-50/50" : "bg-white"}
                    `}
                  >
                    {/* Header do dia */}
                    <div className={`
                      p-1.5 md:p-2 flex items-center justify-between border-b
                      ${isHoje ? "bg-[#f5c623] border-[#f5c623]" : "bg-slate-50 border-slate-100"}
                    `}>
                      <span className={`
                        text-xs md:text-sm font-bold
                        ${isHoje ? "text-[#0b1635]" : "text-slate-700"}
                      `}>
                        {dia}
                      </span>
                      {temTreinos && (
                        <div className={`
                          flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full text-[9px] md:text-[10px] font-bold
                          ${isHoje ? "bg-[#0b1635] text-white" : "bg-emerald-500 text-white"}
                        `}>
                          {treinosDia.length}
                        </div>
                      )}
                    </div>

                    {/* Treinos do dia */}
                    <div className="p-1.5 md:p-2 space-y-1 md:space-y-1.5 max-h-[100px] md:max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                      {treinosDia.length === 0 ? (
                        <div className="flex items-center justify-center h-16 md:h-20">
                          <span className="text-[9px] md:text-[10px] text-slate-400">Sem treinos</span>
                        </div>
                      ) : (
                        treinosDia.map((t) => {
                          const esc = escaloes.find((e) => e.nome === t.equipa);
                          const cor = esc?.cor || "from-slate-200 to-slate-300";

                          return (
                            <button
                              key={t.id}
                              onClick={() => handleClickTreino(t)}
                              className={`
                                w-full text-left p-1.5 md:p-2 rounded-lg
                                bg-gradient-to-br ${cor}
                                border border-slate-300/50 shadow-sm
                                transition-all duration-200
                                hover:scale-[1.02] hover:shadow-md
                                cursor-pointer group
                              `}
                            >
                              <div className="flex items-center justify-between mb-0.5 md:mb-1">
                                <span className="text-[9px] md:text-[11px] font-bold text-slate-900 truncate pr-1">
                                  {t.equipa}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-slate-900 rounded-full" />
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-[8px] md:text-[9px] text-slate-700 font-medium">
                                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                <span>{t.horaInicio}–{t.horaFim}</span>
                              </div>
                              {t.local && (
                                <div className="mt-0.5 text-[7px] md:text-[8px] text-slate-600 truncate">
                                  📍 {t.local}
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Planos de Treino */}
      {showPlanosModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPlanosModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">
                Planos de Treino
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Define dias da semana e horários para cada escalão
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Formulário novo plano */}
              <form
                onSubmit={handleCriarPlano}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            novoPlano.diasSemana.includes(dia.value)
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-slate-200 text-slate-700"
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="Ex: Pavilhão Principal"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar Plano</span>
                  </button>
                </div>
              </form>

              {/* Lista de planos existentes */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Planos Atuais
                </h3>
                {planos.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Ainda não existem planos.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {planos.map((plano) => (
                      <div
                        key={plano.id}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {plano.equipa}
                          </p>
                          <p className="text-xs text-slate-600">
                            {plano.diasSemana
                              .map(
                                (d) =>
                                  DIAS_SEMANA.find((dia) => dia.value === d)
                                    ?.label,
                              )
                              .join(", ")}{" "}
                            · {plano.horaInicio}–{plano.horaFim}
                          </p>
                          {plano.local && (
                            <p className="text-xs text-slate-500">
                              {plano.local}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeletePlano(plano.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0">
              <button
                onClick={() => setShowPlanosModal(false)}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
{/* Modal de Detalhes do Treino */}
{treinoSelecionado && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    onClick={() => setTreinoSelecionado(null)}
  >
    <div
      className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 sticky top-0 bg-gradient-to-r from-[#0b1635] to-[#152452] text-white z-10 rounded-t-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold">
              {treinoSelecionado.equipa}
            </h2>
            <p className="text-sm text-slate-200 mt-1">
              {treinoSelecionado.data} · {treinoSelecionado.horaInicio}–
              {treinoSelecionado.horaFim}
            </p>
            {treinoSelecionado.local && (
              <p className="text-xs text-slate-300 mt-1">
                📍 {treinoSelecionado.local}
              </p>
            )}
          </div>
          <button
            onClick={() => abrirModalEditarTreino(treinoSelecionado)}
            className="px-3 py-2 bg-[#f5c623] text-[#0b1635] rounded-lg text-xs font-semibold hover:bg-[#f5c623]/90 transition flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Editar Detalhes
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Detalhes do Treino */}
        {(treinoSelecionado.descricao || 
          treinoSelecionado.planoTreino || 
          treinoSelecionado.fundamento || 
          treinoSelecionado.objetivo) && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#f5c623] rounded"></div>
              Detalhes do Treino
            </h3>

            {treinoSelecionado.descricao && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-600 mb-1">Descrição</p>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{treinoSelecionado.descricao}</p>
              </div>
            )}

            {treinoSelecionado.objetivo && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 mb-1">🎯 Objetivo</p>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{treinoSelecionado.objetivo}</p>
              </div>
            )}

            {treinoSelecionado.fundamento && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs font-semibold text-emerald-700 mb-1">🏐 Fundamento</p>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{treinoSelecionado.fundamento}</p>
              </div>
            )}

            {treinoSelecionado.planoTreino && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-semibold text-amber-700 mb-1">📋 Plano de Treino</p>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{treinoSelecionado.planoTreino}</p>
              </div>
            )}
          </div>
        )}

        {/* Lista de Atletas */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2 flex items-center gap-2">
            <div className="w-1 h-4 bg-[#f5c623] rounded"></div>
            Atletas do escalão ({atletasDoTreino.length})
          </h3>

          {atletasDoTreino.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nenhum atleta neste escalão.
            </p>
          ) : (
            <div className="space-y-2">
              {atletasDoTreino.map((atleta) => {
                const presenca = presencas.find(
                  (p) => p.atletaId === atleta.id && p.treinoId === treinoSelecionado.id
                );
                const estado = presenca?.estado || null;

                return (
                  <div
                    key={atleta.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-800">
                        {atleta.nome?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {atleta.nome}
                        </p>
                        <p className="text-xs text-slate-500">
                          {atleta.posicao || "Sem posição"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        disabled={savingPresenca}
                        onClick={() => marcarPresenca(atleta.id, "presente")}
                        className={`px-2 py-1 rounded text-xs font-medium border ${
                          estado === "presente"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        Presente
                      </button>
                      <button
                        type="button"
                        disabled={savingPresenca}
                        onClick={() => marcarPresenca(atleta.id, "falta")}
                        className={`px-2 py-1 rounded text-xs font-medium border ${
                          estado === "falta"
                            ? "bg-red-100 text-red-700 border-red-300"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        Falta
                      </button>
                      <button
                        type="button"
                        disabled={savingPresenca}
                        onClick={() => marcarPresenca(atleta.id, "justificada")}
                        className={`px-2 py-1 rounded text-xs font-medium border ${
                          estado === "justificada"
                            ? "bg-amber-100 text-amber-700 border-amber-300"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        Justificada
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 rounded-b-2xl">
        <button
          onClick={() => setTreinoSelecionado(null)}
          className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
)}
{/* Modal de Editar Detalhes do Treino */}
{showEditarTreinoModal && treinoSelecionado && (
  <div
    className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]"
    onClick={() => setShowEditarTreinoModal(false)}
  >
    <div
      className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Editar Detalhes do Treino
          </h2>
          <button
            onClick={() => setShowEditarTreinoModal(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {treinoSelecionado.equipa} · {treinoSelecionado.data}
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={guardarDetalhesToreino} className="p-6 space-y-4">
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
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setShowEditarTreinoModal(false)}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-[#0b1635] text-white rounded-lg font-medium hover:bg-[#152452] transition"
          >
            Guardar Detalhes
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}
