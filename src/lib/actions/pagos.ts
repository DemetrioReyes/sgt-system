'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPagos(busqueda?: string, metodo?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('pagos')
      .select('*, facturas(id, numero), clientes(id, nombre)')
      .order('created_at', { ascending: false });

    if (metodo) {
      query = query.eq('metodo', metodo);
    }

    if (busqueda) {
      query = query.or(
        `numero.ilike.%${busqueda}%,referencia.ilike.%${busqueda}%`
      );
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { data: data ?? [] };
  } catch {
    return { error: 'Error al obtener pagos' };
  }
}

export async function createPago(data: {
  factura_id: string;
  monto: number;
  metodo: string;
  referencia?: string;
  banco_origen?: string;
  notas?: string;
}) {
  try {
    const supabase = await createClient();

    // Generate numero
    const { data: numero, error: rpcError } = await supabase.rpc('generar_numero', {
      tipo_seq: 'pago',
    });

    if (rpcError) return { error: rpcError.message };

    // Get cliente_id from factura
    const { data: factura, error: factError } = await supabase
      .from('facturas')
      .select('cliente_id')
      .eq('id', data.factura_id)
      .single();

    if (factError) return { error: factError.message };

    const pago = {
      numero,
      factura_id: data.factura_id,
      cliente_id: factura.cliente_id,
      monto: data.monto,
      metodo: data.metodo,
      referencia: data.referencia || null,
      banco_origen: data.banco_origen || null,
      notas: data.notas || null,
    };

    const { data: nuevoPago, error } = await supabase
      .from('pagos')
      .insert(pago)
      .select()
      .single();

    if (error) return { error: error.message };

    revalidatePath('/pagos');
    revalidatePath('/facturas');
    return { data: nuevoPago };
  } catch {
    return { error: 'Error al crear pago' };
  }
}

export async function getFacturasPendientes(busqueda?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('facturas')
      .select('id, numero, cliente_id, vehiculo_id, total, total_pagado, saldo_pendiente, clientes(nombre), vehiculos(placa, marca, modelo)')
      .in('estado', ['pendiente', 'parcial'])
      .order('created_at', { ascending: false });

    if (busqueda) {
      query = query.or(
        `numero.ilike.%${busqueda}%`
      );
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { data: data ?? [] };
  } catch {
    return { error: 'Error al obtener facturas pendientes' };
  }
}
