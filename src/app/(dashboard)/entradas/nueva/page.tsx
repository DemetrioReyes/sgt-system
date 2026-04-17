import { Suspense } from 'react';
import NuevaEntradaForm from './nueva-entrada-form';

export default function NuevaEntradaPage() {
  return (
    <Suspense fallback={<div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando...</div>}>
      <NuevaEntradaForm />
    </Suspense>
  );
}
