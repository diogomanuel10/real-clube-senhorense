import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../utils/firebase";
import DashboardLayout from "../components/DashboardLayout";
import { Users, Shield, Edit3, ChevronLeft, UserPlus, Copy, Check, Link, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClub } from '../contexts/ClubContext';

const ROLES = ["admin", "coordenador", "treinador", "fisio", "direcao", "atleta", "preparador"];

export default function AdminUsers({ user }) {
  const { clubId } = useClub();
  const navigate = useNavigate();
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formRole, setFormRole] = useState("");
  const [formEquipas, setFormEquipas] = useState([]);
  const [saving, setSaving] = useState(false);
  const [escaloes, setEscaloes] = useState([]);
  const [eliminando, setEliminando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  // Convite
  const [modalConvite, setModalConvite] = useState(false);
  const [conviteRole, setConviteRole] = useState("treinador");
  const [gerandoConvite, setGerandoConvite] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") navigate("/");
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const clubeId = user.clubeId || clubId;
      if (!clubeId) { setLoading(false); return; }
      const snap = await getDocs(collection(db, `clubs/${clubeId}/utilizadores`));
      setUtilizadores(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    const loadEscaloes = async () => {
      try {
        const clubeId = user.clubeId || clubId;
        const snap = await getDocs(collection(db, `clubs/${clubeId}/escaloes`));
        setEscaloes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
    setConfirmarEliminar(false); // reset confirmação
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const clubeId = user.clubeId || clubId;
      await updateDoc(doc(db, "utilizadores", editingUser.id), { role: formRole || null, equipas: formEquipas });
      await updateDoc(doc(db, `clubs/${clubeId}/utilizadores`, editingUser.id), { role: formRole || null, equipas: formEquipas });
      await loadUsers();
      setEditingUser(null);
      setFormRole("");
      setFormEquipas([]);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setSaving(false);
    }
  };

  const eliminarUser = async () => {
    if (!editingUser) return;
    setEliminando(true);
    try {
      const clubeId = user.clubeId || clubId;
      await deleteDoc(doc(db, `clubs/${clubeId}/utilizadores`, editingUser.id));
      await deleteDoc(doc(db, "utilizadores", editingUser.id));
      await loadUsers();
      setEditingUser(null);
      setConfirmarEliminar(false);
    } catch (err) {
      console.error("Erro ao eliminar:", err);
    } finally {
      setEliminando(false);
    }
  };

  const gerarConvite = async () => {
    if (!conviteRole) return;
    setGerandoConvite(true);
    try {
      const clubeId = user.clubeId || clubId;
      const token = crypto.randomUUID().replace(/-/g, '').substring(0, 24);
      const expiraEm = new Date();
      expiraEm.setDate(expiraEm.getDate() + 7);
      await setDoc(doc(db, `clubs/${clubeId}/convites`, token), {
        role: conviteRole,
        clubeId,
        usado: false,
        criadoPor: auth.currentUser?.uid || null,
        criadoEm: new Date().toISOString(),
        expiraEm: expiraEm.toISOString(),
      });
      setLinkGerado(`${window.location.origin}/convite?token=${token}&clube=${clubeId}`);
    } catch (err) {
      console.error("Erro ao gerar convite:", err);
    } finally {
      setGerandoConvite(false);
    }
  };

  const copiarLink = async () => {
    await navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const fecharModalConvite = () => {
    setModalConvite(false);
    setLinkGerado(null);
    setConviteRole("treinador");
    setCopiado(false);
  };

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen bg-gray-50">

        {/* HEADER */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={() => navigate("/")} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5c623]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">Gestão de Utilizadores</h1>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {utilizadores.length} utilizador{utilizadores.length !== 1 ? 'es' : ''} registado{utilizadores.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setModalConvite(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all"
              style={{ backgroundColor: '#0b1635' }}
            >
              <UserPlus className="w-4 h-4" />
              Gerar Convite
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
            <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
              <Users className="w-4 h-4" />
              <span>Utilizadores</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-slate-500">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
                A carregar...
              </div>
            ) : utilizadores.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="font-medium text-slate-700 mb-1">Nenhum utilizador</p>
                <p className="text-xs">Gera um convite para adicionar o primeiro utilizador.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {utilizadores.map((u) => (
                  <div key={u.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 transition">

                    {/* Mobile */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                          {u.nome?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{u.nome || "Sem nome"}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email || "Sem email"}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2 flex-1">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{u.role || "Sem role"}</span>
                          {u.equipas?.length > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-xs text-emerald-800">
                              {u.equipas.length} equipa{u.equipas.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <button onClick={() => openEdit(u)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 flex-shrink-0">
                          <Edit3 className="w-3.5 h-3.5" /> Editar
                        </button>
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                          {u.nome?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{u.nome || "Sem nome"}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email || "Sem email"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{u.role || "Sem role"}</span>
                        {u.equipas?.length > 0 && (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-xs text-emerald-800 whitespace-nowrap">
                            {u.equipas.join(", ")}
                          </span>
                        )}
                        <button onClick={() => openEdit(u)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100">
                          <Edit3 className="w-3 h-3" /> Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* MODAL CONVITE */}
        {modalConvite && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={fecharModalConvite}>
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between" style={{ backgroundColor: '#0b1635' }}>
                <div className="flex items-center gap-3 text-white">
                  <Link className="w-5 h-5 text-[#f5c623]" />
                  <div>
                    <p className="text-sm font-semibold">Gerar Link de Convite</p>
                    <p className="text-xs text-slate-300">Válido por 7 dias · uso único</p>
                  </div>
                </div>
                <button onClick={fecharModalConvite} className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10">✕</button>
              </div>

              <div className="p-6 space-y-5">
                {!linkGerado ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Qual o perfil do utilizador convidado?</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLES.map((r) => (
                          <button key={r} onClick={() => setConviteRole(r)}
                            className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all capitalize ${conviteRole === r ? 'border-[#0b1635] bg-[#0b1635] text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={gerarConvite} disabled={gerandoConvite || !conviteRole}
                      className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#f5c623', color: '#0b1635' }}>
                      {gerandoConvite
                        ? <><div className="w-4 h-4 border-2 border-[#0b1635] border-t-transparent rounded-full animate-spin" />A gerar...</>
                        : <><UserPlus className="w-4 h-4" />Gerar Link de Convite</>
                      }
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                        <Check className="w-7 h-7 text-green-600" />
                      </div>
                      <p className="font-bold text-slate-800 text-base">Convite gerado!</p>
                      <p className="text-xs text-slate-500 mt-1">Role: <span className="font-semibold capitalize">{conviteRole}</span> · expira em 7 dias</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1 font-medium">Link de convite:</p>
                      <p className="text-xs text-slate-700 break-all font-mono leading-relaxed">{linkGerado}</p>
                    </div>
                    <button onClick={copiarLink}
                      className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{ backgroundColor: copiado ? '#16a34a' : '#f5c623', color: copiado ? 'white' : '#0b1635' }}>
                      {copiado ? <><Check className="w-4 h-4" />Copiado!</> : <><Copy className="w-4 h-4" />Copiar Link</>}
                    </button>
                    <button onClick={() => { setLinkGerado(null); setConviteRole("treinador"); }}
                      className="w-full py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50">
                      Gerar outro convite
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDITAR */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50" onClick={() => setEditingUser(null)}>
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Editar Utilizador</p>
                  <p className="text-xs text-slate-300 truncate">{editingUser.nome} · {editingUser.email}</p>
                </div>
                <button onClick={() => setEditingUser(null)} className="text-slate-300 hover:text-white hover:bg-slate-700 rounded-full p-1.5 ml-2 flex-shrink-0">✕</button>
              </div>

              {/* Corpo scrollável */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">

                {/* 1. Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Perfil / Role</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent">
                    <option value="">Selecione um perfil</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* 2. Equipas */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Equipas que pode gerir</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                    {escaloes.length === 0 ? (
                      <p className="text-xs text-slate-400 col-span-2 text-center py-4">Nenhum escalão disponível</p>
                    ) : (
                      escaloes.map((esc) => {
                        const nomeEquipa = esc.nome || esc.id;
                        const selecionado = formEquipas.includes(nomeEquipa);
                        return (
                          <label key={esc.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition">
                            <input type="checkbox" checked={selecionado}
                              onChange={(e) => {
                                if (e.target.checked) setFormEquipas((prev) => Array.from(new Set([...prev, nomeEquipa])));
                                else setFormEquipas((prev) => prev.filter((eq) => eq !== nomeEquipa));
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

                {/* 3. Eliminar */}
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Eliminar utilizador</p>
                      <p className="text-xs text-red-600 mt-0.5">
                        Remove o acesso à plataforma. A conta de email é mantida no sistema.
                      </p>
                    </div>
                  </div>

                  {!confirmarEliminar ? (
                    <button
                      onClick={() => setConfirmarEliminar(true)}
                      className="mt-3 w-full py-2 rounded-lg text-xs font-semibold border border-red-300 text-red-700 hover:bg-red-100 transition-all"
                    >
                      Eliminar utilizador
                    </button>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-slate-700 text-center">
                        Tens a certeza? Esta ação não pode ser revertida.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmarEliminar(false)}
                          className="flex-1 py-2 rounded-lg text-xs font-medium border border-slate-300 text-slate-600 hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={eliminarUser}
                          disabled={eliminando}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all"
                        >
                          {eliminando ? 'A eliminar...' : 'Sim, eliminar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 flex-shrink-0">
                <button onClick={() => setEditingUser(null)} className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100">
                  Cancelar
                </button>
                <button disabled={saving} onClick={handleSave}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
                  style={{ backgroundColor: '#f5c623', color: '#0b1635' }}>
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
