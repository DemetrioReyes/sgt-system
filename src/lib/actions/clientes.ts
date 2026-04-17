'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getClientes(busqueda?: string) {
  const supabase = await createClient();
  let query = supabase.from('clientes').select('*').order('created_at', { ascending: false });

  if (busqueda) {
    query = query.or(
      `nombre.ilike.%${busqueda}%,cedula_rnc.ilike.%${busqueda}%,telefono.ilike.%${busqueda}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCliente(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createCliente(formData: FormData) {
  const supabase = await createClient();

  const cliente = {
    tipo: formData.get('tipo') as string,
    nombre: formData.get('nombre') as string,
    cedula_rnc: formData.get('cedula_rnc') as string,
    telefono: formData.get('telefono') as string,
    telefono2: (formData.get('telefono2') as string) || null,
    email: (formData.get('email') as string) || null,
    whatsapp_mismo: formData.get('whatsapp_mismo') === 'on',
    provincia: (formData.get('provincia') as string) || null,
    municipio: (formData.get('municipio') as string) || null,
    direccion: (formData.get('direccion') as string) || null,
    referencia: (formData.get('referencia') as string) || null,
    notas: (formData.get('notas') as string) || null,
    acepta_recordatorios: formData.get('acepta_recordatorios') === 'on',
  };

  const { error } = await supabase.from('clientes').insert(cliente);
  if (error) throw new Error(error.message);

  revalidatePath('/clientes');
  redirect('/clientes');
}

export async function updateCliente(id: string, formData: FormData) {
  const supabase = await createClient();

  const cliente = {
    tipo: formData.get('tipo') as string,
    nombre: formData.get('nombre') as string,
    cedula_rnc: formData.get('cedula_rnc') as string,
    telefono: formData.get('telefono') as string,
    telefono2: (formData.get('telefono2') as string) || null,
    email: (formData.get('email') as string) || null,
    whatsapp_mismo: formData.get('whatsapp_mismo') === 'on',
    provincia: (formData.get('provincia') as string) || null,
    municipio: (formData.get('municipio') as string) || null,
    direccion: (formData.get('direccion') as string) || null,
    referencia: (formData.get('referencia') as string) || null,
    notas: (formData.get('notas') as string) || null,
    acepta_recordatorios: formData.get('acepta_recordatorios') === 'on',
  };

  const { error } = await supabase.from('clientes').update(cliente).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/clientes');
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function deleteCliente(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/clientes');
  redirect('/clientes');
}
