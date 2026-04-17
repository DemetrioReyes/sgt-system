'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getEntradas(estado?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('entradas_vehiculo')
      .select(
        '*, vehiculos(id, placa, marca, modelo, ano), clientes(id, nombre), usuarios(id, nombre)'
      )
      .order('fecha_entrada', { ascending: false });

    if (estado) {
      query = query.eq('estado', estado);
    } else {
      query = query.neq('estado', 'entregado');
    }

    const { data, error } = await query;

    if (error) return { error: error.message };

    const entradas = (data || []).map((e) => {
      const fechaEntrada = e.fecha_entrada ? new Date(e.fecha_entrada) : null;
      let tiempoEnTaller = '';
      if (fechaEntrada) {
        const now = new Date();
        const diffMs = now.getTime() - fechaEntrada.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffHours / 24);
        const hours = diffHours % 24;
        tiempoEnTaller = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
      }

      const mecanico = e.usuarios as { id: string; nombre: string } | null;
      const mecanicoNombre = mecanico?.nombre || '';
      const mecanicoInicial = mecanicoNombre
        ? mecanicoNombre
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '';

      const vehiculo = e.vehiculos as {
        id: string;
        placa: string;
        marca: string;
        modelo: string;
        ano: number;
      } | null;
      const cliente = e.clientes as { id: string; nombre: string } | null;

      return {
        ...e,
        placa: vehiculo?.placa || '',
        vehiculo_desc: vehiculo
          ? `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.ano || ''}`
          : '',
        cliente_nombre: cliente?.nombre || '',
        mecanico_nombre: mecanicoNombre,
        mecanico_inicial: mecanicoInicial,
        tiempo_en_taller: tiempoEnTaller,
      };
    });

    return { data: entradas };
  } catch {
    return { error: 'Error al obtener entradas' };
  }
}

export async function getEntrada(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('entradas_vehiculo')
      .select(
        '*, vehiculos(id, placa, marca, modelo, ano, color, cliente_id), clientes(id, nombre, telefono, email), usuarios(id, nombre, rol)'
      )
      .eq('id', id)
      .single();

    if (error) return { error: error.message };

    const fechaEntrada = data.fecha_entrada ? new Date(data.fecha_entrada) : null;
    let tiempoEnTaller = '';
    if (fechaEntrada) {
      const now = new Date();
      const diffMs = now.getTime() - fechaEntrada.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      tiempoEnTaller = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
    }

    return { data: { ...data, tiempo_en_taller: tiempoEnTaller } };
  } catch {
    return { error: 'Error al obtener entrada' };
  }
}

export async function createEntrada(entradaData: {
  vehiculo_id: string;
  cliente_id: string;
  kilometraje: number;
  nivel_combustible: string;
  descripcion_problema: string;
  sintomas: string[];
  urgencia: string;
}) {
  try {
    const supabase = await createClient();

    // Generate entry number
    const { data: numero, error: rpcError } = await supabase.rpc('generar_numero', {
      tipo_seq: 'entrada',
    });

    if (rpcError) return { error: rpcError.message };

    const { data, error } = await supabase
      .from('entradas_vehiculo')
      .insert({
        numero: numero,
        vehiculo_id: entradaData.vehiculo_id,
        cliente_id: entradaData.cliente_id,
        fecha_entrada: new Date().toISOString(),
        kilometraje: entradaData.kilometraje || null,
        nivel_combustible: entradaData.nivel_combustible || null,
        descripcion_problema: entradaData.descripcion_problema,
        sintomas: entradaData.sintomas,
        urgencia: entradaData.urgencia || 'normal',
        estado: 'recibido',
      })
      .select()
      .single();

    if (error) return { error: error.message };

    revalidatePath('/entradas');
    return { data };
  } catch {
    return { error: 'Error al crear entrada' };
  }
}

export async function updateEntradaEstado(id: string, estado: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('entradas_vehiculo')
      .update({ estado })
      .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/entradas');
    return { data: { success: true } };
  } catch {
    return { error: 'Error al actualizar estado de entrada' };
  }
}

export async function asignarMecanico(id: string, mecanicoId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('entradas_vehiculo')
      .update({ mecanico_id: mecanicoId })
      .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/entradas');
    return { data: { success: true } };
  } catch {
    return { error: 'Error al asignar mecanico' };
  }
}
