import { getUsuarios } from '@/lib/actions/configuracion';
import { UsuariosClient } from './UsuariosClient';

export default async function UsuariosPage() {
  const usuarios = await getUsuarios();

  return <UsuariosClient usuarios={usuarios} />;
}
