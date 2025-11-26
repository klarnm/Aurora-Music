'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al registrar usuario');
        setLoading(false);
        return;
      }

      router.push('/login');
    } catch {
      setError('Error de conexión');
      setLoading(false);
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
            Únete a AURORA
          </h1>
          <p className="text-center text-aurora-text-secondary mb-8">
            Crea tu cuenta y descubre música increíble
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-aurora-text-primary mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-aurora-bg-secondary border border-aurora-purple-mid 
                  text-aurora-text-primary placeholder-aurora-text-secondary focus:outline-none focus:border-aurora-pink
                  transition-colors"
                placeholder="Tu nombre"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-aurora-text-primary mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <p className="mt-6 text-center text-aurora-text-secondary">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-aurora-pink hover:text-aurora-pink-light transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
