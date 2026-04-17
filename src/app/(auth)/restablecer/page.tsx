'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, Circle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import styles from './restablecer.module.css';

interface Requirement {
  label: string;
  test: (pw: string) => boolean;
}

const requirements: Requirement[] = [
  { label: 'Mínimo 12 caracteres', test: (pw) => pw.length >= 12 },
  { label: 'Al menos una mayúscula', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Al menos un número', test: (pw) => /[0-9]/.test(pw) },
  { label: 'Al menos un símbolo', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export default function RestablecerPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const metRequirements = useMemo(
    () => requirements.map((r) => r.test(password)),
    [password]
  );

  const strength = useMemo(
    () => metRequirements.filter(Boolean).length,
    [metRequirements]
  );

  const allMet = metRequirements.every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allMet && passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) return;

    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError('No se pudo actualizar la contraseña. Intenta de nuevo.');
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nueva contraseña</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.passwordField}>
          <label className={styles.passwordLabel} htmlFor="new-password">
            Contraseña
          </label>
          <div className={styles.passwordInputWrapper}>
            <input
              id="new-password"
              className={styles.passwordInput}
              type={showPassword ? 'text' : 'password'}
              placeholder="Tu nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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

          {password.length > 0 && (
            <div className={styles.strengthBar}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`${styles.strengthSegment} ${
                    i < strength ? styles[`active${strength}` as keyof typeof styles] : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.passwordField}>
          <label className={styles.passwordLabel} htmlFor="confirm-password">
            Confirmar contraseña
          </label>
          <div className={styles.passwordInputWrapper}>
            <input
              id="confirm-password"
              className={styles.passwordInput}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <ul className={styles.requirements}>
          {requirements.map((req, i) => (
            <li
              key={req.label}
              className={`${styles.requirement} ${metRequirements[i] ? styles.met : ''}`}
            >
              <span className={styles.requirementIcon}>
                {metRequirements[i] ? <Check size={16} /> : <Circle size={16} />}
              </span>
              {req.label}
            </li>
          ))}
        </ul>

        {error && (
          <div className={styles.alert} role="alert">
            {error}
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          disabled={!canSubmit}
          className={styles.submitButton}
        >
          Guardar contraseña
        </Button>
      </form>
    </div>
  );
}
