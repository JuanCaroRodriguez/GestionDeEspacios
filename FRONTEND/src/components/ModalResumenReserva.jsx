import React from 'react';
import { FiX, FiCheckCircle, FiMapPin, FiClock, FiUser, FiFileText, FiTag, FiCalendar } from 'react-icons/fi';

const ModalResumenReserva = ({ show, onClose, resumen }) => {
    if (!show || !resumen) return null;

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const [year, month, day] = fechaStr.split('-');
        const fecha = new Date(Number(year), Number(month) - 1, Number(day));
        return fecha.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const estadoColor = {
        'Reservada': { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
        'Pendiente': { bg: '#fef9c3', text: '#854d0e', dot: '#ca8a04' },
        'Cancelada': { bg: '#fee2e2', text: '#991b1b', dot: '#dc2626' },
    };

    const colores = estadoColor[resumen.estado] || estadoColor['Reservada'];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                maxWidth: '480px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                    borderRadius: '0.75rem 0.75rem 0 0',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '2.5rem',
                            height: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FiCheckCircle size={22} color="white" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'white' }}>
                                Reserva Registrada
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.15rem' }}>
                                Resumen de tu reserva
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '2rem',
                            height: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

                    {/* Estado */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            backgroundColor: colores.bg,
                            color: colores.text,
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            padding: '0.35rem 0.9rem',
                            borderRadius: '9999px'
                        }}>
                            <span style={{
                                width: '0.5rem',
                                height: '0.5rem',
                                borderRadius: '50%',
                                backgroundColor: colores.dot,
                                display: 'inline-block'
                            }}></span>
                            {resumen.estado}
                        </span>
                    </div>

                    {/* Espacio */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '0.875rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiMapPin size={15} color="#3b82f6" />
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Espacio
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                            {resumen.espacio}
                        </p>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                            {resumen.bloque && `${resumen.bloque} · `}
                            {resumen.piso && `Piso ${resumen.piso} · `}
                            Salón {resumen.salon}
                        </p>
                    </div>

                    {/* Fecha */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '0.875rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiCalendar size={15} color="#3b82f6" />
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Fecha
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.925rem', fontWeight: '500', color: '#1e293b', textTransform: 'capitalize' }}>
                            {formatearFecha(resumen.fecha)}
                        </p>
                    </div>

                    {/* Horario */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '0.875rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiClock size={15} color="#3b82f6" />
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Horario
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.925rem', fontWeight: '500', color: '#1e293b' }}>
                            {resumen.horaInicio} – {resumen.horaFin}
                        </p>
                        {resumen.franjas && resumen.franjas.length > 1 && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                {resumen.franjas.map((f, i) => (
                                    <span key={i} style={{
                                        fontSize: '0.775rem',
                                        color: '#64748b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                    }}>
                                        <span style={{ color: '#3b82f6' }}>·</span>
                                        {f.day} — {f.slot}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Motivo */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '0.875rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiFileText size={15} color="#3b82f6" />
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Motivo
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: '1.5' }}>
                            {resumen.motivo}
                        </p>
                    </div>

                    {/* Tipo y Usuario */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            padding: '0.875rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                <FiTag size={14} color="#3b82f6" />
                                <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Tipo
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500', color: '#1e293b', textTransform: 'capitalize' }}>
                                {resumen.tipo}
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            padding: '0.875rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                <FiUser size={14} color="#3b82f6" />
                                <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Usuario
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500', color: '#1e293b' }}>
                                {resumen.usuario}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '0.65rem',
                            backgroundColor: '#1d4ed8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalResumenReserva;
