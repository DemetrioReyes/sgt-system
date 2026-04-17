import { Suspense } from 'react';
import FacturaFormClient from './factura-form-client';

export default function NuevaFacturaPage() {
  return (
    <Suspense fallback={<div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando...</div>}>
      <FacturaFormClient />
    </Suspense>
  );
}
