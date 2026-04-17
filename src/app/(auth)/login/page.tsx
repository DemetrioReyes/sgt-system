'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Correo o contraseña incorrectos');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('No se pudo conectar. Verifica tu internet');
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Ingresa tu correo para recibir el enlace mágico');
      return;
    }

    setError('');
    setMagicLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        setError('No se pudo enviar el enlace. Intenta de nuevo.');
        setMagicLoading(false);
        return;
      }

      setError('');
      alert('Revisa tu correo para el enlace de acceso.');
    } catch {
      setError('No se pudo conectar. Verifica tu internet');
    } finally {
      setMagicLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>
          <Car size={40} />
        </div>
        <span className={styles.tallerName}>SGT</span>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Accede a tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div className={styles.passwordField}>
          <label className={styles.passwordLabel} htmlFor="password">
            Contraseña
          </label>
          <div className={styles.passwordInputWrapper}>
            <input
              id="password"
              className={styles.passwordInput}
              type={showPassword ? 'text' : 'password'}
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.rememberRow}>
          <input
            type="checkbox"
            id="remember"
            className={styles.checkbox}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember" className={styles.rememberLabel}>
            Recordarme en este dispositivo
          </label>
        </div>

        {error && (
          <div className={styles.alert} role="alert">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className={styles.submitButton}>
          Iniciar sesión
        </Button>

        <p className={styles.forgotLink}>
          <Link href="/recuperar">¿Olvidaste tu contraseña?</Link>
        </p>

        <div className={styles.separator}>
          <span className={styles.separatorLine} />
          <span>o</span>
          <span className={styles.separatorLine} />
        </div>

        <Button
          type="button"
          variant="secondary"
          loading={magicLoading}
          className={styles.magicButton}
          onClick={handleMagicLink}
        >
          Enviarme enlace mágico al correo
        </Button>
      </form>

      <p className={styles.footer}>
        ¿Problemas para acceder? Contacta al administrador
      </p>
      <p className={styles.version}>v1.0.0</p>
    </div>
  );
}
