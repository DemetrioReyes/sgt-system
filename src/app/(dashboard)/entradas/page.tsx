import { getEntradas } from '@/lib/actions/entradas';
import EntradasClient from './entradas-client';

export default async function EntradasPage() {
  const { data: entradas, error } = await getEntradas();

  return <EntradasClient entradas={entradas || []} error={error} />;
}
