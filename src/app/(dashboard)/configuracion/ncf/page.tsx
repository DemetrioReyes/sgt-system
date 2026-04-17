import { getNcfSecuencias } from '@/lib/actions/configuracion';
import { NcfClient } from './NcfClient';

export default async function NcfPage() {
  const secuencias = await getNcfSecuencias();

  return <NcfClient secuencias={secuencias} />;
}
