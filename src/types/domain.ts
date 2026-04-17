// Roles del sistema
export type UserRole = 'admin' | 'recepcionista' | 'mecanico' | 'contador';

// Estados de entradas
export type EntradaEstado = 'recibido' | 'en_diagnostico' | 'cotizado' | 'en_reparacion' | 'completado' | 'entregado';

// Estados de cotizaciones
export type CotizacionEstado = 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';

// Estados de ordenes de trabajo
export type OrdenEstado = 'pendiente' | 'en_progreso' | 'pausada' | 'completada' | 'cancelada';

// Estados de facturas
export type FacturaEstado = 'pendiente' | 'parcial' | 'pagada' | 'anulada';

// Metodos de pago
export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';

// Moneda
export type Moneda = 'DOP' | 'USD';

// Tipo de movimiento
export type TipoMovimiento = 'ingreso' | 'egreso';

// Tipo de item en cotizacion/factura
export type TipoItem = 'servicio' | 'repuesto';

// Nivel de combustible
export type NivelCombustible = 'vacio' | '1/4' | '1/2' | '3/4' | 'lleno';
