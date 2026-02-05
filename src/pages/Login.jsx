import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [telemovel, setTelemovel] = useState('');
  const [perfil, setPerfil] = useState('atleta');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const perfis = [
    { value: 'pai', label: 'Pai/Encarregado' },
    { value: 'treinador', label: 'Treinador' },
    { value: 'atleta', label: 'Atleta' },
    { value: 'diretor', label: 'Diretor' },
    { value: 'coordenador', label: 'Coordenador' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await addDoc(collection(db, 'utilizadores'), {
          uid: userCredential.user.uid,
          email: email,
          nome: nome,
          idade: idade || null,
          telemovel: telemovel || null,
          perfil: perfil,
          dataCriacao: new Date().toISOString(),
          ativo: true
        });
        
        alert(`Conta criada! Perfil: ${perfis.find(p => p.value === perfil).label}`);
      }
      navigate('/');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 p-4">
      {/* ✅ ALTERAÇÃO 1: max-h-[90vh] overflow-y-auto */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real Clube Senhorense</h1>
          <p className="text-gray-600">{isLogin ? 'Iniciar sessão' : 'Registo'}</p>
        </div>

        {/* ✅ ALTERAÇÃO 2: space-y-4 (reduzido de 6) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: João Silva"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
                  <input
                    type="number"
                    value={idade}
                    onChange={(e) => setIdade(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="25"
                    min="1"
                    max="99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telemóvel</label>
                  <input
                    type="tel"
                    value={telemovel}
                    onChange={(e) => setTelemovel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="916 123 456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Perfil *</label>
                <select
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {perfis.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="joao@senhorense.pt"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Palavra-passe *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
          >
            {loading ? (
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="mt-1">A processar...</span>
              </div>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        {/* ✅ ALTERAÇÃO 3: space-y-3 pt-4 (reduzido) */}
        <div className="text-center space-y-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-xl font-medium transition-all"
          >
            {isLogin ? 'Criar nova conta' : 'Já tenho conta'}
          </button>
          
          <div className="text-xs text-gray-500 space-y-1">
            
            {!isLogin && (
              <p className="text-blue-600 font-medium">Todos os campos * são obrigatórios</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
