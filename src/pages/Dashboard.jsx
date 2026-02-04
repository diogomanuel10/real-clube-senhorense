import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Users2, Calendar, BarChart3 } from 'lucide-react';

export default function Dashboard({ user }) {
  const navigate = useNavigate(); // ✅ Hook adicionado aqui!
  
  const [stats, setStats] = useState({
    totalAthletes: 156,
    activeTeams: 8,
    todayTrainings: 5,
    attendanceRate: 87
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Bem-vindo de volta, {user?.email?.split('@')[0] || 'Admin'}</p>
          </div>
          
          {/* ✅ Botão com navigate corrigido */}
          <button 
            onClick={() => navigate('/atletas')}
            className="btn-primary flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Gerir Atletas</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Atletas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAthletes}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 bg-blue-100 p-3 rounded-xl" />
            </div>
          </div>

          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Equipas Ativas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeTeams}</p>
              </div>
              <Users2 className="w-12 h-12 text-green-500 bg-green-100 p-3 rounded-xl" />
            </div>
          </div>

          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Treinos Hoje</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayTrainings}</p>
              </div>
              <Calendar className="w-12 h-12 text-orange-500 bg-orange-100 p-3 rounded-xl" />
            </div>
          </div>

          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Taxa Presença</p>
                <p className="text-3xl font-bold text-gray-900">{stats.attendanceRate}%</p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-500 bg-purple-100 p-3 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>Próximos Treinos</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">Sub-16 Feminino</span>
                  </div>
                  <p className="text-sm text-gray-600">18:00 - 19:30 | Pavilhão Principal</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">João Silva</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Confirmado</span>
              </div>
              
              <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-l-4 border-orange-500">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-gray-900">Sub-18 Masculino</span>
                  </div>
                  <p className="text-sm text-gray-600">19:30 - 21:00 | Pavilhão Principal</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">Maria Santos</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Pendente</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
            <div className="space-y-3">
              {/* ✅ Botões com navigate */}
              <button 
                onClick={() => navigate('/atletas')}
                className="w-full flex items-center space-x-3 p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all group"
              >
                <Users className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-left font-medium text-gray-900">Gerir Atletas</span>
              </button>
              
              <button 
                onClick={() => navigate('/calendario')}
                className="w-full flex items-center space-x-3 p-4 bg-green-50 border-2 border-dashed border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all group"
              >
                <Calendar className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-left font-medium text-gray-900">Calendário</span>
              </button>
              
              <button 
                onClick={() => navigate('/relatorios')}
                className="w-full flex items-center space-x-3 p-4 bg-purple-50 border-2 border-dashed border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all group"
              >
                <BarChart3 className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-left font-medium text-gray-900">Relatórios</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
