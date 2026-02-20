import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import {
  Package,
  Plus,
  Search,
  CheckCircle,
  Wrench,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import EquipamentoModal from "../components/equipamentos/EquipamentoModal";
import EmprestimoModal from "../components/equipamentos/EmprestimoModal";
import ManutencaoModal from "../components/equipamentos/ManutencaoModal";
import EquipamentoCard from "../components/equipamentos/EquipamentoCard";

const Equipamentos = ({ user }) => {
  const [equipamentos, setEquipamentos] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'list'

  // Modals
  const [showEquipamentoModal, setShowEquipamentoModal] = useState(false);
  const [showEmprestimoModal, setShowEmprestimoModal] = useState(false);
  const [showManutencaoModal, setShowManutencaoModal] = useState(false);
  const [selectedEquipamento, setSelectedEquipamento] = useState(null);

  // Categorias disponíveis
  const categorias = [
    "Bolas",
    "Redes",
    "Uniformes",
    "Proteções",
    "Equipamento Treino",
    "Eletrónicos",
    "Outros",
  ];

  // Estados disponíveis
  const estados = [
    { value: "disponivel", label: "Disponível", color: "green" },
    { value: "em_uso", label: "Em Uso", color: "blue" },
    { value: "manutencao", label: "Manutenção", color: "yellow" },
    { value: "danificado", label: "Danificado", color: "red" },
    { value: "perdido", label: "Perdido", color: "gray" },
  ];

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const equipamentosSnap = await getDocs(
        query(collection(db, "equipamentos"), orderBy("nome", "asc")),
      );
      const equipamentosData = equipamentosSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const emprestimosSnap = await getDocs(
        query(
          collection(db, "emprestimos"),
          where("devolvido", "==", false),
        ),
      );
      const emprestimosData = emprestimosSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setEquipamentos(equipamentosData);
      setEmprestimos(emprestimosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar equipamentos
  const equipamentosFiltrados = equipamentos.filter((eq) => {
    const termo = searchTerm.toLowerCase();
    const matchSearch =
      eq.nome.toLowerCase().includes(termo) ||
      eq.codigo?.toLowerCase().includes(termo);
    const matchCategoria =
      filterCategoria === "todos" || eq.categoria === filterCategoria;
    const matchEstado =
      filterEstado === "todos" || eq.estado === filterEstado;

    return matchSearch && matchCategoria && matchEstado;
  });

  // Estatísticas
  const stats = {
    total: equipamentos.length,
    disponiveis: equipamentos.filter(
      (eq) => eq.estado === "disponivel",
    ).length,
    emUso: equipamentos.filter((eq) => eq.estado === "em_uso").length,
    manutencao: equipamentos.filter(
      (eq) => eq.estado === "manutencao",
    ).length,
    valorTotal: equipamentos.reduce(
      (sum, eq) => sum + (eq.valor || 0),
      0,
    ),
    emprestimosAtivos: emprestimos.length,
  };

  // Handlers
  const handleNovoEquipamento = () => {
    setSelectedEquipamento(null);
    setShowEquipamentoModal(true);
  };

  const handleEditarEquipamento = (equipamento) => {
    setSelectedEquipamento(equipamento);
    setShowEquipamentoModal(true);
  };

  const handleEmprestar = (equipamento) => {
    setSelectedEquipamento(equipamento);
    setShowEmprestimoModal(true);
  };

  const handleManutencao = (equipamento) => {
    setSelectedEquipamento(equipamento);
    setShowManutencaoModal(true);
  };

  const handleDevolucao = async (equipamentoId) => {
    try {
      const emprestimo = emprestimos.find(
        (emp) => emp.equipamentoId === equipamentoId,
      );
      if (!emprestimo) return;

      await updateDoc(doc(db, "emprestimos", emprestimo.id), {
        devolvido: true,
        dataDevolucao: new Date().toISOString(),
      });

      await updateDoc(doc(db, "equipamentos", equipamentoId), {
        estado: "disponivel",
        atualizadoEm: new Date().toISOString(),
      });

      carregarDados();
      alert("Equipamento devolvido com sucesso!");
    } catch (error) {
      console.error("Erro ao devolver:", error);
      alert("Erro ao processar devolução");
    }
  };

  const handleEliminar = async (equipamentoId) => {
    if (!confirm("Tem certeza que deseja eliminar este equipamento?")) return;

    try {
      await deleteDoc(doc(db, "equipamentos", equipamentoId));
      carregarDados();
      alert("Equipamento eliminado com sucesso!");
    } catch (error) {
      console.error("Erro ao eliminar:", error);
      alert("Erro ao eliminar equipamento");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">
            Carregando equipamentos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              Gestão de Equipamentos
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Controlo total do inventário do clube
            </p>
          </div>

          {(user?.role === "admin" || user?.role === "diretor") && (
            <button
              onClick={handleNovoEquipamento}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Novo Equipamento
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Package className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Disponíveis
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.disponiveis}
                </p>
              </div>
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Em Uso</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {stats.emUso}
                </p>
              </div>
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Manutenção
                </p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                  {stats.manutencao}
                </p>
              </div>
              <Wrench className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Empréstimos
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {stats.emprestimosAtivos}
                </p>
              </div>
              <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">
                  Valor Total
                </p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {stats.valorTotal.toLocaleString("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </div>
              <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filtros e Pesquisa */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Pesquisar equipamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Categoria */}
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todas as Categorias</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Filtro Estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os Estados</option>
              {estados.map((est) => (
                <option key={est.value} value={est.value}>
                  {est.label}
                </option>
              ))}
            </select>

            {/* Toggle View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Equipamentos */}
      {equipamentosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <Package className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Nenhum equipamento encontrado
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {searchTerm ||
            filterCategoria !== "todos" ||
            filterEstado !== "todos"
              ? "Tente ajustar os filtros de pesquisa"
              : "Comece por adicionar o primeiro equipamento"}
          </p>
          {(user?.role === "admin" || user?.role === "diretor") && (
            <button
              onClick={handleNovoEquipamento}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Adicionar Equipamento
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
              : "space-y-4"
          }
        >
          {equipamentosFiltrados.map((equipamento) => (
            <EquipamentoCard
              key={equipamento.id}
              equipamento={equipamento}
              emprestimo={emprestimos.find(
                (emp) => emp.equipamentoId === equipamento.id,
              )}
              viewMode={viewMode}
              onEditar={handleEditarEquipamento}
              onEmprestar={handleEmprestar}
              onDevolver={handleDevolucao}
              onManutencao={handleManutencao}
              onEliminar={handleEliminar}
              userRole={user?.role}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showEquipamentoModal && (
        <EquipamentoModal
          equipamento={selectedEquipamento}
          categorias={categorias}
          estados={estados}
          onClose={() => {
            setShowEquipamentoModal(false);
            setSelectedEquipamento(null);
          }}
          onSave={() => {
            carregarDados();
            setShowEquipamentoModal(false);
            setSelectedEquipamento(null);
          }}
        />
      )}

      {showEmprestimoModal && (
        <EmprestimoModal
          equipamento={selectedEquipamento}
          onClose={() => {
            setShowEmprestimoModal(false);
            setSelectedEquipamento(null);
          }}
          onSave={() => {
            carregarDados();
            setShowEmprestimoModal(false);
            setSelectedEquipamento(null);
          }}
        />
      )}

      {showManutencaoModal && (
        <ManutencaoModal
          equipamento={selectedEquipamento}
          onClose={() => {
            setShowManutencaoModal(false);
            setSelectedEquipamento(null);
          }}
          onSave={() => {
            carregarDados();
            setShowManutencaoModal(false);
            setSelectedEquipamento(null);
          }}
        />
      )}
    </div>
  );
};

export default Equipamentos;
