import { useState } from 'react';
import empresasService from '../../api/services/empresas.service';
import bloquesService from '../../api/services/bloques.service';
import { FiInfo } from "react-icons/fi";
import SweetAlert2 from 'react-sweetalert2';   

const CrearEmpresa = ({ onEmpresaCreada, onCancelar, fullscreen = true }) => {
    const [paso, setPaso] = useState(1); // 1: Datos empresa, 2: Crear bloques
    const [empresaData, setEmpresaData] = useState({
        nombre: '',
        nit: ''
    });
    const [bloques, setBloques] = useState([]);
    const [bloqueForm, setBloqueForm] = useState({
        nombre: ''
    });
    const [pisosForms, setPisosForms] = useState({}); // Objeto con el formulario de pisos por bloque
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [swalProps, setSwalProps] = useState({});
    const [alertKey, setAlertKey] = useState(0); // Key para forzar el re-render

    const handleChangeEmpresa = (e) => {
        const { name, value } = e.target;
        setEmpresaData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error al escribir
        if (error) setError('');
    };

    const handleChangeBloque = (e) => {
        const { name, value } = e.target;
        setBloqueForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangePiso = (bloqueId, e) => {
        const { name, value } = e.target;
        setPisosForms(prev => ({
            ...prev,
            [bloqueId]: {
                ...prev[bloqueId],
                [name]: value === '' ? '' : parseInt(value) || ''
            }
        }));
    };

    const handleSiguienteEmpresa = async (e) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (!empresaData.nombre.trim()) {
            setError('El nombre de la empresa es obligatorio');
            return;
        }
        
        if (!empresaData.nit.trim()) {
            setError('El NIT de la empresa es obligatorio');
            return;
        }

        // Validar formato básico de NIT (mínimo 5 caracteres)
        if (empresaData.nit.trim().length < 5) {
            setError('El NIT debe tener al menos 5 caracteres');
            return;
        }

        setError('');
        setPaso(2);
    };

    const handleCrearBloque = async () => {
        if (!bloqueForm.nombre.trim()) {
            setError('El nombre del bloque es obligatorio');
            return;
        }

        // Validar que no exista un bloque con el mismo nombre (ignorando mayúsculas/minúsculas y espacios)
        const nombreNormalizado = bloqueForm.nombre.trim().toLowerCase();
        const bloqueExistente = bloques.find(bloque => 
            bloque.nombre.trim().toLowerCase() === nombreNormalizado
        );

        if (bloqueExistente) {
            setError(`Ya existe un bloque con el nombre "${bloqueForm.nombre.trim()}"`);
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Crear bloque temporal (no se guarda hasta el final)
            const nuevoBloque = {
                id: `temp-${Date.now()}`,
                nombre: bloqueForm.nombre.trim(),
                pisos: []
            };

            const nuevoBloqueId = nuevoBloque.id;
            
            setBloques([...bloques, nuevoBloque]);
            setBloqueForm({ nombre: '' });
            
            // Inicializar formulario de pisos para este bloque
            setPisosForms(prev => ({
                ...prev,
                [nuevoBloqueId]: {
                    numero: '',
                    cantidadSalones: ''
                }
            }));
        } catch (error) {
            console.error('Error al crear bloque:', error);
            setError('Error al crear el bloque');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPiso = (bloqueId) => {
        const bloqueIndex = bloques.findIndex(b => b.id === bloqueId);
        if (bloqueIndex === -1) return;

        const bloqueActualizado = { ...bloques[bloqueIndex] };
        const pisoFormActual = pisosForms[bloqueId] || { numero: '', cantidadSalones: '', capacidadSalones: 30 };
        
        // Validar que los campos no estén vacíos
        if (!pisoFormActual.numero || !pisoFormActual.cantidadSalones || !pisoFormActual.capacidadSalones) {
            setError('Debes ingresar el número de piso, cantidad de espacios y capacidad');
            return;
        }

        const numeroPiso = parseInt(pisoFormActual.numero);
        const cantidadSalones = parseInt(pisoFormActual.cantidadSalones);
        const capacidadSalones = parseInt(pisoFormActual.capacidadSalones);
        
        // Validar rangos
        if (numeroPiso < 1 || cantidadSalones < 1 || cantidadSalones > 20 || capacidadSalones < 1 || capacidadSalones > 200) {
            setError('El piso debe ser ≥1, salones entre 1-20 y capacidad entre 1-200');
            return;
        }
        
        // Verificar si el piso ya existe
        const pisoExistente = bloqueActualizado.pisos.find(p => p.numero === numeroPiso);
        if (pisoExistente) {
            setError('El piso ya existe en este bloque');
            return;
        }

        // Añadir piso
        const nuevoPiso = {
            numero: numeroPiso,
            cantidadSalones: cantidadSalones,
            capacidadSalones: capacidadSalones,
            capacidadesSalones: Array.from({ length: cantidadSalones }, () => capacidadSalones),
            salones: Array.from({ length: cantidadSalones }, (_, i) => ({
                numero: (i + 1).toString().padStart(2, '0'),
                nombre: undefined,
                capacidad: capacidadSalones
            }))
        };

        bloqueActualizado.pisos.push(nuevoPiso);
        bloqueActualizado.pisos.sort((a, b) => a.numero - b.numero);

        const nuevosBloques = [...bloques];
        nuevosBloques[bloqueIndex] = bloqueActualizado;
        setBloques(nuevosBloques);

        // Resetear el formulario de pisos de este bloque a vacío
        setPisosForms(prev => ({
            ...prev,
            [bloqueId]: {
                numero: '',
                cantidadSalones: '',
                capacidadSalones: ''
            }
        }));
        setError('');
    };

    const handleRemovePiso = (bloqueId, numeroPiso) => {
        const bloqueIndex = bloques.findIndex(b => b.id === bloqueId);
        if (bloqueIndex === -1) return;

        const bloqueActualizado = { ...bloques[bloqueIndex] };
        bloqueActualizado.pisos = bloqueActualizado.pisos.filter(p => p.numero !== numeroPiso);

        const nuevosBloques = [...bloques];
        nuevosBloques[bloqueIndex] = bloqueActualizado;
        setBloques(nuevosBloques);
    };

    const handleRemoveBloque = (bloqueId) => {
        setBloques(bloques.filter(b => b.id !== bloqueId));
        
        // Limpiar el formulario de pisos de este bloque
        setPisosForms(prev => {
            const newForms = { ...prev };
            delete newForms[bloqueId];
            return newForms;
        });
        
        setError('');
    };

    const handleFinalizar = async () => {
        if (bloques.length === 0) {
            setError('Debes crear al menos un bloque');
            return;
        }

        // Verificar que todos los bloques tengan al menos un piso
        const bloquesSinPisos = bloques.filter(b => b.pisos.length === 0);
        if (bloquesSinPisos.length > 0) {
            setError('Todos los bloques deben tener al menos un piso');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // 1. Crear empresa
            const empresaCreada = await empresasService.create({
                nombre: empresaData.nombre.trim(),
                nit: empresaData.nit.trim()
            });

            // 2. Actualizar superadmin con id_empresa
            const session = JSON.parse(localStorage.getItem('session'));
            
            
            if (session?.user?.id) {
                try {
                    
                    
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/superadmin/${session.user.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id_empresa: empresaCreada.id
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error en respuesta del servidor:', errorData);
                        throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`);
                    }
                    
                    const updatedSuperAdmin = await response.json();
                    
                    
                    // Actualizar la sesión local
                    session.user.id_empresa = empresaCreada.id;
                    localStorage.setItem('session', JSON.stringify(session));
                    
                } catch (updateError) {
                    console.error('Error al actualizar superadmin:', updateError);
                    setError(`Error al actualizar superadmin: ${updateError.message}`);
                    // No continuar si falla la actualización del superadmin
                    return;
                }
            } else {
                console.error('No se encontró sesión o ID de usuario');
                setError('No se encontró la sesión del usuario');
                return;
            }

            // 3. Crear bloques
            for (const bloque of bloques) {
                await bloquesService.create({
                    nombre: bloque.nombre,
                    id_empresa: empresaCreada.id,
                    pisos: bloque.pisos
                });
            }

            // 4. Limpiar sesión y redirigir al login
            localStorage.removeItem('session');
            
            // Mostrar mensaje de éxito con SweetAlert2
            setSwalProps({
                show: true,
                title: '¡Empresa Creada Exitosamente!',
                text: 'Tu empresa y bloques han sido configurados correctamente. Por favor, inicia sesión nuevamente para continuar.',
                icon: 'success',
                confirmButtonText: 'Ir al Login',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didClose: () => {
                    // Redirigir al login cuando se cierre el modal
                    window.location.href = '/auth';
                }
            });
            setAlertKey(alertKey + 1);
        } catch (err) {
            console.error('Error al finalizar configuración:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Error al guardar la configuración. Por favor, intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Renderizar paso 1: Datos de la empresa
    if (paso === 1) {
        return (
            <div className={fullscreen ? "min-h-screen bg-gray-50 flex items-center justify-center p-4" : ""}>
                <style>{`
                    /* Ocultar flechas de inputs tipo number */
                    input[type=number]::-webkit-inner-spin-button,
                    input[type=number]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    input[type=number] {
                        -moz-appearance: textfield;
                    }
                `}</style>
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                    {/* Indicadores de paso */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                            <div className="w-16 h-1 bg-blue-600"></div>
                            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Crear Empresa</h2>
                        <p className="text-gray-600 mt-2">
                            Paso 1: Información básica de la empresa
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-700 text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSiguienteEmpresa} className="space-y-6">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de la Empresa
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={empresaData.nombre}
                                onChange={handleChangeEmpresa}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Ej: Universidad Del medio dia"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="nit" className="block text-sm font-medium text-gray-700 mb-2">
                                NIT
                            </label>
                            <input
                                type="text"
                                id="nit"
                                name="nit"
                                value={empresaData.nit}
                                onChange={handleChangeEmpresa}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Ej: 900123456-7"
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Número de Identificación Tributaria
                            </p>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            {onCancelar && (
                                <button
                                    type="button"
                                    onClick={onCancelar}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                Siguiente
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Renderizar paso 2: Crear bloques
    return (
        <>
            <div className={fullscreen ? "min-h-screen bg-gray-50 flex items-center justify-center p-4" : ""}>
            <style>{`
                /* Ocultar flechas de inputs tipo number */
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `}</style>
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl">
                {/* Indicadores de paso */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">✓</div>
                        <div className="w-16 h-1 bg-blue-600"></div>
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Configurar Bloques</h2>
                    <p className="text-gray-600 mt-2">
                        Paso 2: Crea los bloques, pisos y espacios de tu empresa
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-700 text-sm">{error}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Formulario para crear bloque */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Nuevo Bloque</h3>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                name="nombre"
                                value={bloqueForm.nombre}
                                onChange={handleChangeBloque}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nombre del bloque (Ej: Bloque A)"
                                disabled={loading}
                            />
                            <button
                                onClick={handleCrearBloque}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                + Añadir Bloque
                            </button>
                        </div>
                    </div>

                    {/* Lista de bloques */}
                    {bloques.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-lg font-medium">No hay bloques creados</p>
                            <p className="text-sm mt-1">Crea tu primer bloque para continuar</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bloques.map(bloque => (
                                <div key={bloque.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900">{bloque.nombre}</h4>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">{bloque.pisos.length} pisos</span>
                                            <button
                                                onClick={() => handleRemoveBloque(bloque.id)}
                                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                title="Eliminar bloque"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Lista de pisos */}
                                    <div className="space-y-2 mb-3">
                                        {bloque.pisos.length === 0 ? (
                                            <p className="text-sm text-gray-500">Sin pisos</p>
                                        ) : (
                                            bloque.pisos.map(piso => (
                                                <div key={piso.numero} className="bg-gray-50 rounded p-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">Piso {piso.numero}</span>
                                                        <button
                                                            onClick={() => handleRemovePiso(bloque.id, piso.numero)}
                                                            className="text-red-500 hover:text-red-700 text-xs"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        <div>{piso.cantidadSalones} salones</div>
                                                        {piso.capacidadSalones && (
                                                            <div className="text-blue-600">
                                                                {piso.capacidadSalones} personas c/u (total: {piso.cantidadSalones * piso.capacidadSalones})
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Formulario añadir piso */}
                                    <div className="border-t pt-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <label className="text-xs font-medium text-gray-600 w-19">#Piso:</label>
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => {
                                                            const currentValue = (pisosForms[bloque.id]?.numero) || '';
                                                            const newValue = currentValue === '' ? 1 : Math.max(1, parseInt(currentValue) - 1);
                                                            handleChangePiso(bloque.id, { target: { name: 'numero', value: newValue } });
                                                        }}
                                                        className="px-1 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-l"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        name="numero"
                                                        min="1"
                                                        value={pisosForms[bloque.id]?.numero || ''}
                                                        onChange={(e) => handleChangePiso(bloque.id, e)}
                                                        className="w-12 px-2 py-1 text-sm border-t border-b border-gray-300 text-center"
                                                        placeholder=""
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const currentValue = (pisosForms[bloque.id]?.numero) || '';
                                                            const newValue = currentValue === '' ? 1 : parseInt(currentValue) + 1;
                                                            handleChangePiso(bloque.id, { target: { name: 'numero', value: newValue } });
                                                        }}
                                                        className="px-1 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-r"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <label className="text-xs font-medium text-gray-600 w-19">Total de espacios del piso:</label>
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => {
                                                            const currentValue = (pisosForms[bloque.id]?.cantidadSalones) || '';
                                                            const newValue = currentValue === '' ? 1 : Math.max(1, parseInt(currentValue) - 1);
                                                            handleChangePiso(bloque.id, { target: { name: 'cantidadSalones', value: newValue } });
                                                        }}
                                                        className="px-1 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-l"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        name="cantidadSalones"
                                                        min="1"
                                                        max="20"
                                                        value={pisosForms[bloque.id]?.cantidadSalones || ''}
                                                        onChange={(e) => handleChangePiso(bloque.id, e)}
                                                        className="w-16 px-2 py-1 text-sm border-t border-b border-gray-300 text-center"
                                                        placeholder=""
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const currentValue = (pisosForms[bloque.id]?.cantidadSalones) || '';
                                                            const newValue = currentValue === '' ? 1 : Math.min(20, parseInt(currentValue) + 1);
                                                            handleChangePiso(bloque.id, { target: { name: 'cantidadSalones', value: newValue } });
                                                        }}
                                                        className="px-1 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-r"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2 mt-2">
                                                <label className="text-xs font-medium text-gray-600 w-12">Capacidad:</label>
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => {
                                                            const currentValue = (pisosForms[bloque.id]?.capacidadSalones) || '';
                                                            const newValue = currentValue === '' ? 1 : Math.max(1, parseInt(currentValue) - 1);
                                                            handleChangePiso(bloque.id, { target: { name: 'capacidadSalones', value: newValue } });
                                                        }}
                                                        className="px-1 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-l"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        name="capacidadSalones"
                                                        min="1"
                                                        max="200"
                                                        value={pisosForms[bloque.id]?.capacidadSalones || ''}
                                                        onChange={(e) => handleChangePiso(bloque.id, e)}
                                                        className="w-16 px-2 py-1 text-sm border-t border-b border-gray-300 text-center"
                                                        placeholder="30"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const currentValue = (pisosForms[bloque.id]?.capacidadSalones) || '';
                                                            const newValue = currentValue === '' ? 1 : Math.min(200, parseInt(currentValue) + 1);
                                                            handleChangePiso(bloque.id, { target: { name: 'capacidadSalones', value: newValue } });
                                                        }}
                                                        className="px-1 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-r"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="text-xs text-gray-500 ml-2">personas c/u</span>
                                            </div>
                                            
                                            <div className="text-xs text-blue-600 mt-1 text-center flex">
                                                <FiInfo  className="w-5 h-5" />
                                                Después podrá modificar la capacidad de cada espacio individualmente
                                            </div>
                                            
                                            <button
                                                onClick={() => handleAddPiso(bloque.id)}
                                                className="w-full px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors mt-2"
                                            >
                                                + Añadir Piso
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Botones de navegación */}
                    <div className="flex space-x-3 pt-4 border-t">
                        <button
                            onClick={() => setPaso(1)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Anterior
                        </button>
                        <button
                            onClick={handleFinalizar}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || bloques.length === 0}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </span>
                            ) : (
                                'Finalizar Configuración'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
            <SweetAlert2 key={alertKey} {...swalProps} />
        </>
    );
};

export default CrearEmpresa;
