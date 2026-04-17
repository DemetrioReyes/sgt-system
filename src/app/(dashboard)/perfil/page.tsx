'use client';

import { useState } from 'react';
import { Camera, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import styles from './perfil.module.css';

export default function PerfilPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [tema, setTema] = useState('auto');

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mi perfil</h1>

      {/* Datos personales */}
      <Card padding="lg">
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Datos personales</h2>

          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              <span className={styles.avatarInitials}>JP</span>
              <div className={styles.cameraOverlay}>
                <Camera size={16} />
              </div>
            </div>
            <span className={styles.avatarHint}>Haz clic para cambiar la foto</span>
          </div>

          <div className={styles.formGrid}>
            <Input label="Nombre" defaultValue="Juan Perez" />
            <div className={styles.inputWithIcon}>
              <Input label="Email" defaultValue="juan@email.com" readOnly />
              <Lock size={16} className={styles.lockIcon} />
            </div>
            <Input label="Telefono" defaultValue="809-555-0101" />
            <div>
              <label className={styles.prefsLabel}>Rol</label>
              <Badge variant="info">Administrador</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Seguridad */}
      <Card padding="lg">
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Seguridad</h2>

          <div className={styles.passwordForm}>
            <Input label="Contrasena actual" type="password" placeholder="********" />
            <Input label="Nueva contrasena" type="password" placeholder="********" />
            <Input label="Confirmar contrasena" type="password" placeholder="********" />
            <Button variant="secondary" size="md">Cambiar contrasena</Button>
          </div>

          <div className={styles.mfaRow}>
            <div className={styles.mfaInfo}>
              <span className={styles.mfaLabel}>Autenticacion de dos factores</span>
              <span className={styles.mfaDesc}>Agrega una capa extra de seguridad a tu cuenta</span>
            </div>
            <button
              className={`${styles.toggle} ${mfaEnabled ? styles.toggleActive : ''}`}
              onClick={() => setMfaEnabled(!mfaEnabled)}
              aria-label="Toggle MFA"
            />
          </div>

          <Card padding="md">
            <div className={styles.sessionCard}>
              <div className={styles.sessionInfo}>
                <span className={styles.sessionDevice}>Este dispositivo - Chrome en macOS</span>
                <span className={styles.sessionStatus}>
                  <span className={styles.statusDot} />
                  Activo ahora
                </span>
              </div>
              <Button variant="danger" size="sm">Cerrar todas las sesiones</Button>
            </div>
          </Card>
        </div>
      </Card>

      {/* Preferencias */}
      <Card padding="lg">
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Preferencias</h2>

          <div>
            <p className={styles.prefsLabel}>Tema</p>
            <div className={styles.radioGroup}>
              {[
                { value: 'light', label: 'Claro' },
                { value: 'dark', label: 'Oscuro' },
                { value: 'auto', label: 'Automatico' },
              ].map((opt) => (
                <label key={opt.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="tema"
                    value={opt.value}
                    checked={tema === opt.value}
                    onChange={() => setTema(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className={styles.prefsLabel}>Notificaciones</p>
            <div className={styles.checkboxList}>
              {[
                'Ordenes de trabajo asignadas',
                'Pagos recibidos',
                'Recordatorios de citas',
                'Alertas de inventario bajo',
                'Resumen diario por email',
              ].map((item) => (
                <label key={item} className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className={styles.footer}>
        <Button size="md">Guardar cambios</Button>
      </div>
    </div>
  );
}
