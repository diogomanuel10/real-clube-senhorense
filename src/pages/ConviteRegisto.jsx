// src/pages/ConviteRegisto.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, authSecundaria } from "../utils/firebase";
import toast, { Toaster } from "react-hot-toast";


function ConviteRegisto() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token   = searchParams.get("token");
  const clubeId = searchParams.get("clube");

  const [convite, setConvite] = useState(null);
  const [clube, setClube] = useState(null);
  const [validando, setValidando] = useState(true);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ nome: "", email: "", password: "", confirmar: "" });

  useEffect(() => {
    if (!token || !clubeId) {
      setErro("Link inválido — falta o token ou o clube.");
      setValidando(false);
      return;
    }
    validarToken();
  }, [token, clubeId]);

  const validarToken = async () => {
    try {
      const conviteSnap = await getDoc(doc(db, `clubs/${clubeId}/convites`, token));
      if (!conviteSnap.exists()) { setErro("Convite não encontrado."); return; }

      const conviteData = conviteSnap.data();

      if (conviteData.usado) { setErro("Este convite já foi utilizado."); return; }

      if (new Date(conviteData.expiraEm) < new Date()) {
        setErro("Este convite expirou. Pede um novo link ao administrador.");
        return;
      }

      const clubeSnap = await getDoc(doc(db, "clubs", clubeId));
      if (!clubeSnap.exists()) { setErro("Clube não encontrado."); return; }

      setConvite(conviteData);
      setClube({ id: clubeSnap.id, ...clubeSnap.data() });

      if (conviteData.email) {
        setForm(prev => ({ ...prev, email: conviteData.email }));
      }

    } catch (err) {
      console.error(err);
      setErro("Erro ao validar o convite. Tenta novamente.");
    } finally {
      setValidando(false);
    }
  };

  const registar = async (e) => {
    e.preventDefault();
    const { nome, email, password, confirmar } = form;

    if (!nome.trim()) { toast.error("O nome é obrigatório!"); return; }
    if (password.length < 6) { toast.error("A password deve ter pelo menos 6 caracteres!"); return; }
    if (password !== confirmar) { toast.error("As passwords não coincidem!"); return; }
    if (convite.email && email.toLowerCase() !== convite.email) {
      toast.error("Este convite é para um email específico.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("A criar a tua conta...");

    try {
      const credencial = await createUserWithEmailAndPassword(
        authSecundaria, email.trim(), password
      );
      const uid = credencial.user.uid;
      await authSecundaria.signOut();

      await setDoc(doc(db, "utilizadores", uid), {
        uid,
        clubeId,
        role: convite.role,
        criadoEm: new Date().toISOString(),
      });

      await setDoc(doc(db, `clubs/${clubeId}/utilizadores`, uid), {
        uid,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        role: convite.role,
        equipas: convite.equipas || [],
        clubeId,
        ativo: true,
        criadoEm: new Date().toISOString(),
        conviteToken: token,
      });

      await updateDoc(doc(db, `clubs/${clubeId}/convites`, token), {
        usado: true,
        usadoPor: uid,
        usadoEm: new Date().toISOString(),
      });

      await updateDoc(doc(db, "clubs", clubeId), {
        utilizadoresCount: (clube.utilizadoresCount || 0) + 1,
      });

      toast.success("✅ Conta criada com sucesso! Podes fazer login.", { id: loadingToast, duration: 4000 });

      // ✅ ALTERAÇÃO 1 — redireciona com branding do clube
      setTimeout(() => navigate(`/login?clube=${clubeId}`), 2000);

    } catch (err) {
      console.error(err);
      const msg =
        err.code === "auth/email-already-in-use" ? "Este email já está registado!" :
        err.code === "auth/invalid-email"         ? "Email inválido!" :
        err.code === "auth/weak-password"         ? "Password demasiado fraca!" :
        err.message;
      toast.error(msg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (validando) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">⏳</div>
        <p className="text-gray-600 font-semibold">A validar o convite...</p>
      </div>
    </div>
  );

  if (erro) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-red-600 mb-3">Convite Inválido</h1>
        <p className="text-gray-600 mb-6">{erro}</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all"
        >
          Ir para o Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Toaster position="top-center" />

      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">

        <div className="text-center mb-8">
          {clube?.branding?.logoUrl ? (
            <img
              src={clube.branding.logoUrl}
              alt={clube.nome}
              className="h-16 w-16 mx-auto rounded-full object-contain mb-3 shadow-lg"
            />
          ) : (
            <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-3xl mb-3 shadow-lg">
              🏆
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{clube?.nome}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Foste convidado como <span className="font-semibold text-blue-600">
              {convite?.role === "admin"     ? "Administrador" :
               convite?.role === "direcao"   ? "Direção" :
               convite?.role === "treinador" ? "Treinador" :
               convite?.role === "fisio"     ? "Fisioterapeuta" :
               convite?.role === "atleta"    ? "Atleta" : convite?.role}
            </span>
          </p>
          {convite?.equipas?.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Equipas: {convite.equipas.join(", ")}
            </p>
          )}
        </div>

        <form onSubmit={registar} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nome completo *</label>
            <input
              required
              placeholder="Ex: João Silva"
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email *</label>
            <input
              required
              type="email"
              placeholder="Ex: joao@email.pt"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              disabled={!!convite?.email}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:text-gray-500"
            />
            {convite?.email && (
              <p className="text-xs text-gray-400 mt-1">📧 Email definido pelo administrador</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Password *</label>
            <input
              required
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Confirmar password *</label>
            <input
              required
              type="password"
              placeholder="Repete a password"
              value={form.confirmar}
              onChange={e => setForm({ ...form, confirmar: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl text-lg font-bold shadow-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
          >
            {loading ? "⏳ A criar conta..." : "🚀 Criar Conta"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Já tens conta?{" "}
          {/* ✅ ALTERAÇÃO 2 — botão também passa o clube */}
          <button onClick={() => navigate(`/login?clube=${clubeId}`)} className="text-blue-500 font-semibold hover:underline">
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
}

export default ConviteRegisto;
