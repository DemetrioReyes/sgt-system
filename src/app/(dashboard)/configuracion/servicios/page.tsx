import { getCatalogoServicios } from '@/lib/actions/configuracion';
import { ServiciosClient } from './ServiciosClient';

export default async function ServiciosPage() {
  const servicios = await getCatalogoServicios();

  return <ServiciosClient servicios={servicios} />;
}
