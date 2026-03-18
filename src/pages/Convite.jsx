import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { db } from "../utils/firebase";
import { Shield, Check, AlertCircle, Mail, Eye, EyeOff } from "lucide-react";

export default function Convite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const token = searchParams.get("token");
  const clubeId = searchParams.get("clube");

  const [estado, setEstado] = useState("validando"); // validando | valido | invalido | sucesso
  const [convite, setConvite] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // Formulário email
  const [modo, setModo] = useState("google"); // google | email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [isNovoUser, setIsNovoUser] = useState(true); // registar ou entrar

  // 1. Validar token
  useEffect(() => {
    const validar = async () => {
      if (!token || !clubeId) {
        setEstado("invalido");
        setErro("Link inválido ou incompleto.");
        return;
      }

      try {
        const ref = doc(db, `clubs/${clubeId}/convites`, token);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setEstado("invalido");
          setErro("Este convite não existe.");
          return;
        }

        const data = snap.data();

        if (data.usado) {
          setEstado("invalido");
          setErro("Este convite já foi utilizado.");
          return;
        }

        if (new Date(data.expiraEm) < new Date()) {
          setEstado("invalido");
          setErro("Este convite expirou.");
          return;
        }

        setConvite(data);
        setEstado("valido");
      } catch (err) {
        console.error(err);
        setEstado("invalido");
        setErro("Erro ao validar o convite.");
      }
    };

    validar();
  }, [token, clubeId]);

  // 2. Associar utilizador ao clube após autenticação
  const associarUtilizador = async (userAuth) => {
    const uid = userAuth.uid;
    const nomeFinal = nome || userAuth.displayName || "Sem nome";
    const emailFinal = userAuth.email;

    const userData = {
      uid,
      nome: nomeFinal,
      email: emailFinal,
      role: convite.role,
      clubeId,
      equipas: [],
      criadoEm: new Date().toISOString(),
    };

    // Índice global
    await setDoc(doc(db, "utilizadores", uid), userData, { merge: true });

    // Subcoleção do clube
    await setDoc(doc(db, `clubs/${clubeId}/utilizadores`, uid), userData, { merge: true });

    // Marcar convite como usado
    await updateDoc(doc(db, `clubs/${clubeId}/convites`, token), {
      usado: true,
      usadoPor: uid,
      usadoEm: new Date().toISOString(),
    });

    setEstado("sucesso");
    setTimeout(() => navigate("/"), 2500);
  };

  // Login com Google
  const entrarComGoogle = async () => {
    setLoading(true);
    setErro("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await associarUtilizador(result.user);
    } catch (err) {
      console.error(err);
      setErro("Erro ao entrar com Google.");
    } finally {
      setLoading(false);
    }
  };

  // Login/Registo com email
  const entrarComEmail = async () => {
    if (!email || !password) { setErro("Preenche todos os campos."); return; }
    if (isNovoUser && !nome) { setErro("Indica o teu nome."); return; }
    setLoading(true);
    setErro("");
    try {
      let result;
      if (isNovoUser) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      await associarUtilizador(result.user);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") setErro("Este email já está registado. Tenta entrar.");
      else if (err.code === "auth/wrong-password") setErro("Password incorreta.");
      else if (err.code === "auth/user-not-found") setErro("Utilizador não encontrado.");
      else if (err.code === "auth/weak-password") setErro("A password deve ter pelo menos 6 caracteres.");
      else setErro("Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──

  if (estado === "validando") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">A validar convite...</p>
        </div>
      </div>
    );
  }

  if (estado === "invalido") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">Convite inválido</h1>
          <p className="text-sm text-slate-500">{erro}</p>
        </div>
      </div>
    );
  }

  if (estado === "sucesso") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">Bem-vindo!</h1>
          <p className="text-sm text-slate-500">A redirecionar para a plataforma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 text-center" style={{ backgroundColor: '#0b1635' }}>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-[#f5c623]" />
          </div>
          <h1 className="text-white font-bold text-base">Foste convidado!</h1>
          <p className="text-slate-300 text-xs mt-1">
            Perfil: <span className="text-[#f5c623] font-semibold capitalize">{convite?.role}</span>
          </p>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 text-center">
            Cria uma conta ou entra para aceitar o convite.
          </p>

          {/* Tabs Google / Email */}
          <div className="flex rounded-xl border border-slate-200 p-1 gap-1">
            <button
              onClick={() => setModo("google")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${modo === "google" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Google
            </button>
            <button
              onClick={() => setModo("email")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${modo === "email" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Email
            </button>
          </div>

          {/* Google */}
          {modo === "google" && (
            <button
              onClick={entrarComGoogle}
              disabled={loading}
              className="w-full py-3 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? "A entrar..." : "Continuar com Google"}
            </button>
          )}

          {/* Email */}
          {modo === "email" && (
            <div className="space-y-3">
              {/* Toggle registar/entrar */}
              <div className="flex rounded-lg border border-slate-200 p-0.5 gap-0.5">
                <button onClick={() => setIsNovoUser(true)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${isNovoUser ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
                  Criar conta
                </button>
                <button onClick={() => setIsNovoUser(false)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${!isNovoUser ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
                  Já tenho conta
                </button>
              </div>

              {isNovoUser && (
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              />

              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent pr-10"
                />
                <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={entrarComEmail}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                style={{ backgroundColor: '#f5c623', color: '#0b1635' }}
              >
                <Mail className="w-4 h-4" />
                {loading ? "A processar..." : (isNovoUser ? "Criar conta e aceitar" : "Entrar e aceitar")}
              </button>
            </div>
          )}

          {/* Erro */}
          {erro && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{erro}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
