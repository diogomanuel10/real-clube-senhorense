import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import DashboardLayout from "../components/DashboardLayout";
import { Users, Shield, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ROLES = ["admin", "treinador", "fisio", "direcao", "atleta"];

export default function AdminUsers({ user }) {
  const navigate = useNavigate();
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formRole, setFormRole] = useState("");
  const [formEquipas, setFormEquipas] = useState([]); // passa a array
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
  setFormEquipas(u.equipas || []); // array vindo do Firestore
};

 const handleSave = async () => {
  if (!editingUser) return;
  setSaving(true);
  try {
    const ref = doc(db, "utilizadores", editingUser.id);
    await updateDoc(ref, {
      role: formRole || null,
      equipas: formEquipas, // já é array
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#f5c623]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Gestão de Utilizadores
              </h1>
              <p className="text-sm text-slate-500">
                Define perfis de acesso para treinadores, fisioterapeutas e
                staff.
              </p>
            </div>
          </div>
        </div>

        {/* Tabela / lista */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
            <Users className="w-4 h-4" />
            Utilizadores
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-slate-500">
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
              A carregar utilizadores...
            </div>
          ) : utilizadores.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              Ainda não existem utilizadores registados na coleção
              {" "}utilizadores.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {utilizadores.map((u) => (
                <div
                  key={u.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-xs font-semibold text-white">
                      {u.nome?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {u.nome || "Sem nome"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {u.email || "Sem email"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {u.role || "Sem role"}
                    </span>
                    {u.equipas && u.equipas.length > 0 && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-xs text-emerald-800">
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
              ))}
            </div>
          )}
        </div>

        {/* Modal editar utilizador */}
        {editingUser && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingUser(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Editar Utilizador</p>
                  <p className="text-xs text-slate-300">
                    {editingUser.nome} · {editingUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-slate-300 hover:text-white hover:bg-slate-700 rounded-full p-1.5"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
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
                  <div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Equipas que pode gerir
  </label>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
    {escaloes.map((esc) => {
      const nomeEquipa = esc.nome || esc.id; // ajusta ao teu modelo
      const selecionado = formEquipas.includes(nomeEquipa);

      return (
        <label
          key={esc.id}
          className="flex items-center gap-2 text-xs text-slate-700"
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
          {nomeEquipa}
        </label>
      );
    })}
  </div>
</div>

                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-[#f5c623] hover:bg-[#e0b91f] text-[#0b1635] text-sm font-semibold disabled:opacity-60"
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
