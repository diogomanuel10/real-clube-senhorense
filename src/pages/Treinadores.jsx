import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { UserCog, Plus, Pencil, Trash2, X } from "lucide-react";

export default function Treinadores() {
  const [treinadores, setTreinadores] = useState([]);
  const [escaloes, setEscaloes] = useState([]); // ✅ NOVO
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [treinadorSelecionado, setTreinadorSelecionado] = useState(null);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    escalaoId: "", // ✅ ID do escalão
    escalaoNome: "", // ✅ Nome do escalão (guardamos para facilitar exibição)
    ativo: true,
  });

  // Carregar treinadores e escalões
  useEffect(() => {
    carregarTreinadores();
    carregarEscaloes();
  }, []);

  const carregarTreinadores = async () => {
    try {
      const snap = await getDocs(collection(db, "treinadores"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTreinadores(lista);
    } catch (err) {
      console.error("Erro ao carregar treinadores:", err);
    }
  };

  const carregarEscaloes = async () => {
    try {
      const snap = await getDocs(collection(db, "escaloes"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEscaloes(lista);
    } catch (err) {
      console.error("Erro ao carregar escalões:", err);
    }
  };

  // Abrir modal para adicionar
  const abrirModalAdicionar = () => {
    setForm({
      nome: "",
      email: "",
      telefone: "",
      escalaoId: "",
      escalaoNome: "",
      ativo: true,
    });
    setModoEdicao(false);
    setTreinadorSelecionado(null);
    setShowModal(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (treinador) => {
    setForm({
      nome: treinador.nome || "",
      email: treinador.email || "",
      telefone: treinador.telefone || "",
      escalaoId: treinador.escalaoId || "",
      escalaoNome: treinador.escalaoNome || "",
      ativo: treinador.ativo !== false,
    });
    setModoEdicao(true);
    setTreinadorSelecionado(treinador);
    setShowModal(true);
  };

  // Handle mudança de escalão
  const handleEscalaoChange = (e) => {
    const escalaoId = e.target.value;
    const escalaoObj = escaloes.find((esc) => esc.id === escalaoId);
    setForm({
      ...form,
      escalaoId: escalaoId,
      escalaoNome: escalaoObj?.nome || "",
    });
  };

  // Guardar (adicionar ou editar)
  const guardarTreinador = async (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      alert("O nome é obrigatório");
      return;
    }

    try {
      if (modoEdicao && treinadorSelecionado) {
        await updateDoc(doc(db, "treinadores", treinadorSelecionado.id), form);
      } else {
        await addDoc(collection(db, "treinadores"), form);
      }

      setShowModal(false);
      carregarTreinadores();
    } catch (err) {
      console.error("Erro ao guardar treinador:", err);
    }
  };

  // Apagar
  const apagarTreinador = async (id) => {
    if (!confirm("Tens a certeza que queres apagar este treinador?")) return;

    try {
      await deleteDoc(doc(db, "treinadores", id));
      carregarTreinadores();
    } catch (err) {
      console.error("Erro ao apagar treinador:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Treinadores</h1>
          <p className="text-sm text-slate-600 mt-1">
            Gerir equipa técnica do clube
          </p>
        </div>
        <button
          onClick={abrirModalAdicionar}
          className="flex items-center gap-2 px-4 py-2 bg-[#0b1635] text-white rounded-xl font-medium hover:bg-[#152452] transition"
        >
          <Plus className="w-4 h-4" />
          Adicionar Treinador
        </button>
      </div>

      {/* Lista de treinadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treinadores.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UserCog className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum treinador registado</p>
          </div>
        ) : (
          treinadores.map((treinador) => (
            <div
              key={treinador.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition"
            >
              {/* Avatar e status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#0b1635] flex items-center justify-center text-white font-semibold">
                    {treinador.nome?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {treinador.nome}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        treinador.ativo
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {treinador.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                {treinador.escalaoNome && (
                  <p className="text-sm font-medium text-[#0b1635] bg-[#f5c623]/20 px-2 py-1 rounded">
                    🏆 {treinador.escalaoNome}
                  </p>
                )}
                {treinador.email && (
                  <p className="text-sm text-slate-600">
                    📧 {treinador.email}
                  </p>
                )}
                {treinador.telefone && (
                  <p className="text-sm text-slate-600">
                    📱 {treinador.telefone}
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => abrirModalEditar(treinador)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => apagarTreinador(treinador.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Adicionar/Editar */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {modoEdicao ? "Editar Treinador" : "Novo Treinador"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={guardarTreinador} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                  required
                />
              </div>

              {/* ✅ DROPDOWN DE ESCALÃO */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Escalão / Equipa
                </label>
                <select
                  value={form.escalaoId}
                  onChange={handleEscalaoChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                >
                  <option value="">Sem escalão atribuído</option>
                  {escaloes.map((esc) => (
                    <option key={esc.id} value={esc.id}>
                      {esc.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={form.ativo}
                  onChange={(e) =>
                    setForm({ ...form, ativo: e.target.checked })
                  }
                  className="w-4 h-4 text-[#0b1635] rounded"
                />
                <label htmlFor="ativo" className="text-sm text-slate-700">
                  Treinador ativo
                </label>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0b1635] text-white rounded-lg font-medium hover:bg-[#152452] transition"
                >
                  {modoEdicao ? "Guardar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
