'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Input, Textarea, Card, CardContent } from '@/components/ui';
import { createEntrada } from '@/lib/actions/entradas';
import { createClient } from '@/lib/supabase/client';
import styles from './nueva-entrada.module.css';

const STEPS = ['Cliente', 'Vehiculo', 'Recepcion', 'Descripcion', 'Fotos', 'Firma'];

const SYMPTOM_OPTIONS = [
  'Ruido al frenar',
  'Vibracion',
  'Perdida de potencia',
  'Luz del motor',
  'Fuga de liquidos',
  'Problema electrico',
  'A/C',
  'No enciende',
];

const FUEL_LEVELS = [
  { value: 'vacio', label: 'Vacio' },
  { value: '1/4', label: '1/4' },
  { value: '1/2', label: '1/2' },
  { value: '3/4', label: '3/4' },
  { value: 'lleno', label: 'Lleno' },
];

const PHOTO_LABELS = ['Frente', 'Atras', 'Izquierdo', 'Derecho', 'Tablero', 'Danos'];

interface Cliente {
  id: string;
  nombre: string;
  cedula_rnc: string;
  telefono: string;
}

interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number | null;
  color: string | null;
}

export default function NuevaEntradaForm() {
  const searchParamsHook = useSearchParams();
  const preselectedVehiculoId = searchParamsHook.get('vehiculo_id');
  const preselectedClienteId = searchParamsHook.get('cliente_id');

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdEntrada, setCreatedEntrada] = useState<{ id: string; numero: string } | null>(null);

  // Step 1 state
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [searchingClients, setSearchingClients] = useState(false);

  // Step 2 state
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehiculo | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Step 3 state
  const [km, setKm] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');

  // Step 4 state
  const [problema, setProblema] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [urgencia, setUrgencia] = useState('normal');

  // Handle preselection from URL params
  useEffect(() => {
    if (preselectedClienteId) {
      const supabase = createClient();
      supabase
        .from('clientes')
        .select('id, nombre, cedula_rnc, telefono')
        .eq('id', preselectedClienteId)
        .single()
        .then(({ data }) => {
          if (data) {
            setSelectedClient(data);
            if (preselectedVehiculoId) {
              // Skip to step 2, then auto-select vehicle
              setCurrentStep(1);
            }
          }
        });
    }
  }, [preselectedClienteId, preselectedVehiculoId]);

  // Load vehicles when client is selected
  useEffect(() => {
    if (selectedClient) {
      setLoadingVehicles(true);
      const supabase = createClient();
      supabase
        .from('vehiculos')
        .select('id, placa, marca, modelo, ano, color')
        .eq('cliente_id', selectedClient.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setVehiculos(data || []);
          setLoadingVehicles(false);
          // Auto-select preselected vehicle
          if (preselectedVehiculoId && data) {
            const found = data.find((v) => v.id === preselectedVehiculoId);
            if (found) {
              setSelectedVehicle(found);
              setCurrentStep(2); // Jump to reception step
            }
          }
        });
    } else {
      setVehiculos([]);
      setSelectedVehicle(null);
    }
  }, [selectedClient, preselectedVehiculoId]);

  // Search clients
  const searchClientes = useCallback(async (query: string) => {
    if (query.length < 2) {
      setClientResults([]);
      return;
    }
    setSearchingClients(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('clientes')
        .select('id, nombre, cedula_rnc, telefono')
        .or(
          `nombre.ilike.%${query}%,cedula_rnc.ilike.%${query}%,telefono.ilike.%${query}%`
        )
        .limit(10);
      setClientResults(data || []);
    } catch {
      setClientResults([]);
    } finally {
      setSearchingClients(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (clientSearch && !selectedClient) {
        searchClientes(clientSearch);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [clientSearch, selectedClient, searchClientes]);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const confirm = async () => {
    if (!selectedClient || !selectedVehicle) return;
    setSubmitting(true);
    setError('');

    const result = await createEntrada({
      vehiculo_id: selectedVehicle.id,
      cliente_id: selectedClient.id,
      kilometraje: km ? parseInt(km) : 0,
      nivel_combustible: fuelLevel,
      descripcion_problema: problema,
      sintomas: selectedSymptoms,
      urgencia,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setCreatedEntrada({ id: result.data.id, numero: result.data.numero });
      setCompleted(true);
      setSubmitting(false);
    }
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  if (completed && createdEntrada) {
    return (
      <div className={styles.page}>
        <div className={styles.successScreen}>
          <div className={styles.successIcon}>&#10003;</div>
          <div className={styles.successTitle}>Entrada registrada exitosamente</div>
          <div className={styles.successCode}>{createdEntrada.numero}</div>
          <div className={styles.successActions}>
            <Link href={`/entradas/${createdEntrada.id}`}>
              <Button size="sm">Ver detalle</Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCompleted(false);
                setCreatedEntrada(null);
                setCurrentStep(0);
                setClientSearch('');
                setClientResults([]);
                setSelectedClient(null);
                setVehiculos([]);
                setSelectedVehicle(null);
                setKm('');
                setFuelLevel('');
                setProblema('');
                setSelectedSymptoms([]);
                setUrgencia('normal');
              }}
            >
              Registrar otra
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link href="/entradas" className={styles.backLink}>
        &larr; Volver a entradas
      </Link>
      <h1 className={styles.title}>Nueva entrada</h1>

      {error && (
        <div
          style={{
            color: 'var(--color-danger)',
            fontSize: 'var(--text-sm)',
            padding: 'var(--space-2) 0',
          }}
        >
          {error}
        </div>
      )}

      {/* Progress bar */}
      <div className={styles.progressBar}>
        {STEPS.map((step, i) => (
          <div key={step} className={styles.progressStep}>
            <div
              className={`${styles.stepCircle} ${
                i === currentStep
                  ? styles.stepCircleActive
                  : i < currentStep
                  ? styles.stepCircleDone
                  : ''
              }`}
            >
              {i < currentStep ? '\u2713' : i + 1}
            </div>
            <span
              className={`${styles.stepLabel} ${
                i === currentStep ? styles.stepLabelActive : ''
              }`}
            >
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`${styles.stepLine} ${
                  i < currentStep ? styles.stepLineDone : ''
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Cliente */}
      {currentStep === 0 && (
        <Card>
          <CardContent>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Buscar cliente</h2>
              {selectedClient ? (
                <div className={styles.clientCard}>
                  <div className={styles.clientAvatar}>
                    {selectedClient.nombre
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className={styles.clientInfo}>
                    <span className={styles.clientName}>{selectedClient.nombre}</span>
                    <span className={styles.clientMeta}>
                      {selectedClient.telefono}
                      {selectedClient.cedula_rnc
                        ? ` \u00B7 ${selectedClient.cedula_rnc}`
                        : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(null);
                      setClientSearch('');
                      setClientResults([]);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      marginLeft: 'auto',
                    }}
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Buscar por nombre, cedula o telefono..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                  {searchingClients && (
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Buscando...
                    </div>
                  )}
                  {clientResults.length > 0 && (
                    <div
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        maxHeight: '250px',
                        overflowY: 'auto',
                      }}
                    >
                      {clientResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedClient(c);
                            setClientResults([]);
                            setClientSearch('');
                          }}
                          className={styles.clientCard}
                          style={{
                            width: '100%',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--color-border)',
                            borderRadius: 0,
                            border: 'none',
                            borderBlockEnd: '1px solid var(--color-border)',
                          }}
                        >
                          <div className={styles.clientAvatar}>
                            {c.nombre
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div className={styles.clientInfo}>
                            <span className={styles.clientName}>{c.nombre}</span>
                            <span className={styles.clientMeta}>
                              {c.telefono}
                              {c.cedula_rnc ? ` \u00B7 ${c.cedula_rnc}` : ''}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {clientSearch.length >= 2 &&
                    clientResults.length === 0 &&
                    !searchingClients && (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: 'var(--space-3)',
                          color: 'var(--color-text-muted)',
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        No se encontraron clientes.
                      </div>
                    )}
                </>
              )}
              <div className={styles.stepNav}>
                <span />
                <Button onClick={next} disabled={!selectedClient}>
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Vehiculo */}
      {currentStep === 1 && (
        <Card>
          <CardContent>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Seleccionar vehiculo</h2>
              {loadingVehicles ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-4)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Cargando vehiculos...
                </div>
              ) : (
                <div className={styles.vehicleCards}>
                  {vehiculos.map((v) => (
                    <button
                      key={v.id}
                      className={`${styles.vehicleOption} ${
                        selectedVehicle?.id === v.id
                          ? styles.vehicleOptionSelected
                          : ''
                      }`}
                      onClick={() => setSelectedVehicle(v)}
                      type="button"
                    >
                      <div className={styles.vehiclePlaca}>{v.placa}</div>
                      <div className={styles.vehicleMeta}>
                        {v.marca} {v.modelo} {v.ano || ''}{' '}
                        {v.color ? `- ${v.color}` : ''}
                      </div>
                    </button>
                  ))}
                  {vehiculos.length === 0 && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: 'var(--space-4)',
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--text-sm)',
                        gridColumn: '1 / -1',
                      }}
                    >
                      Este cliente no tiene vehiculos registrados.
                    </div>
                  )}
                  <Link
                    href={`/vehiculos/nuevo`}
                    className={styles.addNewCard}
                    style={{ textDecoration: 'none' }}
                  >
                    + Agregar nuevo vehiculo
                  </Link>
                </div>
              )}
              <div className={styles.stepNav}>
                <Button variant="secondary" onClick={prev}>
                  Anterior
                </Button>
                <Button onClick={next} disabled={!selectedVehicle}>
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Estado de recepcion */}
      {currentStep === 2 && (
        <Card>
          <CardContent>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Estado de recepcion</h2>
              <Input
                label="Kilometraje"
                placeholder="Ej: 45320"
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
              />
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)' as string,
                    marginBottom: 'var(--space-2)',
                    color: 'var(--color-text)',
                  }}
                >
                  Nivel de combustible
                </label>
                <div className={styles.fuelButtons}>
                  {FUEL_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      className={`${styles.fuelButton} ${
                        fuelLevel === level.value ? styles.fuelButtonActive : ''
                      }`}
                      onClick={() => setFuelLevel(level.value)}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.stepNav}>
                <Button variant="secondary" onClick={prev}>
                  Anterior
                </Button>
                <Button onClick={next}>Siguiente</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Descripcion */}
      {currentStep === 3 && (
        <Card>
          <CardContent>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Descripcion del problema</h2>
              <Textarea
                label="Problema reportado"
                placeholder="Describa el problema que reporta el cliente..."
                value={problema}
                onChange={(e) => setProblema(e.target.value)}
                rows={4}
              />
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)' as string,
                    marginBottom: 'var(--space-2)',
                    color: 'var(--color-text)',
                  }}
                >
                  Sintomas
                </label>
                <div className={styles.chipGrid}>
                  {SYMPTOM_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.chip} ${
                        selectedSymptoms.includes(s) ? styles.chipActive : ''
                      }`}
                      onClick={() => toggleSymptom(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)' as string,
                    marginBottom: 'var(--space-2)',
                    color: 'var(--color-text)',
                  }}
                >
                  Urgencia
                </label>
                <div className={styles.urgencyOptions}>
                  {[
                    {
                      value: 'normal',
                      label: 'Normal',
                      color: 'var(--color-success)',
                    },
                    {
                      value: 'urgente',
                      label: 'Urgente',
                      color: 'var(--color-warning)',
                    },
                    {
                      value: 'emergencia',
                      label: 'Emergencia',
                      color: 'var(--color-danger)',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.urgencyOption} ${
                        urgencia === opt.value ? styles.urgencyOptionActive : ''
                      }`}
                      onClick={() => setUrgencia(opt.value)}
                    >
                      <span
                        className={styles.urgencyDot}
                        style={{ backgroundColor: opt.color }}
                      />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.stepNav}>
                <Button variant="secondary" onClick={prev}>
                  Anterior
                </Button>
                <Button onClick={next}>Siguiente</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Fotos */}
      {currentStep === 4 && (
        <Card>
          <CardContent>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Fotos del vehiculo</h2>
              <div className={styles.photoGrid}>
                {PHOTO_LABELS.map((label) => (
                  <div key={label} className={styles.photoBox}>
                    <span className={styles.photoIcon}>&#128247;</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <Button variant="secondary" type="button">
                Tomar foto
              </Button>
              <div className={styles.stepNav}>
                <Button variant="secondary" onClick={prev}>
                  Anterior
                </Button>
                <Button onClick={next}>Siguiente</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Firma */}
      {currentStep === 5 && (
        <Card>
          <CardContent>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Firma del cliente</h2>
              <p className={styles.legalText}>
                Al firmar este documento, el cliente autoriza al taller a realizar la
                inspeccion y diagnostico del vehiculo descrito. El taller no se hace
                responsable por objetos de valor dejados en el interior del vehiculo. El
                cliente acepta que el presupuesto de reparacion sera proporcionado despues
                del diagnostico y que cualquier trabajo adicional requerira aprobacion
                previa.
              </p>
              <div className={styles.signatureCanvas}>Firme aqui</div>

              {/* Summary */}
              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Cliente</span>
                  <span className={styles.summaryValue}>
                    {selectedClient?.nombre || 'No seleccionado'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Vehiculo</span>
                  <span className={styles.summaryValue}>
                    {selectedVehicle
                      ? `${selectedVehicle.placa} - ${selectedVehicle.marca} ${selectedVehicle.modelo} ${selectedVehicle.ano || ''}`
                      : 'No seleccionado'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Kilometraje</span>
                  <span className={styles.summaryValue}>{km || '-'} km</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Combustible</span>
                  <span className={styles.summaryValue}>
                    {FUEL_LEVELS.find((f) => f.value === fuelLevel)?.label || '-'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Urgencia</span>
                  <span className={styles.summaryValue}>{urgencia}</span>
                </div>
                {selectedSymptoms.length > 0 && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Sintomas</span>
                    <span className={styles.summaryValue}>
                      {selectedSymptoms.join(', ')}
                    </span>
                  </div>
                )}
                {problema && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Problema</span>
                    <span className={styles.summaryValue}>{problema}</span>
                  </div>
                )}
              </div>

              <div className={styles.stepNav}>
                <Button variant="secondary" onClick={prev}>
                  Anterior
                </Button>
                <Button onClick={confirm} disabled={submitting}>
                  {submitting ? 'Registrando...' : 'Confirmar entrada'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
