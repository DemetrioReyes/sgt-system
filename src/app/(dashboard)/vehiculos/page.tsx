import { getVehiculos } from '@/lib/actions/vehiculos';
import VehiculosClient from './vehiculos-client';

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; marca?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const { data: vehiculos, error } = await getVehiculos(params.q, params.marca, params.estado);

  return (
    <VehiculosClient
      vehiculos={vehiculos || []}
      error={error}
      initialSearch={params.q || ''}
      initialMarca={params.marca || ''}
      initialEstado={params.estado || ''}
    />
  );
}
