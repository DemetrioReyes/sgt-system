'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getVehiculos(busqueda?: string, marca?: string, estado?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('vehiculos')
      .select('*, clientes(id, nombre)')
      .order('created_at', { ascending: false });

    if (busqueda) {
      query = query.or(
        `placa.ilike.%${busqueda}%,marca.ilike.%${busqueda}%,modelo.ilike.%${busqueda}%`
      );
    }

    if (marca) {
      query = query.eq('marca', marca);
    }

    const { data: vehiculos, error } = await query;

    if (error) return { error: error.message };

    // Get active entradas to compute estado
    const { data: entradasActivas } = await supabase
      .from('entradas_vehiculo')
      .select('vehiculo_id, estado')
      .in('estado', ['recibido', 'en_diagnostico', 'en_reparacion']);

    const vehiculosConEstado = (vehiculos || []).map((v) => {
      const enTaller = entradasActivas?.some((e) => e.vehiculo_id === v.id);
      return { ...v, estado: enTaller ? 'En taller' : 'Fuera' };
    });

    const resultado = estado
      ? vehiculosConEstado.filter((v) => v.estado === estado)
      : vehiculosConEstado;

    return { data: resultado };
  } catch {
    return { error: 'Error al obtener vehículos' };
  }
}

export async function getVehiculo(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*, clientes(id, nombre, telefono, email)')
      .eq('id', id)
      .single();

    if (error) return { error: error.message };
    return { data };
  } catch {
    return { error: 'Error al obtener vehículo' };
  }
}

export async function getVehiculosByCliente(clienteId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data };
  } catch {
    return { error: 'Error al obtener vehículos del cliente' };
  }
}

export async function createVehiculo(formData: FormData) {
  try {
    const supabase = await createClient();

    const vehiculo = {
      cliente_id: formData.get('cliente_id') as string,
      placa: (formData.get('placa') as string)?.toUpperCase() || null,
      vin: formData.get('vin') as string || null,
      tipo: formData.get('tipo') as string,
      marca: formData.get('marca') as string,
      modelo: formData.get('modelo') as string,
      ano: formData.get('ano') ? parseInt(formData.get('ano') as string) : null,
      color: formData.get('color') as string || null,
      combustible: formData.get('combustible') as string || null,
      transmision: formData.get('transmision') as string || null,
      cilindraje: formData.get('cilindraje') as string || null,
      kilometraje: formData.get('kilometraje') ? parseInt(formData.get('kilometraje') as string) : null,
      notas: formData.get('notas') as string || null,
    };

    const { data, error } = await supabase.from('vehiculos').insert(vehiculo).select().single();

    if (error) return { error: error.message };

    revalidatePath('/vehiculos');
    return { data };
  } catch {
    return { error: 'Error al crear vehículo' };
  }
}

export async function updateVehiculo(id: string, formData: FormData) {
  try {
    const supabase = await createClient();

    const vehiculo = {
      cliente_id: formData.get('cliente_id') as string,
      placa: (formData.get('placa') as string)?.toUpperCase() || null,
      vin: formData.get('vin') as string || null,
      tipo: formData.get('tipo') as string,
      marca: formData.get('marca') as string,
      modelo: formData.get('modelo') as string,
      ano: formData.get('ano') ? parseInt(formData.get('ano') as string) : null,
      color: formData.get('color') as string || null,
      combustible: formData.get('combustible') as string || null,
      transmision: formData.get('transmision') as string || null,
      cilindraje: formData.get('cilindraje') as string || null,
      kilometraje: formData.get('kilometraje') ? parseInt(formData.get('kilometraje') as string) : null,
      notas: formData.get('notas') as string || null,
    };

    const { error } = await supabase.from('vehiculos').update(vehiculo).eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/vehiculos');
    return { data: { success: true } };
  } catch {
    return { error: 'Error al actualizar vehículo' };
  }
}

export async function deleteVehiculo(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('vehiculos').delete().eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/vehiculos');
    return { data: { success: true } };
  } catch {
    return { error: 'Error al eliminar vehículo' };
  }
}
