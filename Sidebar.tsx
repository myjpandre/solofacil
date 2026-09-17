'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { href: '/', label: 'Início', icon: '🏠' },
  { href: '/diagnosticos', label: 'Meus Diagnósticos', icon: '📋' },
  { href: '/diagnostico/novo', label: 'Nova Análise', icon: '➕' },
  { href: '/propriedades', label: 'Propriedades', icon: '🏡' },
  { href: '/perfil', label: 'Perfil', icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0f3d2e] text-white flex flex-col z-40">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center text-2xl">
            🌱
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">SoloFácil</h1>
            <p className="text-xs text-green-200/80">Análise de solo e manejo inteligente</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/30'
                  : 'text-green-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-green-100/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <span className="text-lg">🚪</span>
          Sair
        </button>
      </div>

      <div className="px-5 py-5 border-t border-white/10">
        <div className="bg-green-900/40 rounded-xl p-4 text-center">
          <p className="text-xs text-green-100 leading-relaxed">
            Juntos por uma agricultura mais produtiva e sustentável.
          </p>
          <div className="mt-3 text-[10px] text-green-300/70">SoloFácil v1.0.0</div>
        </div>
      </div>
    </aside>
  );
}
