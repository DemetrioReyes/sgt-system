'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getFacturas(busqueda?: string, estado?: string) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('facturas')
      .select('*, clientes(id, nombre), vehiculos(id, placa, marca, modelo)')
      .order('created_at', { ascending: false });

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (busqueda) {
      query = query.or(
        `numero.ilike.%${busqueda}%,ncf.ilike.%${busqueda}%`
      );
    }

    const { data, error } = await query;

    if (error) return { error: error.message };

    // Compute saldo from total and saldo_pendiente
    const facturasConSaldo = (data || []).map((f) => ({
      ...f,
      saldo: f.saldo_pendiente ?? f.total,
    }));

    return { data: facturasConSaldo };
  } catch {
    return { error: 'Error al obtener facturas' };
  }
}

export async function getFactura(id: string) {
  try {
    const supabase = await createClient();

    const { data: factura, error } = await supabase
      .from('facturas')
      .select('*, clientes(id, nombre, telefono, email, cedula_rnc), vehiculos(id, placa, marca, modelo)')
      .eq('id', id)
      .single();

    if (error) return { error: error.message };

    // Get items
    const { data: items, error: itemsError } = await supabase
      .from('factura_items')
      .select('*')
      .eq('factura_id', id);

    if (itemsError) return { error: itemsError.message };

    return { data: { ...factura, items: items || [] } };
  } catch {
    return { error: 'Error al obtener factura' };
  }
}

export async function createFactura(data: {
  orden_id?: string;
  cliente_id: string;
  vehiculo_id: string;
  tipo_ncf?: string;
  ncf?: string;
  items: { tipo: string; descripcion: string; cantidad: number; precio_unitario: number }[];
  descuento?: number;
}) {
  try {
    const supabase = await createClient();

    // Generate numero
    const { data: numero, error: rpcError } = await supabase.rpc('generar_numero', {
      tipo_seq: 'factura',
    });

    if (rpcError) return { error: rpcError.message };

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.cantidad * item.precio_unitario,
      0
    );
    const descuento = data.descuento || 0;
    const itbis = (subtotal - descuento) * 0.18;
    const total = subtotal - descuento + itbis;

    const factura = {
      numero,
      orden_id: data.orden_id || null,
      cliente_id: data.cliente_id,
      vehiculo_id: data.vehiculo_id,
      tipo_ncf: data.tipo_ncf || null,
      ncf: data.ncf || null,
      subtotal,
      descuento,
      itbis,
      total,
      saldo_pendiente: total,
    };

    const { data: nuevaFactura, error } = await supabase
      .from('facturas')
      .insert(factura)
      .select()
      .single();

    if (error) return { error: error.message };

    // Insert items
    const items = data.items.map((item) => ({
      factura_id: nuevaFactura.id,
      tipo: item.tipo,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario,
    }));

    const { error: itemsError } = await supabase.from('factura_items').insert(items);

    if (itemsError) return { error: itemsError.message };

    revalidatePath('/facturas');
    return { data: nuevaFactura };
  } catch {
    return { error: 'Error al crear factura' };
  }
}

export async function getFacturasTotals() {
  try {
    const supabase = await createClient();

    const { data: facturas } = await supabase
      .from('facturas')
      .select('total, total_pagado, saldo_pendiente, estado');

    const all = facturas ?? [];
    const totalFacturado = all.reduce((s, f) => s + Number(f.total ?? 0), 0);
    const totalPorCobrar = all
      .filter((f) => f.estado === 'pendiente' || f.estado === 'parcial')
      .reduce((s, f) => s + Number(f.saldo_pendiente ?? 0), 0);
    const cobradas = all.filter((f) => f.estado === 'pagada').length;
    const anuladas = all.filter((f) => f.estado === 'anulada').length;

    return {
      data: {
        totalFacturado,
        porCobrar: totalPorCobrar,
        cobradas,
        anuladas,
      },
    };
  } catch {
    return { error: 'Error al obtener totales' };
  }
}
