import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import DashboardLayout from "../components/DashboardLayout";
import { Users, Shield, Edit3, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ROLES = ["admin", "treinador", "fisio", "direcao", "atleta", "preparador"];

export default function AdminUsers({ user }) {
  const navigate = useNavigate();
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formRole, setFormRole] = useState("");
  const [formEquipas, setFormEquipas] = useState([]);
  const [saving, setSaving] = useState(false);
  const [escaloes, setEscaloes] = useState([]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "utilizadores"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUtilizadores(lista);
    } catch (err) {
      console.error("Erro ao carregar utilizadores:", err);
      alert("Erro ao carregar utilizadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    const loadEscaloes = async () => {
      try {
        const snap = await getDocs(collection(db, "escaloes"));
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEscaloes(lista);
      } catch (err) {
        console.error("Erro ao carregar escalões:", err);
      }
    };
    loadEscaloes();
  }, []);

  const openEdit = (u) => {
    setEditingUser(u);
    setFormRole(u.role || "");
    setFormEquipas(u.equipas || []);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const ref = doc(db, "utilizadores", editingUser.id);
      await updateDoc(ref, {
        role: formRole || null,
        equipas: formEquipas,
      });
      setEditingUser(null);
      setFormRole("");
      setFormEquipas([]);
      await loadUsers();
    } catch (err) {
      console.error("Erro ao guardar utilizador:", err);
      alert("Erro ao guardar utilizador.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen bg-gray-50">
        {/* HEADER RESPONSIVO */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5c623]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    Gestão de Utilizadores
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {utilizadores.length} utilizador{utilizadores.length !== 1 ? 'es' : ''} registado{utilizadores.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* CARD DE UTILIZADORES */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
            {/* Header da tabela */}
            <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Utilizadores</span>
              <span className="sm:hidden">Users</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 sm:py-12 text-sm text-slate-500">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
                A carregar...
              </div>
            ) : utilizadores.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 sm:py-10 text-center text-sm text-slate-500">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-3" />
                <p className="font-medium text-slate-700 mb-1">Nenhum utilizador</p>
                <p className="text-xs sm:text-sm">Ainda não existem utilizadores registados.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {utilizadores.map((u) => (
                  <div
                    key={u.id}
                    className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 transition"
                  >
                    {/* LAYOUT MOBILE - Stack vertical */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                          {u.nome?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {u.nome || "Sem nome"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {u.email || "Sem email"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2 flex-1">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                            {u.role || "Sem role"}
                          </span>
                          {u.equipas && u.equipas.length > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-xs text-emerald-800">
                              {u.equipas.length} equipa{u.equipas.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 flex-shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar
                        </button>
                      </div>
                    </div>

                    {/* LAYOUT DESKTOP - Horizontal */}
                    <div className="hidden sm:flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                          {u.nome?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {u.nome || "Sem nome"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {u.email || "Sem email"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                          {u.role || "Sem role"}
                        </span>
                        {u.equipas && u.equipas.length > 0 && (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-xs text-emerald-800 whitespace-nowrap">
                            {u.equipas.join(", ")}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                        >
                          <Edit3 className="w-3 h-3" />
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* MODAL EDITAR - RESPONSIVO */}
        {editingUser && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
            onClick={() => setEditingUser(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do modal */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Editar Utilizador</p>
                  <p className="text-xs text-slate-300 truncate">
                    {editingUser.nome} · {editingUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-slate-300 hover:text-white hover:bg-slate-700 rounded-full p-1.5 ml-2 flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Conteúdo do modal - Scrollable */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Perfil / Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                  >
                    <option value="">Selecione um perfil</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Equipas que pode gerir
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                    {escaloes.length === 0 ? (
                      <p className="text-xs text-slate-400 col-span-2 text-center py-4">
                        Nenhum escalão disponível
                      </p>
                    ) : (
                      escaloes.map((esc) => {
                        const nomeEquipa = esc.nome || esc.id;
                        const selecionado = formEquipas.includes(nomeEquipa);

                        return (
                          <label
                            key={esc.id}
                            className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition"
                          >
                            <input
                              type="checkbox"
                              checked={selecionado}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormEquipas((prev) =>
                                    Array.from(new Set([...prev, nomeEquipa]))
                                  );
                                } else {
                                  setFormEquipas((prev) =>
                                    prev.filter((eq) => eq !== nomeEquipa)
                                  );
                                }
                              }}
                              className="rounded border-slate-300 text-[#0b1635] focus:ring-[#f5c623]"
                            />
                            <span className="truncate">{nomeEquipa}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Footer do modal */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#f5c623] hover:bg-[#e0b91f] text-[#0b1635] text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? "A guardar..." : "Guardar alterações"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
