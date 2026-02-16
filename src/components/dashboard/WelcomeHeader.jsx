import { Calendar, TrendingUp } from 'lucide-react';
import { getHoraSaudacao } from '../../utils/DashboardUtils';

const WelcomeHeader = ({ user }) => {
  const saudacao = getHoraSaudacao();
  const dataHoje = new Date().toLocaleDateString('pt-PT', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 shadow-lg text-white mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {saudacao}, {user?.displayName || 'Utilizador'}! 👋
          </h1>
          <p className="text-blue-100 text-sm md:text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {dataHoje}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium">Época 25/26</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
