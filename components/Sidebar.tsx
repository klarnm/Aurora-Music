'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaBook, FaPlus, FaHeart, FaMagic } from 'react-icons/fa';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: FaHome, label: 'Inicio', href: '/' },
    { icon: FaSearch, label: 'Buscar', href: '/search' },
    { icon: FaBook, label: 'Tu Biblioteca', href: '/library' },
  ];

  const libraryItems = [
    { icon: FaPlus, label: 'Crear playlist', href: '/create-playlist' },
    { icon: FaMagic, label: 'Crear con IA', href: '/ai-playlist' },
    { icon: FaHeart, label: 'Canciones que te gustan', href: '/liked' },
  ];

  return (
    <div className="w-24 bg-black/95 flex flex-col h-full border-r border-white/5 backdrop-blur-xl relative overflow-hidden items-center py-8">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-0 w-full h-40 bg-linear-to-b from-aurora-pink/10 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-40 bg-linear-to-t from-aurora-purple-deep/10 to-transparent pointer-events-none"></div>
      
      {/* Logo */}
      <Link href="/" className="mb-8 relative z-10 hover:scale-110 transition-transform duration-300 cursor-pointer group">
        <div className="w-16 h-16 relative rounded-2xl overflow-hidden bg-linear-to-br from-aurora-pink/10 to-purple-600/10 backdrop-blur-sm border border-white/10 group-hover:border-aurora-pink/50 transition-all">
          <Image
            src="/logo.png"
            alt="Aurora Music Logo"
            fill
            className="object-contain p-2 drop-shadow-[0_0_20px_rgba(255,78,136,0.8)] group-hover:drop-shadow-[0_0_30px_rgba(255,78,136,1)]"
            priority
          />
        </div>
      </Link>

      {/* Main Navigation - Circular Icons */}
      <nav className="flex-1 relative z-10 flex flex-col items-center gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all group relative ${
                isActive
                  ? 'bg-linear-to-br from-aurora-pink to-aurora-purple text-white shadow-2xl shadow-aurora-pink/50 scale-110'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-105 border border-white/10'
              }`}
              title={item.label}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-aurora-pink/20 animate-ping"></div>
              )}
              <Icon size={22} className={`transition-all relative z-10 ${
                isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'group-hover:scale-110'
              }`} />
            </Link>
          );
        })}

        <div className="w-12 h-px bg-linear-to-r from-transparent via-gray-700 to-transparent my-2" />

        {libraryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-aurora-pink transition-all hover:scale-105 border border-white/10 group"
              title={item.label}
            >
              <Icon size={18} className="group-hover:scale-110 transition-transform" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
