import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { usePermissions } from "../hooks/usePermissions";
import {
  Dumbbell,
  Search,
  Filter,
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  CATEGORIAS_EXERCICIOS,
  CONTEXTOS_EXERCICIOS,
  NIVEIS_EXERCICIOS,
} from "../constants/exercicios";
import ExercicioModal from "../components/exercicios/ExercicioModal";

export default function ExerciciosSebenta({ user }) {
  const permissions = usePermissions(user);
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroContexto, setFiltroContexto] = useState("todos");
  const [filtroNivel, setFiltroNivel] = useState("todos");

  const [showModal, setShowModal] = useState(false);
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);

  const podeEditar = permissions.isAdmin || permissions.isDirecao || permissions.isTreinador || permissions.isFisio;

  useEffect(() => {
    if (!permissions.loading) {
      carregarExercicios();
    }
  }, [permissions.loading]);

  const carregarExercicios = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "exercicios"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
      setExercicios(lista);
    } catch (err) {
      console.error("Erro ao carregar exercícios:", err);
      alert("Erro ao carregar exercícios.");
    } finally {
      setLoading(false);
    }
  };

  const abrirNovo = () => {
    setExercicioSelecionado(null);
    setShowModal(true);
  };

  const abrirEditar = (exercicio) => {
    if (!podeEditar) return;
    setExercicioSelecionado(exercicio);
    setShowModal(true);
  };

  const guardarExercicio = async (data) => {
    try {
      if (exercicioSelecionado) {
        await updateDoc(
          doc(db, "exercicios", exercicioSelecionado.id),
          {
            ...data,
            atualizadoEm: new Date().toISOString(),
          },
        );
      } else {
        await addDoc(collection(db, "exercicios"), {
          ...data,
          ativo: true,
          aprovado: true,
          criadoPorId: user?.uid || null,
          criadoPorNome: user?.displayName || null,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        });
      }
      setShowModal(false);
      setExercicioSelecionado(null);
      carregarExercicios();
    } catch (err) {
      console.error("Erro ao guardar exercício:", err);
      alert("Erro ao guardar exercício.");
    }
  };

  const exerciciosFiltrados = exercicios.filter((ex) => {
    const termo = searchTerm.toLowerCase();
    const matchSearch =
      ex.nome?.toLowerCase().includes(termo) ||
      ex.grupoMuscular?.toLowerCase().includes(termo) ||
      ex.tags?.some((t) => t.toLowerCase().includes(termo));

    const matchCategoria =
      filtroCategoria === "todas" || ex.categoria === filtroCategoria;
    const matchContexto =
      filtroContexto === "todos" || ex.contexto === filtroContexto;
    const matchNivel =
      filtroNivel === "todos" || ex.nivel === filtroNivel;

    return matchSearch && matchCategoria && matchContexto && matchNivel;
  });

  if (permissions.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-[#0b1635] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-6 h-6 text-[#0b1635]" />
              <h1 className="text-2xl font-bold text-slate-900">
                Sebenta de Exercícios
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              Biblioteca de exercícios para treinos e fisioterapia
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={carregarExercicios}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-slate-700 text-xs sm:text-sm border border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            {podeEditar && (
              <button
                onClick={abrirNovo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b1635] text-white text-xs sm:text-sm font-medium hover:bg-[#152452] shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Novo Exercício
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">
              Filtros
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome, músculo, tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              />
            </div>

            {/* Categoria */}
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
            >
              <option value="todas">Todas as categorias</option>
              {CATEGORIAS_EXERCICIOS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Contexto */}
            <select
              value={filtroContexto}
              onChange={(e) => setFiltroContexto(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
            >
              <option value="todos">Todos os contextos</option>
              {CONTEXTOS_EXERCICIOS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Nível */}
            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
            >
              <option value="todos">Todos os níveis</option>
              {NIVEIS_EXERCICIOS.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#0b1635] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : exerciciosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-1">
              Nenhum exercício encontrado
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Ajusta os filtros ou adiciona o primeiro exercício.
            </p>
            {podeEditar && (
              <button
                onClick={abrirNovo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b1635] text-white text-sm font-medium hover:bg-[#152452]"
              >
                <Plus className="w-4 h-4" />
                Adicionar Exercício
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exerciciosFiltrados.map((ex) => (
              <button
                key={ex.id}
                onClick={() => abrirEditar(ex)}
                className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">
                      {ex.nome}
                    </h3>
                    {ex.grupoMuscular && (
                      <p className="text-xs text-slate-500">
                        {ex.grupoMuscular}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {
                      NIVEIS_EXERCICIOS.find(
                        (n) => n.value === ex.nivel,
                      )?.label || "—"
                    }
                  </span>
                </div>

                {ex.descricaoCurta && (
                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                    {ex.descricaoCurta}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mt-1">
                  {ex.categoria && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px]">
                      {
                        CATEGORIAS_EXERCICIOS.find(
                          (c) => c.value === ex.categoria,
                        )?.label
                      }
                    </span>
                  )}
                  {ex.contexto && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px]">
                      {
                        CONTEXTOS_EXERCICIOS.find(
                          (c) => c.value === ex.contexto,
                        )?.label
                      }
                    </span>
                  )}
                  {ex.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]"
                    >
                      {tag}
                    </span>
                  ))}
                  {ex.tags && ex.tags.length > 3 && (
                    <span className="text-[11px] text-slate-500">
                      +{ex.tags.length - 3}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Modal criar/editar */}
        {showModal && (
          <ExercicioModal
            exercicio={exercicioSelecionado}
            onClose={() => {
              setShowModal(false);
              setExercicioSelecionado(null);
            }}
            onSave={guardarExercicio}
          />
        )}
      </div>
    </div>
  );
}
