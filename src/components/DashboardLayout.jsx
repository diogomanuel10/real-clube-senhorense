// DashboardLayout.jsx
import { useState, useEffect } from "react";
import { Users, Users2, Calendar, BarChart3, UserCog, UserPlus, ClipboardCheck, LogOut, Menu, X, Shield, Megaphone, Dumbbell, Trophy } from "lucide-react";
import { FaMoneyBillWave } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { enableNotificationsForUser } from "../utils/notifications";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";
const navItems = [
  // 1. Visão geral
  { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/", roles: ["admin", "treinador", "coordenador", "fisio"] },

  // 2. Gestão de pessoas (núcleo principal)
  { id: "atletas", label: "Atletas", icon: Users, path: "/atletas", roles: ["admin", "treinador", "coordenador", "fisio"] },
  { id: "escaloes", label: "Escalões", icon: Users2, path: "/escaloes", roles: ["admin", "coordenador"] },
  { id: "captacoes", label: "Captações", icon: UserPlus, path: "/captacoes", roles: ["admin", "treinador", "coordenador"] },

  // 3. Atividades diárias (uso frequente)
  { id: "calendario", label: "Calendário", icon: Calendar, path: "/treinos", roles: ["admin", "treinador", "coordenador", "fisio"] },
  { id: "jogos", label: "Jogos", icon: Trophy, path: "/jogos", roles: ["admin", "treinador", "coordenador"] },
  { id: "presencas", label: "Presenças", icon: ClipboardCheck, path: "/presencas", roles: ["admin", "treinador", "coordenador"] },

  { id: "sebenta", label: "Sebenta Exercícios", icon: Dumbbell, path: "/exercicios", roles: ["treinador", "admin", "coordenador", "fisio"] },

  // 4. Comunicação
  { id: "comunicados", label: "Comunicados", icon: Megaphone, path: "/comunicados", roles: ["admin", "direcao", "coordenador"] },

  // 5. Gestão administrativa (menos frequente)
  { id: "equipamentos", label: "Equipamentos", icon: Users2, path: "/equipamentos", roles: ["admin", "coordenador"] },
  { id: "quotas", label: "Quotas", icon: FaMoneyBillWave, path: "/quotas", roles: ["admin", "coordenador"] },

  // 6. Administração (última opção)
  { id: "admin-users", label: "Utilizadores", icon: Shield, path: "/admin/utilizadores", roles: ["admin", "coordenador"] },
];


export default function DashboardLayout({ children, user }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Determinar role do user (adapta conforme a tua estrutura no Firebase)
  const userRole = user?.role || user?.customClaims?.role || "viewer";

  useEffect(() => {
    if (user?.uid) {
      // podes mostrar um botão "Ativar notificações" e chamar isto ao clicar
      enableNotificationsForUser(user.uid);
    }
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Filtrar items baseado no role do user
  const visibleNavItems = navItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0b1635] text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          group flex flex-col
          bg-[#0b1635] text-white
          w-64 lg:w-20 lg:hover:w-64
          transition-all duration-300
          shadow-xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo + lema */}
        <div className="flex items-center gap-3 mt-6 mb-8 px-4">
          <div className="h-10 w-10 rounded-full border border-[#f5c623] bg-white flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/logo.png"
              alt="Real Clube Senhorense"
              className="h-8 w-8 object-contain"
            />
          </div>

          {/* Lema – visível em mobile, hover em desktop */}
          <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#f5c623] whitespace-nowrap">
              vontade de vencer
            </p>
          </div>
        </div>

        {/* Navegação - só mostra items permitidos para o role */}
        <nav className="flex-1 space-y-1 px-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false); // Fecha sidebar em mobile
                }}
                className="
                  flex items-center gap-3
                  w-full px-3 py-2
                  rounded-xl
                  text-sm font-medium
                  text-slate-100
                  hover:bg-[#f5c623] hover:text-[#0b1635]
                  transition-colors
                "
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User info e role - só sidebar aberto */}
        <div className="px-4 py-3 border-t border-white/10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-slate-300 truncate">{user?.email}</p>
          <p className="text-[10px] text-[#f5c623] uppercase">{userRole}</p>
        </div>

        {/* Rodapé */}
        <div className="mb-4 text-[10px] text-slate-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity px-4">
          © 2026 Real Clube Senhorense
        </div>
      </aside>

      {/* CONTEÚDO + HEADER */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <header className="h-16 bg-[#0b1635] text-white flex items-center justify-between px-4 md:px-8 shadow-md">
          <div className="ml-12 lg:ml-0">
            <h1 className="text-sm md:text-lg font-semibold tracking-wide">
              Real Clube Senhorense
            </h1>
            <p className="text-[10px] md:text-xs text-slate-300">
              Vontade de vencer · Época 25/26
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Badge do role - só desktop */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs">
              <Shield className="w-3 h-3" />
              <span className="capitalize">{userRole}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs hover:bg-red-500 hover:border-red-400 hover:text-white transition-colors"
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
