'use client';

import { signOut, useSession } from 'next-auth/react';
import { FaBell, FaUser, FaChevronDown } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="h-16 bg-linear-to-r from-aurora-bg-primary/90 via-black/80 to-aurora-bg-primary/90 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40 border-b border-white/10 shadow-lg shadow-black/20">
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-aurora-mint/30 to-transparent"></div>
      
      {/* Navigation Arrows */}
      <div className="flex gap-2 relative z-10">
        <button className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-aurora-purple-deep/60 transition-all hover:scale-110 border border-white/10 hover:border-aurora-pink/30 hover:shadow-lg hover:shadow-aurora-pink/20">
          <span className="text-white">←</span>
        </button>
        <button className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-aurora-purple-deep/60 transition-all hover:scale-110 border border-white/10 hover:border-aurora-pink/30 hover:shadow-lg hover:shadow-aurora-pink/20">
          <span className="text-white">→</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8 relative z-10">
        <div className="relative group">
          <input
            type="text"
            placeholder="¿Qué quieres reproducir?"
            onFocus={() => window.location.href = '/search'}
            className="w-full h-10 px-12 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-aurora-pink/50 cursor-pointer hover:scale-105 transition-transform shadow-md hover:shadow-lg"
            readOnly
          />
          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-black group-hover:scale-110 transition-transform" size={16} />
        </div>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-4 relative z-10">
        <button className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-aurora-purple-deep/60 transition-all hover:scale-110 border border-white/10 hover:border-aurora-pink/30">
          <FaBell className="text-white" size={16} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 bg-black/60 hover:bg-aurora-purple-deep/60 rounded-full px-2 py-1 transition-all hover:scale-105 border border-white/10 hover:border-aurora-pink/30"
          >
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-aurora-pink to-aurora-purple flex items-center justify-center">
              <FaUser className="text-white" size={14} />
            </div>
            <span className="text-white font-semibold text-sm pr-2">
              {session?.user?.name || 'Usuario'}
            </span>
            <FaChevronDown className="text-white" size={12} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 w-48 bg-black/90 backdrop-blur-xl rounded-md shadow-2xl shadow-black/50 py-2 border border-white/10">
              <button
                onClick={() => {
                  router.push('/profile');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-white hover:bg-aurora-purple-deep/60 text-sm transition-colors hover:text-aurora-pink"
              >
                Perfil
              </button>
              <button
                onClick={() => {
                  router.push('/settings');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-white hover:bg-aurora-purple-deep/60 text-sm transition-colors hover:text-aurora-pink"
              >
                Configuración
              </button>
              <hr className="border-white/10 my-2" />
              <button
                onClick={() => signOut()}
                className="w-full text-left px-4 py-2 text-white hover:bg-aurora-purple-deep/60 text-sm transition-colors hover:text-aurora-pink"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
