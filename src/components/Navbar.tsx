'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Receipt, 
  BarChart3, 
  LogOut,
  Store
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide navbar on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pos', label: 'POS Terminal', icon: ShoppingCart },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/sales', label: 'Sales History', icon: Receipt },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                CDL Mini POS
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 border border-slate-700 rounded px-1.5 py-0.5">
                v1.0
              </span>
            </div>
          </div>

          <nav className="flex space-x-1 sm:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div>
            <button
              onClick={handleLogout}
              className="flex items-center text-slate-400 hover:text-red-400 hover:bg-slate-800 px-3 py-2 rounded-lg text-sm transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
