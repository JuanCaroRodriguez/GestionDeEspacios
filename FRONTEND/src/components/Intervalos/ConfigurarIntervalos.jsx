import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiClock } from 'react-icons/fi';
import intervalosService from '../../api/services/intervalos.service';

/**
 * Componente reutilizable para configurar franjas horarias.
 *
 * Props:
 *  - intervalosIniciales: [{ hora_inicio, hora_fin }]  (opcional)
 *  - onConfirmar(intervalos): llamada al confirmar
 *  - onCancelar(): llamada al cancelar
 *  - titulo: string  (opcional)
 *  - modoModal: boolean — si true renderiza con fondo oscuro de modal
 */
const ConfigurarIntervalos = ({
    intervalosIniciales = [],
    onConfirmar,
    onCancelar,
    titulo = 'Configurar franjas horarias',
    modoModal = false,
}) => {
    const [modo, setModo] = useState('generacion'); // 'generacion' | 'manual'
    const [intervalos, setIntervalos] = useState(intervalosIniciales);

    // -- Generación automática --
    const [genInicio, setGenInicio] = useState('07:00');
    const [genFin, setGenFin]       = useState('18:00');
    const [genDur, setGenDur]       = useState(50);

    // -- Franja manual / edición --
    const [formInicio, setFormInicio] = useState('');
    const [formFin, setFormFin]       = useState('');
    const [editandoIdx, setEditandoIdx] = useState(null); // null = agregar nueva

    const [errorMsg, setErrorMsg] = useState('');
    const [errorForm, setErrorForm] = useState('');

    // Cuando llegan intervalosIniciales desde el padre
    useEffect(() => {
        setIntervalos(intervalosIniciales);
    }, []);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const toMin = (h) => {
        const [hh, mm] = h.split(':').map(Number);
        return hh * 60 + mm;
    };

    const ordenar = (list) =>
        [...list].sort((a, b) => toMin(a.hora_inicio) - toMin(b.hora_inicio));

    // ── Generación automática ─────────────────────────────────────────────────
    const handleGenerar = () => {
        setErrorMsg('');
        try {
            const generados = intervalosService.generarIntervalosRegulares(
                genInicio, genFin, Number(genDur)
            );
            if (generados.length === 0) {
                setErrorMsg('No se generaron intervalos. Verifica los parámetros.');
                return;
            }
            setIntervalos(ordenar(generados));
        } catch (e) {
            setErrorMsg(e.message);
        }
    };

    // ── Agregar / editar franja manual ────────────────────────────────────────
    const handleAgregarOEditar = () => {
        setErrorForm('');
        if (!formInicio || !formFin) {
            setErrorForm('Ingresa hora de inicio y hora de fin.');
            return;
        }
        const nueva = { hora_inicio: formInicio, hora_fin: formFin };
        const sinActual = editandoIdx !== null
            ? intervalos.filter((_, i) => i !== editandoIdx)
            : intervalos;

        // Validar la nueva franja contra las existentes
        const candidato = [...sinActual, nueva];
        const err = intervalosService.validarIntervalos(candidato);
        if (err) { setErrorForm(err); return; }

        const nuevo = editandoIdx !== null
            ? intervalos.map((iv, i) => (i === editandoIdx ? nueva : iv))
            : [...intervalos, nueva];

        setIntervalos(ordenar(nuevo));
        setFormInicio('');
        setFormFin('');
        setEditandoIdx(null);
        setErrorMsg('');
    };

    const handleEditar = (idx) => {
        setEditandoIdx(idx);
        setFormInicio(intervalos[idx].hora_inicio);
        setFormFin(intervalos[idx].hora_fin);
        setErrorForm('');
    };

    const handleEliminar = (idx) => {
        setIntervalos(intervalos.filter((_, i) => i !== idx));
        if (editandoIdx === idx) { setEditandoIdx(null); setFormInicio(''); setFormFin(''); }
        setErrorMsg('');
    };

    const handleCancelarEdicion = () => {
        setEditandoIdx(null);
        setFormInicio('');
        setFormFin('');
        setErrorForm('');
    };

    // ── Confirmar ─────────────────────────────────────────────────────────────
    const handleConfirmar = () => {
        setErrorMsg('');
        const err = intervalosService.validarIntervalos(intervalos);
        if (err) { setErrorMsg(err); return; }
        onConfirmar(ordenar(intervalos));
    };

    // ── Render ────────────────────────────────────────────────────────────────
    const contenido = (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: modoModal ? '0 25px 50px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        }}>
            {/* Título */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiClock /> {titulo}
                </h2>
                {onCancelar && (
                    <button onClick={onCancelar} style={btnSecondary}>
                        <FiX /> Cancelar
                    </button>
                )}
            </div>

            {/* Selector de modo */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {['generacion', 'manual'].map((m) => (
                    <button
                        key={m}
                        onClick={() => { setModo(m); setErrorMsg(''); setErrorForm(''); }}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '0.375rem',
                            border: '1px solid',
                            cursor: 'pointer',
                            fontWeight: modo === m ? 700 : 400,
                            backgroundColor: modo === m ? '#2563eb' : 'white',
                            color: modo === m ? 'white' : '#374151',
                            borderColor: modo === m ? '#2563eb' : '#d1d5db',
                            fontSize: '0.85rem',
                        }}
                    >
                        {m === 'generacion' ? 'Opción A — Intervalos regulares' : 'Opción B — Manual'}
                    </button>
                ))}
            </div>

            {/* ── Opción A: Generación automática ── */}
            {modo === 'generacion' && (
                <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#6b7280' }}>
                        Define el período y la duración de cada intervalo.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <label style={labelStyle}>
                            Hora inicio
                            <input type="time" value={genInicio} onChange={e => setGenInicio(e.target.value)} style={inputStyle} />
                        </label>
                        <label style={labelStyle}>
                            Hora fin
                            <input type="time" value={genFin} onChange={e => setGenFin(e.target.value)} style={inputStyle} />
                        </label>
                        <label style={labelStyle}>
                            Duración (min)
                            <input
                                type="number" min="1" value={genDur}
                                onChange={e => setGenDur(e.target.value)}
                                style={inputStyle}
                            />
                        </label>
                    </div>
                    <button onClick={handleGenerar} style={btnPrimary}>
                        Generar franjas automáticamente
                    </button>
                </div>
            )}

            {/* ── Opción B / formulario de franja ── */}
            <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>
                    {editandoIdx !== null ? 'Editando franja' : '+ Agregar franja'}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <label style={labelStyle}>
                        Hora inicio
                        <input type="time" value={formInicio} onChange={e => setFormInicio(e.target.value)} style={inputStyle} />
                    </label>
                    <label style={labelStyle}>
                        Hora fin
                        <input type="time" value={formFin} onChange={e => setFormFin(e.target.value)} style={inputStyle} />
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={handleAgregarOEditar} style={btnPrimary}>
                            {editandoIdx !== null ? <><FiCheck /> Guardar</> : <><FiPlus /> Agregar</>}
                        </button>
                        {editandoIdx !== null && (
                            <button onClick={handleCancelarEdicion} style={btnSecondary}>
                                <FiX />
                            </button>
                        )}
                    </div>
                </div>
                {errorForm && <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#dc2626' }}>{errorForm}</p>}
            </div>

            {/* ── Vista previa ── */}
            <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#374151' }}>
                    Vista previa ({intervalos.length} franja{intervalos.length !== 1 ? 's' : ''})
                </h3>

                {intervalos.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                        Aún no hay franjas. Usa las opciones anteriores para agregarlas.
                    </p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={th}>#</th>
                                <th style={th}>Hora inicio</th>
                                <th style={th}>Hora fin</th>
                                <th style={th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {intervalos.map((iv, idx) => (
                                <tr key={idx} style={{ background: editandoIdx === idx ? '#eff6ff' : 'white', borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={td}>{idx + 1}</td>
                                    <td style={td}>{intervalosService.formatearHora(iv.hora_inicio)}</td>
                                    <td style={td}>{intervalosService.formatearHora(iv.hora_fin)}</td>
                                    <td style={{ ...td, display: 'flex', gap: '0.4rem' }}>
                                        <button onClick={() => handleEditar(idx)} style={btnIconEdit} title="Editar">
                                            <FiEdit2 size={13} />
                                        </button>
                                        <button onClick={() => handleEliminar(idx)} style={btnIconDel} title="Eliminar">
                                            <FiTrash2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {errorMsg && (
                <p style={{ margin: '0.75rem 0 0', padding: '0.5rem 0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem', fontSize: '0.82rem', color: '#dc2626' }}>
                    {errorMsg}
                </p>
            )}

            {/* Confirmar */}
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleConfirmar} style={{ ...btnPrimary, padding: '0.6rem 1.5rem', fontWeight: 700 }}>
                    <FiCheck /> Confirmar franjas horarias
                </button>
            </div>
        </div>
    );

    if (modoModal) {
        return (
            <div style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 99999, padding: '1rem',
            }}>
                {contenido}
            </div>
        );
    }

    return contenido;
};

// ── Estilos inline compartidos ──────────────────────────────────────────────

const btnPrimary = {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.45rem 0.9rem', background: '#2563eb', color: 'white',
    border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: 600,
};

const btnSecondary = {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.45rem 0.9rem', background: '#f1f5f9', color: '#374151',
    border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer',
    fontSize: '0.82rem',
};

const btnIconEdit = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '26px', height: '26px', background: '#eff6ff', color: '#2563eb',
    border: '1px solid #bfdbfe', borderRadius: '0.3rem', cursor: 'pointer',
};

const btnIconDel = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '26px', height: '26px', background: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca', borderRadius: '0.3rem', cursor: 'pointer',
};

const labelStyle = {
    display: 'flex', flexDirection: 'column', gap: '0.25rem',
    fontSize: '0.8rem', fontWeight: 600, color: '#374151',
};

const inputStyle = {
    padding: '0.4rem 0.5rem', border: '1px solid #d1d5db',
    borderRadius: '0.375rem', fontSize: '0.85rem', color: '#111827',
};

const th = {
    padding: '0.5rem 0.75rem', textAlign: 'left',
    fontWeight: 600, color: '#6b7280', fontSize: '0.78rem',
    textTransform: 'uppercase', letterSpacing: '0.05em',
};

const td = { padding: '0.5rem 0.75rem', verticalAlign: 'middle' };

export default ConfigurarIntervalos;
