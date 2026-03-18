import { useState } from "react";
import { Users, Users2, Calendar, BarChart3, UserCog, UserPlus, ClipboardCheck, LogOut, Menu, X, Shield, Megaphone, Dumbbell, Trophy } from "lucide-react";
import { FaMoneyBillWave } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";
import { useClub } from "../contexts/ClubContext";

const navItems = [
  { id: "dashboard",   label: "Dashboard",         icon: BarChart3,      path: "/",                    roles: ["admin", "treinador", "coordenador", "fisio"] },
  { id: "superadmin",  label: "Gestão de Clubes",  icon: Users,          path: "/superadmin",          roles: ["superadmin"] },
  { id: "atletas",     label: "Atletas",            icon: Users,          path: "/atletas",             roles: ["admin", "treinador", "coordenador", "fisio"] },
  { id: "escaloes",    label: "Escalões",           icon: Users2,         path: "/escaloes",            roles: ["admin", "coordenador"] },
  { id: "captacoes",   label: "Captações",          icon: UserPlus,       path: "/captacoes",           roles: ["admin", "treinador", "coordenador"] },
  { id: "calendario",  label: "Calendário",         icon: Calendar,       path: "/treinos",             roles: ["admin", "treinador", "coordenador", "fisio"] },
  { id: "jogos",       label: "Jogos",              icon: Trophy,         path: "/jogos",               roles: ["admin", "treinador", "coordenador"] },
  { id: "presencas",   label: "Presenças",          icon: ClipboardCheck, path: "/presencas",           roles: ["admin", "treinador", "coordenador"] },
  { id: "avaliacoes",  label: "Avaliações",         icon: BarChart3,      path: "/avaliacoes",          roles: ["treinador", "admin", "coordenador"] },
  { id: "sebenta",     label: "Sebenta Exercícios", icon: Dumbbell,       path: "/exercicios",          roles: ["treinador", "admin", "coordenador", "fisio"] },
  { id: "comunicados", label: "Comunicados",        icon: Megaphone,      path: "/comunicados",         roles: ["admin", "direcao", "coordenador"] },
  { id: "equipamentos",label: "Equipamentos",       icon: Users2,         path: "/equipamentos",        roles: ["admin", "coordenador"] },
  { id: "quotas",      label: "Quotas",             icon: FaMoneyBillWave,path: "/quotas",              roles: ["admin", "coordenador"] },
  { id: "admin-users", label: "Utilizadores",       icon: Shield,         path: "/admin/utilizadores",  roles: ["admin", "coordenador"] },
];

export default function DashboardLayout({ children, user }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Usa o ClubContext em vez de fetch próprio ───────────────────────────
  const { clubConfig } = useClub();

  const corPrimaria = clubConfig?.corPrimaria || '#0b1635';
  const corDestaque  = clubConfig?.corDestaque  || '#f5c623';
  const nomeClube    = clubConfig?.nomeClube    || clubConfig?.nome || 'ClubSide';
  const logoUrl      = clubConfig?.logoUrl      || '/logo.png';
  const lema         = clubConfig?.lema         || '';
  const epoca        = clubConfig?.epoca        || '25/26';

  const userRole = user?.role || 'viewer';
  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-white rounded-lg shadow-lg"
        style={{ backgroundColor: corPrimaria }}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          group flex flex-col
          text-white
          w-64 lg:w-20 lg:hover:w-64
          transition-all duration-300
          shadow-xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ backgroundColor: corPrimaria }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mt-6 mb-8 px-4">
          <div
            className="h-10 w-10 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0"
            style={{ borderColor: corDestaque, borderWidth: 1 }}
          >
            <img src={logoUrl} alt={nomeClube} className="h-8 w-8 object-contain" />
          </div>
          <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-sm font-bold whitespace-nowrap">{nomeClube}</p>
            {lema && (
              <p className="text-[10px] tracking-[0.2em] uppercase whitespace-nowrap" style={{ color: corDestaque }}>
                {lema}
              </p>
            )}
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 px-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                style={
                  isActive
                    ? { backgroundColor: corDestaque, color: corPrimaria }
                    : { color: 'rgba(255,255,255,0.85)' }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = corDestaque + '33';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  }
                }}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-3 border-t border-white/10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-white/60 truncate">{user?.email}</p>
          <p className="text-[10px] uppercase font-semibold" style={{ color: corDestaque }}>{userRole}</p>
        </div>

        {/* Rodapé */}
        <div className="mb-4 text-[10px] text-white/40 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity px-4">
          © {new Date().getFullYear()} {nomeClube}
        </div>
      </aside>

      {/* ── CONTEÚDO + HEADER ── */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <header
          className="h-16 text-white flex items-center justify-between px-4 md:px-8 shadow-md"
          style={{ backgroundColor: corPrimaria }}
        >
          <div className="ml-12 lg:ml-0">
            <h1 className="text-sm md:text-lg font-semibold tracking-wide">{nomeClube}</h1>
            {(lema || epoca) && (
              <p className="text-[10px] md:text-xs text-white/60">
                {lema}{lema && epoca ? ' · ' : ''}{epoca ? `Época ${epoca}` : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs">
              <Shield className="w-3 h-3" />
              <span className="capitalize">{userRole}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs hover:bg-red-500 hover:border-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
