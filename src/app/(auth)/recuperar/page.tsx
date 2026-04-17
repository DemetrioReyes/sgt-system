'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import styles from './recuperar.module.css';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/restablecer`,
      });

      if (error) {
        setError('No se pudo enviar el correo. Intenta de nuevo.');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError('No se pudo conectar. Verifica tu internet');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>
          <CheckCircle size={32} />
        </div>
        <h1 className={styles.successTitle}>Revisa tu correo</h1>
        <p className={styles.successText}>
          Si el correo existe en nuestro sistema, recibirás un enlace en los
          próximos minutos
        </p>
        <Link href="/login" style={{ width: '100%' }}>
          <Button variant="primary" className={styles.successButton}>
            Volver al login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recuperar contraseña</h1>
        <p className={styles.description}>
          Ingresa tu correo y te enviaremos instrucciones
        </p>
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

        {error && (
          <div className={styles.alert} role="alert">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className={styles.submitButton}>
          Enviar instrucciones
        </Button>
      </form>

      <p className={styles.backLink}>
        <Link href="/login">Volver a iniciar sesión</Link>
      </p>
    </div>
  );
}
