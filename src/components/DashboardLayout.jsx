// DashboardLayout.jsx
import { Users, Users2, Calendar, BarChart3, UserCog, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/" },
  { id: "atletas", label: "Atletas", icon: Users, path: "/atletas" },
  { id: "escaloes", label: "Escalões", icon: Users2, path: "/escaloes" },
  { id: "calendario", label: "Calendário", icon: Calendar, path: "/treinos" },
  { id: "captacoes", label: "Captações", icon: UserPlus, path: "/captacoes" },
  { id: "treinadores", label: "Treinadores", icon: UserCog, path: "/treinadores" },
];

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      {/* SIDEBAR */}
      <aside
        className="
          group flex flex-col
          bg-[#0b1635] text-white
          w-20 hover:w-64
          transition-[width] duration-300
          shadow-xl
        "
      >
        {/* Logo + lema */}
        <div className="flex items-center gap-3 mt-6 mb-8 px-4">
          {/* LOGO – SEM group-hover (fica sempre visível) */}
          <div className="h-10 w-10 rounded-full border border-[#f5c623] bg-white flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/logo.png"
              alt="Real Clube Senhorense"
              className="h-8 w-8 object-contain"
            />
          </div>

          {/* Lema – só aparece quando o sidebar está aberto */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#f5c623] whitespace-nowrap">
              vontade de vencer
            </p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
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
                {/* ÍCONE – SEM group-hover, sempre visível */}
                <Icon className="h-5 w-5 flex-shrink-0" />

                {/* TEXTO – aparece só quando hover no sidebar */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Rodapé – só com sidebar aberto */}
        <div className="mb-4 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity px-4">
          © 2026 Real Clube Senhorense
        </div>
      </aside>

      {/* CONTEÚDO + HEADER */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-[#0b1635] text-white flex items-center justify-between px-8 shadow-md">
          <div>
            <h1 className="text-lg font-semibold tracking-wide">
              Real Clube Senhorense
            </h1>
            <p className="text-xs text-slate-300">
              Vontade de vencer · Época 25/26
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#f5c623]">
                vontade de vencer
              </span>
            </div>
            <div className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs">
              RCS
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
