import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Database, 
  HardDrive, 
  TrendingUp, 
  AlertTriangle,
  ChevronLeft,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

export default function FirebaseMonitoring({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    atletas: 0,
    escaloes: 0,
    treinadores: 0,
    treinos: 0,
    presencas: 0,
    equipamentos: 0,
    quotas: 0,
    comunicados: 0,
  });
  const [lastUpdate, setLastUpdate] = useState(null);

  // Limites do plano Firebase Spark (grátis)
  const LIMITES = {
    leiturasDia: 50000,
    escritasDia: 20000,
    deletesDia: 20000,
    armazenamentoGB: 1,
    trafegoBandwidthGB: 10,
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const collections = [
        'atletas',
        'escaloes', 
        'treinadores',
        'treinos',
        'presencas',
        'equipamentos',
        'quotas',
        'comunicados'
      ];

      const counts = {};
      
      for (const collectionName of collections) {
        try {
          const coll = collection(db, collectionName);
          const snapshot = await getCountFromServer(coll);
          counts[collectionName] = snapshot.data().count;
        } catch (error) {
          console.error(`Erro ao contar ${collectionName}:`, error);
          counts[collectionName] = 0;
        }
      }

      setStats(counts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Estimativa de operações por dia (baseado em padrões típicos)
  const calcularEstimativas = () => {
    const totalDocumentos = Object.values(stats).reduce((a, b) => a + b, 0);
    const utilizadoresAtivos = 16; // 12 treinadores + 4 direção
    
    // Estimativas conservadoras
    const leiturasEstimadasDia = utilizadoresAtivos * 50; // 50 leituras por user/dia
    const escritasEstimadasDia = utilizadoresAtivos * 5;  // 5 escritas por user/dia
    const armazenamentoEstimadoMB = totalDocumentos * 0.001; // ~1KB por doc

    return {
      leiturasDia: leiturasEstimadasDia,
      escritasDia: escritasEstimadasDia,
      armazenamentoMB: armazenamentoEstimadoMB,
      armazenamentoGB: armazenamentoEstimadoMB / 1024,
    };
  };

  const estimativas = calcularEstimativas();

  // Calcular percentagens de uso
  const percentagens = {
    leituras: (estimativas.leiturasDia / LIMITES.leiturasDia) * 100,
    escritas: (estimativas.escritasDia / LIMITES.escritasDia) * 100,
    armazenamento: (estimativas.armazenamentoGB / LIMITES.armazenamentoGB) * 100,
  };

  // Determinar status (verde, amarelo, vermelho)
  const getStatus = (percentagem) => {
    if (percentagem < 50) return { color: 'green', icon: CheckCircle, text: 'Saudável' };
    if (percentagem < 80) return { color: 'yellow', icon: AlertTriangle, text: 'Atenção' };
    return { color: 'red', icon: XCircle, text: 'Crítico' };
  };

  const StatusBadge = ({ percentagem }) => {
    const status = getStatus(percentagem);
    const Icon = status.icon;
    
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors[status.color]}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.text}
      </div>
    );
  };

  const ProgressBar = ({ percentagem, color = 'blue' }) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
    };

    const barColor = percentagem < 50 ? 'green' : percentagem < 80 ? 'yellow' : 'red';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full ${colors[barColor]} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(percentagem, 100)}%` }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Monitorização Firebase
                </h1>
                <p className="text-sm text-gray-600">
                  Plano: <span className="font-semibold text-green-600">Spark (Grátis)</span>
                </p>
              </div>
            </div>

            <button
              onClick={loadStats}
              className="btn-primary text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Alerta de informação */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Sobre este dashboard
              </h3>
              <p className="text-sm text-blue-800">
                Esta página mostra uma <strong>estimativa</strong> do uso do Firebase. 
                Os valores reais são calculados pelo Google e podem variar. 
                Última atualização: {lastUpdate?.toLocaleTimeString('pt-PT')}
              </p>
            </div>
          </div>
        </div>

        {/* CARDS DE USO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Leituras por dia */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Leituras / dia</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estimativas.leiturasDia.toLocaleString()}
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            
            <ProgressBar percentagem={percentagens.leituras} />
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                Limite: {LIMITES.leiturasDia.toLocaleString()}
              </span>
              <StatusBadge percentagem={percentagens.leituras} />
            </div>

            <p className="text-xs text-gray-600 mt-3">
              {percentagens.leituras.toFixed(2)}% do limite diário
            </p>
          </div>

          {/* Escritas por dia */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Escritas / dia</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estimativas.escritasDia.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            
            <ProgressBar percentagem={percentagens.escritas} />
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                Limite: {LIMITES.escritasDia.toLocaleString()}
              </span>
              <StatusBadge percentagem={percentagens.escritas} />
            </div>

            <p className="text-xs text-gray-600 mt-3">
              {percentagens.escritas.toFixed(2)}% do limite diário
            </p>
          </div>

          {/* Armazenamento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Armazenamento</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estimativas.armazenamentoMB.toFixed(0)} MB
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-600" />
            </div>
            
            <ProgressBar percentagem={percentagens.armazenamento} />
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                Limite: {LIMITES.armazenamentoGB} GB
              </span>
              <StatusBadge percentagem={percentagens.armazenamento} />
            </div>

            <p className="text-xs text-gray-600 mt-3">
              {percentagens.armazenamento.toFixed(2)}% do limite total
            </p>
          </div>
        </div>

        {/* DOCUMENTOS POR COLEÇÃO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Documentos por Coleção
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(stats).map(([name, count]) => (
              <div 
                key={name}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {count}
                </p>
                <p className="text-xs text-gray-600 capitalize">
                  {name}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Total de documentos
              </span>
              <span className="text-xl font-bold text-gray-900">
                {Object.values(stats).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* PROJEÇÃO DE CUSTOS */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">
                Custo Mensal Estimado
              </h3>
              <p className="text-4xl font-bold text-green-600 mb-4">
                €0,00
              </p>
              <div className="space-y-2 text-sm text-green-800">
                <p>✅ Estás a usar <strong>{percentagens.leituras.toFixed(1)}%</strong> das leituras diárias gratuitas</p>
                <p>✅ Estás a usar <strong>{percentagens.escritas.toFixed(1)}%</strong> das escritas diárias gratuitas</p>
                <p>✅ Estás a usar <strong>{percentagens.armazenamento.toFixed(1)}%</strong> do armazenamento gratuito</p>
                <p className="pt-2 font-semibold">
                  🎉 Continuas no plano gratuito com muito espaço disponível!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* INFORMAÇÃO ADICIONAL */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            ℹ️ Como funciona o plano gratuito
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              • <strong>Leituras:</strong> Cada vez que carregas dados (ex: lista de atletas)
            </p>
            <p>
              • <strong>Escritas:</strong> Cada vez que guardas/atualizas dados (ex: adicionar atleta)
            </p>
            <p>
              • <strong>Armazenamento:</strong> Espaço ocupado pelos dados no Firebase
            </p>
            <p className="pt-3 text-blue-700 font-medium">
              💡 Os limites são <strong>diários</strong> e renovam à meia-noite (UTC)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
    