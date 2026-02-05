import { Link, useLocation } from 'react-router-dom';
import { Users, Home, CalendarDays, Layers } from 'lucide-react';




export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar fixa */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center font-bold">
  <img src="/logo.png" alt="RCS" className="w-6 h-6" />
</div>
          <div className="ml-3">
            <p className="text-[11px] text-slate-400">Painel</p>
            <p className="text-sm font-semibold leading-tight">
              Real Clube<br />Senhorense
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            to="/"
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
              location.pathname === '/'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
          <Link
            to="/atletas"
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
              location.pathname.startsWith('/atletas')
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Atletas
          </Link>
          <Link
  to="/escaloes"
  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
    location.pathname.startsWith('/escaloes')
      ? 'bg-slate-800 text-white'
      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
  }`}
>
  <Layers className="w-4 h-4 mr-2" />
  Escalões
</Link>
         <Link
  to="/treinos"
  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
    location.pathname.startsWith('/treinos')
      ? 'bg-slate-800 text-white'
      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
  }`}
>
  <CalendarDays className="w-4 h-4 mr-2" />
  Treinos
</Link>
        </nav>

        <div className="px-4 py-4 text-[11px] text-slate-500">
          © {new Date().getFullYear()} Real Clube Senhorense
        </div>
      </aside>

      {/* Área de conteúdo */}
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
