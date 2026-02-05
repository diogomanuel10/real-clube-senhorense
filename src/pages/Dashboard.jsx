import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Users2, Calendar, BarChart3 } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";

export default function Dashboard({ user }) {
  const navigate = useNavigate(); // ✅ Hook adicionado aqui!
  const [totalAtletas, setTotalAtletas] = useState(0);
  const [totalEscaloes, setTotalEscaloes] = useState(0);
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

  useEffect(() => {
    const carregarTreinosHoje = async () => {
      try {
        const hoje = new Date();
        const y = hoje.getFullYear();
        const m = String(hoje.getMonth() + 1).padStart(2, "0");
        const d = String(hoje.getDate()).padStart(2, "0");
        const dataStr = `${y}-${m}-${d}`; // igual ao campo data nos treinos

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
      } catch (err) {
        console.error("Erro ao carregar treinos de hoje:", err);
      }
    };

    carregarTreinosHoje();
  }, []);

  useEffect(() => {
    const fetchAtletasCount = async () => {
      try {
        const snap = await getDocs(collection(db, "atletas")); // lê a coleção toda[web:84][web:87]
        setTotalAtletas(snap.size); // número de documentos
      } catch (err) {
        console.error("Erro ao contar atletas:", err);
      }
    };

    fetchAtletasCount();
  }, []);

  useEffect(() => {
    const fetchEscaloesCount = async () => {
      try {
        const snap = await getDocs(collection(db, "escaloes")); // lê a coleção toda[web:84][web:87]
        setTotalEscaloes(snap.size); // número de documentos
      } catch (err) {
        console.error("Erro ao contar escaloes:", err);
      }
    };

    fetchEscaloesCount();
  }, []);

  const abrirTreinoNoModal = async (treino) => {
  setTreinoSelecionado(treino);
  try {
    // atletas do escalão
    const atletasSnap = await getDocs(collection(db, "atletas"));
    const todos = atletasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const doEscalao = todos.filter((a) => a.equipa === treino.equipa);
    setAtletasDoTreino(doEscalao);

    // presenças deste treino
    const q = query(
      collection(db, "presencas"),
      where("treinoId", "==", treino.id)
    );
    const presSnap = await getDocs(q);
    const lista = presSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPresencas(lista);
  } catch (err) {
    console.error("Erro ao carregar detalhes do treino:", err);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Real Clube Senhorense
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Bem-vindo de volta, {user?.email?.split("@")[0] || "Admin"}
            </p>
          </div>

          {/* ✅ Botão com navigate corrigido */}
          <button
            onClick={() => navigate("/atletas")}
            className="btn-primary flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Gerir Atletas</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Atletas
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalAtletas}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500 bg-blue-100 p-3 rounded-xl" />
            </div>
          </div>

          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Equipas Ativas
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalEscaloes}
                </p>
              </div>
              <Users2 className="w-12 h-12 text-green-500 bg-green-100 p-3 rounded-xl" />
            </div>
          </div>

          <div
            className="stat-card p-6 cursor-pointer hover:shadow-md transition"
            onClick={() =>
              treinosHoje.length > 0 && setShowTreinosHojeModal(true)
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Treinos Hoje
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.todayTrainings}
                </p>
                {treinosHoje.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Nenhum treino marcado hoje
                  </p>
                )}
              </div>
              <Calendar className="w-12 h-12 text-orange-500 bg-orange-100 p-3 rounded-xl" />
            </div>
            {showTreinosHojeModal && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    onClick={() => {
      setShowTreinosHojeModal(false);
      setTreinoSelecionado(null);
      setAtletasDoTreino([]);
      setPresencas([]);
    }}
  >
    <div
      className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-slate-900">
          Treinos de hoje ({treinosHoje.length})
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Clique num treino para ver atletas e presenças.
        </p>
      </div>

      <div className="p-6 space-y-4">
        {treinosHoje.length === 0 ? (
          <p className="text-sm text-slate-500">
            Não existem treinos marcados para hoje.
          </p>
        ) : (
          <div className="space-y-3">
            {treinosHoje.map((treino) => (
              <button
                key={treino.id}
                onClick={() => abrirTreinoNoModal(treino)}
                className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition ${
                  treinoSelecionado?.id === treino.id
                    ? "bg-blue-50 border-blue-300"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {treino.equipa}
                  </p>
                  <p className="text-xs text-slate-600">
                    {treino.data} · {treino.horaInicio}–{treino.horaFim}
                    {treino.local && ` · ${treino.local}`}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {presencas.filter((p) => p.treinoId === treino.id && p.estado === "presente").length}{" "}
                  presentes
                </span>
              </button>
            ))}
          </div>
        )}

        {treinoSelecionado && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Atletas – {treinoSelecionado.equipa}
            </h3>

            {atletasDoTreino.length === 0 ? (
              <p className="text-xs text-slate-500">
                Nenhum atleta neste escalão.
              </p>
            ) : (
              <div className="space-y-2">
                {atletasDoTreino.map((atleta) => {
                  const pres = presencas.find(
                    (p) =>
                      p.atletaId === atleta.id &&
                      p.treinoId === treinoSelecionado.id
                  );
                  const estado = pres?.estado || "sem-registo";

                  const badge =
                    estado === "presente"
                      ? "bg-emerald-100 text-emerald-700"
                      : estado === "falta"
                      ? "bg-red-100 text-red-700"
                      : estado === "justificada"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-500";

                  const label =
                    estado === "presente"
                      ? "Presente"
                      : estado === "falta"
                      ? "Falta"
                      : estado === "justificada"
                      ? "Justificada"
                      : "Sem registo";

                  return (
                    <div
                      key={atleta.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50"
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
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-medium ${badge}`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0">
        <button
          onClick={() => {
            setShowTreinosHojeModal(false);
            setTreinoSelecionado(null);
            setAtletasDoTreino([]);
            setPresencas([]);
          }}
          className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
)}

          </div>

          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Taxa Presença
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.attendanceRate}%
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-500 bg-purple-100 p-3 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>Próximos Treinos</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">
                      Sub-16 Feminino
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    18:00 - 19:30 | Pavilhão Principal
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    João Silva
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Confirmado
                </span>
              </div>

              <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-l-4 border-orange-500">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-gray-900">
                      Sub-18 Masculino
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    19:30 - 21:00 | Pavilhão Principal
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    Maria Santos
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  Pendente
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Ações Rápidas
            </h2>
            <div className="space-y-3">
              {/* ✅ Botões com navigate */}
              <button
                onClick={() => navigate("/atletas")}
                className="w-full flex items-center space-x-3 p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all group"
              >
                <Users className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-left font-medium text-gray-900">
                  Gerir Atletas
                </span>
              </button>

              <button
                onClick={() => navigate("/calendario")}
                className="w-full flex items-center space-x-3 p-4 bg-green-50 border-2 border-dashed border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all group"
              >
                <Calendar className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-left font-medium text-gray-900">
                  Calendário
                </span>
              </button>

              <button
                onClick={() => navigate("/relatorios")}
                className="w-full flex items-center space-x-3 p-4 bg-purple-50 border-2 border-dashed border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all group"
              >
                <BarChart3 className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-left font-medium text-gray-900">
                  Relatórios
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
