// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Users, Users2, Calendar, BarChart3 } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import DashboardLayout from "../components/DashboardLayout"; // ajusta o caminho se necessário
import { useNavigate } from "react-router-dom";


export default function Dashboard({ user }) {
  const [totalAtletas, setTotalAtletas] = useState(0);
  const [totalEscaloes, setTotalEscaloes] = useState(0);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalAthletes: 0,
    activeTeams: 0,
    todayTrainings: 0,
    attendanceRate: 0,
  });
  const [treinosHoje, setTreinosHoje] = useState([]);
  const [showTreinosHojeModal, setShowTreinosHojeModal] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [atletasDoTreino, setAtletasDoTreino] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [showModalPresencas, setShowModalPresencas] = useState(false);

  const marcarPresenca = async (atletaId, treinoId, novoEstado) => {
    try {
      // Verificar se já existe registo
      const q = query(
        collection(db, "presencas"),
        where("atletaId", "==", atletaId),
        where("treinoId", "==", treinoId),
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        // Criar novo registo
        await addDoc(collection(db, "presencas"), {
          atletaId,
          treinoId,
          estado: novoEstado,
          data: new Date().toISOString(),
        });
      } else {
        // Atualizar existente
        const docId = snap.docs[0].id;
        await updateDoc(doc(db, "presencas", docId), {
          estado: novoEstado,
        });
      }

      // Recarregar presenças para atualizar UI
      const qPres = query(
        collection(db, "presencas"),
        where("treinoId", "==", treinoId),
      );
      const presSnap = await getDocs(qPres);
      const novasPresencas = presSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPresencas(novasPresencas);

      console.log(`✅ Presença marcada: ${novoEstado}`);
    } catch (err) {
      console.error("Erro ao marcar presença:", err);
    }
  };

  // --- TREINOS HOJE + PRESENÇAS + ATLETAS ---
  useEffect(() => {
    const carregarTreinosHoje = async () => {
      try {
        const hoje = new Date();
        const y = hoje.getFullYear();
        const m = String(hoje.getMonth() + 1).padStart(2, "0");
        const d = String(hoje.getDate()).padStart(2, "0");
        const dataStr = `${y}-${m}-${d}`;

        // 1. Treinos de hoje
        const qTreinos = query(
          collection(db, "treinos"),
          where("data", "==", dataStr),
        );
        const snap = await getDocs(qTreinos);
        const lista = snap.docs.map((docu) => ({
          id: docu.id,
          ...docu.data(),
        }));

        setTreinosHoje(lista);
        setStats((prev) => ({ ...prev, todayTrainings: lista.length }));

        // 2. Carregar TODOS os atletas (para saber quantos há por equipa)
        const atletasSnap = await getDocs(collection(db, "atletas"));
        const todosAtletas = atletasSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setAtletasDoTreino(todosAtletas);

        // 3. Carregar TODAS as presenças dos treinos de hoje
        if (lista.length > 0) {
          const treinoIds = lista.map((t) => t.id);
          const qPres = query(
            collection(db, "presencas"),
            where("treinoId", "in", treinoIds),
          );
          const presSnap = await getDocs(qPres);
          const todasPres = presSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setPresencas(todasPres);
        }
      } catch (err) {
        console.error("Erro ao carregar treinos de hoje:", err);
      }
    };

    carregarTreinosHoje();
  }, []);

  // --- CONTAGEM ATLETAS ---
  useEffect(() => {
    const fetchAtletasCount = async () => {
      try {
        const snap = await getDocs(collection(db, "atletas"));
        setTotalAtletas(snap.size);
      } catch (err) {
        console.error("Erro ao contar atletas:", err);
      }
    };

    fetchAtletasCount();
  }, []);

  // --- CONTAGEM ESCALÕES ---
  useEffect(() => {
    const fetchEscaloesCount = async () => {
      try {
        const snap = await getDocs(collection(db, "escaloes"));
        setTotalEscaloes(snap.size);
      } catch (err) {
        console.error("Erro ao contar escaloes:", err);
      }
    };

    fetchEscaloesCount();
  }, []);

  // --- DETALHES DO TREINO (MODAL) ---
  const abrirTreinoNoModal = async (treino) => {
    setTreinoSelecionado(treino);
    try {
      // Atletas desta equipa
      const doEscalao = atletasDoTreino.filter(
        (a) => a.equipa === treino.equipa,
      );
      setAtletasDoTreino(doEscalao); // guardar só os desta equipa

      // Presenças deste treino (já carregadas no useEffect global, mas podemos refiltrar)
      const presencasFiltradas = presencas.filter(
        (p) => p.treinoId === treino.id,
      );
      setPresencas(presencasFiltradas);

      setShowTreinosHojeModal(true); // abre o modal
    } catch (err) {
      console.error("Erro ao carregar detalhes do treino:", err);
    }
  };

  

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Atletas */}
          <div onClick={() => navigate("/atletas")} className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Total Atletas
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {totalAtletas}
                </p>
              </div>
              <Users className="w-12 h-12 text-[#0b1635] bg-[#f5c623]/20 p-3 rounded-xl" />
            </div>
          </div>

          {/* Equipas Ativas */}
          <div onClick={() => navigate("/escaloes")} className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Equipas Ativas
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {totalEscaloes}
                </p>
              </div>
              <Users2 className="w-12 h-12 text-emerald-700 bg-emerald-100 p-3 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Modal de Gestão de Presenças */}
{showModalPresencas && treinoSelecionado && (
  <div
    className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
    onClick={() => {
      setShowModalPresencas(false);
      setTreinoSelecionado(null);
    }}
  >
    <div
      className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#0b1635] to-[#152452] text-white sticky top-0 z-10 rounded-t-2xl">
        <h2 className="text-xl font-bold">
          {treinoSelecionado.equipa}
        </h2>
        <p className="text-sm text-slate-200 mt-1">
          {treinoSelecionado.data} · {treinoSelecionado.horaInicio}–{treinoSelecionado.horaFim}
          {treinoSelecionado.local && ` · ${treinoSelecionado.local}`}
        </p>
        <p className="text-xs text-[#f5c623] mt-1">
          Clique nos botões para marcar presença/falta/justificada
        </p>
      </div>

      {/* Lista de atletas */}
      <div className="p-6 space-y-3">
        {atletasDoTreino.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum atleta neste escalão.</p>
        ) : (
          atletasDoTreino
            .filter(a => a.equipa === treinoSelecionado.equipa)
            .map((atleta) => {
              const pres = presencas.find(
                (p) => p.atletaId === atleta.id && p.treinoId === treinoSelecionado.id
              );
              const estadoAtual = pres?.estado || null;

              return (
                <div
                  key={atleta.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
                >
                  {/* Info do atleta */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0b1635] flex items-center justify-center text-sm font-semibold text-white">
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

                  {/* Botões de presença */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => marcarPresenca(atleta.id, treinoSelecionado.id, "presente")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        estadoAtual === "presente"
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      }`}
                    >
                      ✓ Presente
                    </button>
                    <button
                      onClick={() => marcarPresenca(atleta.id, treinoSelecionado.id, "falta")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        estadoAtual === "falta"
                          ? "bg-red-500 text-white"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      ✗ Falta
                    </button>
                    <button
                      onClick={() => marcarPresenca(atleta.id, treinoSelecionado.id, "justificada")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        estadoAtual === "justificada"
                          ? "bg-amber-500 text-white"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      }`}
                    >
                      J
                    </button>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 rounded-b-2xl">
        <button
          onClick={() => {
            setShowModalPresencas(false);
            setTreinoSelecionado(null);
          }}
          className="w-full px-4 py-2 bg-[#0b1635] text-white rounded-lg text-sm font-medium hover:bg-[#152452] transition"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
)}


        {/* Próximos Treinos */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" />
            <span>Treinos de Hoje</span>
          </h2>

          {treinosHoje.length === 0 ? (
            <p className="text-sm text-slate-500">
              Não existem treinos marcados para hoje.
            </p>
          ) : (
            <div className="space-y-4">
              {treinosHoje.map((treino) => {
                // calcular presenças deste treino
                const presencasTreino = presencas.filter(
                  (p) => p.treinoId === treino.id,
                );
                const totalAtletasTreino = atletasDoTreino.filter(
                  (a) => a.equipa === treino.equipa,
                ).length;
                const presentes = presencasTreino.filter(
                  (p) => p.estado === "presente",
                ).length;
                const faltas = presencasTreino.filter(
                  (p) => p.estado === "falta",
                ).length;
                const justificadas = presencasTreino.filter(
                  (p) => p.estado === "justificada",
                ).length;

                const percentagemPresenca =
                  totalAtletasTreino > 0
                    ? Math.round((presentes / totalAtletasTreino) * 100)
                    : 0;

                return (
                  <div
                    key={treino.id}
                    onClick={async () => {
                      setTreinoSelecionado(treino);
                      const doEscalao = atletasDoTreino.filter(
                        (a) => a.equipa === treino.equipa,
                      );
                      setAtletasDoTreino(doEscalao);
                      const presencasFiltradas = presencas.filter(
                        (p) => p.treinoId === treino.id,
                      );
                      setPresencas(presencasFiltradas);
                      setShowModalPresencas(true);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center p-4 bg-gradient-to-r from-[#0b1635] to-[#152452] rounded-xl border-l-4 border-[#f5c623] hover:shadow-lg transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span className="font-semibold text-white">
                            {treino.equipa}
                          </span>
                        </div>
                        <p className="text-sm text-slate-200">
                          {treino.horaInicio} - {treino.horaFim} |{" "}
                          {treino.local || "Pavilhão Principal"}
                        </p>
                        <p className="text-sm font-medium text-[#f5c623] mt-1">
                          {treino.treinador || "Sem treinador"}
                        </p>
                      </div>

                      {/* Percentagem de presença */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-300">
                            Presença:
                          </span>
                          <span className="text-lg font-bold text-[#f5c623]">
                            {percentagemPresenca}%
                          </span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded">
                            {presentes} ✓
                          </span>
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                            {faltas} ✗
                          </span>
                          {justificadas > 0 && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded">
                              {justificadas} J
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
