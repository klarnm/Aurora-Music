'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError('Credenciales inválidas');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 aurora-gradient-radial opacity-30" />
      <div className="absolute inset-0 bg-aurora-bg-primary" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-effect rounded-3xl p-8 border border-aurora-purple-mid">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-aurora-pink to-aurora-purple flex items-center justify-center">
              <span className="text-4xl">🎵</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-aurora-text-primary mb-2">
            Bienvenido a AURORA
          </h1>
          <p className="text-center text-aurora-text-secondary mb-8">
            Inicia sesión para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-aurora-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-aurora-bg-secondary border border-aurora-purple-mid 
                  text-aurora-text-primary placeholder-aurora-text-secondary focus:outline-none focus:border-aurora-pink
                  transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-aurora-text-primary mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-aurora-bg-secondary border border-aurora-purple-mid 
                  text-aurora-text-primary placeholder-aurora-text-secondary focus:outline-none focus:border-aurora-pink
                  transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-linear-to-r from-aurora-pink to-aurora-mint 
                text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 
                disabled:hover:scale-100"
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-aurora-text-secondary">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-aurora-pink hover:text-aurora-pink-light transition-colors">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
