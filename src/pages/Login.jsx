// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDoc, doc, getDocs } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const [clube, setClube] = useState(null);
  const [carregandoClube, setCarregandoClube] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clubeParam = searchParams.get('clube'); // ex: ?clube=esmoriz

  useEffect(() => {
    if (!clubeParam) return;
    carregarClube(clubeParam);
  }, [clubeParam]);

  const carregarClube = async (slugOuId) => {
    setCarregandoClube(true);
    try {
      // 1º tenta como slug (doc root)
      let snap = await getDoc(doc(db, 'clubs', slugOuId));

      // 2º se não existir, procura por slug no campo
      if (!snap.exists()) {
        const q = query(
          collection(db, "clubs"),
          where("slug", "==", slugOuId)
        );
        const querySnap = await getDocs(q);
        if (!querySnap.empty) snap = querySnap.docs[0];
      }

      if (snap.exists()) {
        setClube({ id: snap.id, ...snap.data() });
        localStorage.setItem('ultimoClube', snap.id);
      }
    } catch (err) {
      console.error('Erro ao carregar clube:', err);
    } finally {
      setCarregandoClube(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      const msg =
        error.code === 'auth/user-not-found' ? 'Email não encontrado.' :
          error.code === 'auth/wrong-password' ? 'Password incorreta.' :
            error.code === 'auth/invalid-credential' ? 'Email ou password incorretos.' :
              error.code === 'auth/too-many-requests' ? 'Demasiadas tentativas. Tenta mais tarde.' :
                'Erro ao iniciar sessão. Tenta novamente.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  // Cores e branding dinâmicos — fallback genérico se não vier ?clube=
  const corPrimaria = clube?.branding?.corPrimaria || '#2563eb';
  const corDestaque = clube?.branding?.corDestaque || '#3b82f6';
  const nomePlataforma = clube?.nome || 'ClubSide';
  const logoUrl = clube?.branding?.logoUrl || null;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-all duration-500"
      style={{ background: `linear-gradient(135deg, ${corPrimaria}ee, ${corDestaque}cc)` }}
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">

        {/* Header com branding dinâmico */}
        <div className="text-center">
          {carregandoClube ? (
            <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 animate-pulse mb-4" />
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt={nomePlataforma}
              className="h-16 w-16 mx-auto rounded-full object-contain mb-4 shadow-lg"
            />
          ) : (
            <div
              className="h-16 w-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4 shadow-lg"
              style={{ backgroundColor: `${corPrimaria}22` }}
            >
              🏆
            </div>
          )}

          {carregandoClube ? (
            <span className="block h-8 w-48 mx-auto bg-gray-200 rounded-lg animate-pulse mb-1" />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{nomePlataforma}</h1>
          )}

          <p className="text-gray-500 text-sm">Iniciar sessão</p>

          {clube?.branding?.lema && (
            <p
              className="text-xs font-semibold uppercase tracking-widest mt-1"
              style={{ color: corPrimaria }}
            >
              {clube.branding.lema}
            </p>
          )}
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all"
              placeholder="o-teu@email.pt"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Palavra-passe *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all"
              placeholder="Mínimo 6 caracteres"
              required
              minLength="6"
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              ⚠️ {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:brightness-110"
            style={{ backgroundColor: corPrimaria }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                A entrar...
              </div>
            ) : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
          Não tens conta?{' '}
          <span className="font-medium" style={{ color: corPrimaria }}>
            Pede o link de convite ao teu administrador.
          </span>
        </p>
      </div>
    </div>
  );
}
