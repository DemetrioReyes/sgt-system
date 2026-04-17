import { getTallerConfig } from '@/lib/actions/configuracion';
import { TallerForm } from './TallerForm';

export default async function TallerPage() {
  const config = await getTallerConfig();

  return <TallerForm config={config} />;
}
