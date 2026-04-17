'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ─── Taller Config ───────────────────────────────────────────

export async function getTallerConfig() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('taller_config')
    .select('*')
    .eq('id', 'default')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTallerConfig(formData: FormData) {
  const supabase = await createClient();

  const config = {
    nombre_comercial: formData.get('nombre_comercial') as string,
    razon_social: (formData.get('razon_social') as string) || null,
    rnc: (formData.get('rnc') as string) || null,
    direccion: (formData.get('direccion') as string) || null,
    provincia: (formData.get('provincia') as string) || null,
    municipio: (formData.get('municipio') as string) || null,
    telefono: (formData.get('telefono') as string) || null,
    telefono2: (formData.get('telefono2') as string) || null,
    email: (formData.get('email') as string) || null,
    sitio_web: (formData.get('sitio_web') as string) || null,
    horario: (formData.get('horario') as string) || null,
    moneda: (formData.get('moneda') as string) || 'DOP',
    itbis_porcentaje: parseFloat(formData.get('itbis_porcentaje') as string) || 18,
    aplicar_itbis_default: formData.get('aplicar_itbis_default') === 'on',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('taller_config')
    .update(config)
    .eq('id', 'default');
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion');
  revalidatePath('/configuracion/taller');
  return { success: true };
}

// ─── Usuarios ────────────────────────────────────────────────

export async function getUsuarios() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createUsuario(formData: FormData) {
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const nombre = formData.get('nombre') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const telefono = (formData.get('telefono') as string) || null;
  const rol = formData.get('rol') as string;

  // Crear usuario en auth.users
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) throw new Error(authError.message);

  // Crear perfil en tabla usuarios
  const { error } = await admin.from('usuarios').insert({
    id: authData.user.id,
    nombre,
    telefono,
    rol,
    activo: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/usuarios');
  return { success: true };
}

export async function updateUsuario(id: string, formData: FormData) {
  const supabase = await createClient();

  const usuario = {
    nombre: formData.get('nombre') as string,
    telefono: (formData.get('telefono') as string) || null,
    rol: formData.get('rol') as string,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('usuarios').update(usuario).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/usuarios');
  return { success: true };
}

export async function toggleUsuarioActivo(id: string, activo: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('usuarios')
    .update({ activo, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/usuarios');
  return { success: true };
}

// ─── NCF Secuencias ──────────────────────────────────────────

export async function getNcfSecuencias() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ncf_secuencias')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createNcfSecuencia(formData: FormData) {
  const supabase = await createClient();

  const secuencia = {
    tipo_comprobante: formData.get('tipo_comprobante') as string,
    prefijo: formData.get('prefijo') as string,
    rango_desde: parseInt(formData.get('rango_desde') as string, 10),
    rango_hasta: parseInt(formData.get('rango_hasta') as string, 10),
    consecutivo_actual: parseInt(formData.get('rango_desde') as string, 10),
    fecha_vencimiento: (formData.get('fecha_vencimiento') as string) || null,
    activo: true,
  };

  const { error } = await supabase.from('ncf_secuencias').insert(secuencia);
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/ncf');
  return { success: true };
}

export async function updateNcfSecuencia(id: string, formData: FormData) {
  const supabase = await createClient();

  const secuencia = {
    tipo_comprobante: formData.get('tipo_comprobante') as string,
    prefijo: formData.get('prefijo') as string,
    rango_desde: parseInt(formData.get('rango_desde') as string, 10),
    rango_hasta: parseInt(formData.get('rango_hasta') as string, 10),
    consecutivo_actual: parseInt(formData.get('consecutivo_actual') as string, 10),
    fecha_vencimiento: (formData.get('fecha_vencimiento') as string) || null,
    activo: formData.get('activo') === 'on',
  };

  const { error } = await supabase.from('ncf_secuencias').update(secuencia).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/ncf');
  return { success: true };
}

// ─── Catalogo de Servicios ───────────────────────────────────

export async function getCatalogoServicios() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('catalogo_servicios')
    .select('*')
    .order('nombre', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createServicio(formData: FormData) {
  const supabase = await createClient();

  const servicio = {
    nombre: formData.get('nombre') as string,
    categoria: (formData.get('categoria') as string) || null,
    descripcion: (formData.get('descripcion') as string) || null,
    precio: parseFloat(formData.get('precio') as string) || 0,
    tiempo_estimado: parseFloat(formData.get('tiempo_estimado') as string) || null,
    aplica_itbis: formData.get('aplica_itbis') === 'on',
    activo: true,
  };

  const { error } = await supabase.from('catalogo_servicios').insert(servicio);
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/servicios');
  return { success: true };
}

export async function updateServicio(id: string, formData: FormData) {
  const supabase = await createClient();

  const servicio = {
    nombre: formData.get('nombre') as string,
    categoria: (formData.get('categoria') as string) || null,
    descripcion: (formData.get('descripcion') as string) || null,
    precio: parseFloat(formData.get('precio') as string) || 0,
    tiempo_estimado: parseFloat(formData.get('tiempo_estimado') as string) || null,
    aplica_itbis: formData.get('aplica_itbis') === 'on',
    activo: formData.get('activo') === 'on',
  };

  const { error } = await supabase.from('catalogo_servicios').update(servicio).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/servicios');
  return { success: true };
}

export async function deleteServicio(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('catalogo_servicios').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/servicios');
  return { success: true };
}

// ─── Catalogo de Repuestos ───────────────────────────────────

export async function getCatalogoRepuestos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('catalogo_repuestos')
    .select('*')
    .order('nombre', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createRepuesto(formData: FormData) {
  const supabase = await createClient();

  const repuesto = {
    codigo: (formData.get('codigo') as string) || null,
    nombre: formData.get('nombre') as string,
    marca_compatible: (formData.get('marca_compatible') as string) || null,
    precio_compra: parseFloat(formData.get('precio_compra') as string) || 0,
    precio_venta: parseFloat(formData.get('precio_venta') as string) || 0,
    stock_actual: parseInt(formData.get('stock_actual') as string, 10) || 0,
    stock_minimo: parseInt(formData.get('stock_minimo') as string, 10) || 0,
    proveedor: (formData.get('proveedor') as string) || null,
    activo: true,
  };

  const { error } = await supabase.from('catalogo_repuestos').insert(repuesto);
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/repuestos');
  return { success: true };
}

export async function updateRepuesto(id: string, formData: FormData) {
  const supabase = await createClient();

  const repuesto = {
    codigo: (formData.get('codigo') as string) || null,
    nombre: formData.get('nombre') as string,
    marca_compatible: (formData.get('marca_compatible') as string) || null,
    precio_compra: parseFloat(formData.get('precio_compra') as string) || 0,
    precio_venta: parseFloat(formData.get('precio_venta') as string) || 0,
    stock_actual: parseInt(formData.get('stock_actual') as string, 10) || 0,
    stock_minimo: parseInt(formData.get('stock_minimo') as string, 10) || 0,
    proveedor: (formData.get('proveedor') as string) || null,
    activo: formData.get('activo') === 'on',
  };

  const { error } = await supabase.from('catalogo_repuestos').update(repuesto).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/repuestos');
  return { success: true };
}

export async function deleteRepuesto(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('catalogo_repuestos').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/configuracion/repuestos');
  return { success: true };
}
