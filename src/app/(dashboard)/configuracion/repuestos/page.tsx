import { getCatalogoRepuestos } from '@/lib/actions/configuracion';
import { RepuestosClient } from './RepuestosClient';

export default async function RepuestosPage() {
  const repuestos = await getCatalogoRepuestos();

  return <RepuestosClient repuestos={repuestos} />;
}
