import React from 'react';
import { FiX } from 'react-icons/fi';

const ModalReserva = ({ 
    show, 
    onClose, 
    selectedSpace, 
    selectedSlots, 
    reservaMotivo, 
    setReservaMotivo, 
    onConfirm, 
    loadingReserva,
    session 
}) => {
    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0.5rem',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                        Confirmar Reserva
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Información del espacio */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.375rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                            Espacio
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{selectedSpace?.nombre}</p>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {selectedSpace?.bloque} - Piso {selectedSpace?.piso} - Salón {selectedSpace?.salon}
                        </p>
                    </div>

                    {/* Franjas seleccionadas */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.375rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                            Franjas seleccionadas
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {selectedSlots.map((slot, index) => (
                                <div key={index} style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                                    {slot.day} - {slot.slot}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Campo de motivo */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                            Motivo de la reserva *
                        </label>
                        <textarea
                            value={reservaMotivo}
                            onChange={(e) => setReservaMotivo(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                resize: 'vertical'
                            }}
                            rows="3"
                            placeholder="Ej: Clase de matemáticas, Reunión de equipo, Estudio personal..."
                            required
                        />
                    </div>

                    {/* Información adicional */}
                    <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '0.375rem' }}>
                        <p style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
                            <strong>Tipo:</strong> Ocasional<br/>
                            <strong>Usuario:</strong> {session?.user?.nombre}<br/>
                            <strong>Empresa:</strong> {session?.user?.id_empresa}
                        </p>
                    </div>
                </div>

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '0.5rem 1rem',
                            backgroundColor: '#e5e7eb',
                            color: '#1f2937',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!reservaMotivo.trim() || loadingReserva}
                        style={{
                            flex: 1,
                            padding: '0.5rem 1rem',
                            backgroundColor: (!reservaMotivo.trim() || loadingReserva) ? '#9ca3af' : '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: (!reservaMotivo.trim() || loadingReserva) ? 'not-allowed' : 'pointer',
                            opacity: (!reservaMotivo.trim() || loadingReserva) ? 0.5 : 1
                        }}
                    >
                        {loadingReserva ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{
                                    width: '1rem',
                                    height: '1rem',
                                    border: '2px solid white',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    marginRight: '0.5rem'
                                }}></div>
                                Creando...
                            </div>
                        ) : (
                            'Confirmar Reserva'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalReserva;
