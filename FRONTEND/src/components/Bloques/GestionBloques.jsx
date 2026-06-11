import { useState, useEffect } from 'react';
import bloquesService from '../../api/services/bloques.service';

const GestionBloques = ({ empresa }) => {
    const [bloques, setBloques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCrearBloque, setShowCrearBloque] = useState(false);
    const [selectedBloque, setSelectedBloque] = useState(null);

    // Formulario para crear bloque
    const [bloqueForm, setBloqueForm] = useState({
        nombre: ''
    });

    // Formulario para añadir piso
    const [pisoForm, setPisoForm] = useState({
        numero: 1,
        cantidadSalones: 4
    });

    useEffect(() => {
        if (empresa?.id) {
            cargarBloques();
        }
    }, [empresa]);

    const cargarBloques = async () => {
        try {
            setLoading(true);
            const data = await bloquesService.getByIdEmpresa(empresa.id);
            setBloques(data);
        } catch (error) {
            console.error('Error al cargar bloques:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCrearBloque = async (e) => {
        e.preventDefault();
        
        if (!bloqueForm.nombre.trim()) {
            alert('El nombre del bloque es obligatorio');
            return;
        }

        try {
            const nuevoBloque = await bloquesService.create({
                nombre: bloqueForm.nombre.trim(),
                id_empresa: empresa.id
            });
            
            setBloques([...bloques, nuevoBloque]);
            setBloqueForm({ nombre: '' });
            setShowCrearBloque(false);
        } catch (error) {
            console.error('Error al crear bloque:', error);
            alert('Error al crear el bloque');
        }
    };

    const handleAddPiso = async (bloqueId) => {
        try {
            await bloquesService.addPiso(bloqueId, {
                numero: pisoForm.numero,
                cantidadSalones: pisoForm.cantidadSalones
            });
            
            await cargarBloques();
            setPisoForm({ numero: 1, cantidadSalones: 4 });
        } catch (error) {
            console.error('Error al añadir piso:', error);
            alert('Error al añadir el piso');
        }
    };

    const handleRemovePiso = async (bloqueId, numeroPiso) => {
        if (!confirm(`¿Estás seguro de eliminar el piso ${numeroPiso}?`)) {
            return;
        }

        try {
            await bloquesService.removePiso(bloqueId, numeroPiso);
            await cargarBloques();
        } catch (error) {
            console.error('Error al eliminar piso:', error);
            alert('Error al eliminar el piso');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-gray-600">Cargando bloques...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">🏗️ Gestión de Bloques</h2>
                <button
                    onClick={() => setShowCrearBloque(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Nuevo Bloque
                </button>
            </div>

            {/* Formulario crear bloque */}
            {showCrearBloque && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Crear Nuevo Bloque</h3>
                    <form onSubmit={handleCrearBloque} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Bloque
                            </label>
                            <input
                                type="text"
                                value={bloqueForm.nombre}
                                onChange={(e) => setBloqueForm({ nombre: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ej: Bloque A"
                                required
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Crear Bloque
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCrearBloque(false);
                                    setBloqueForm({ nombre: '' });
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de bloques */}
            {bloques.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-lg font-medium">No hay bloques configurados</p>
                        <p className="text-sm mt-1">Crea tu primer bloque para comenzar</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bloques.map(bloque => (
                        <div key={bloque.id} className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{bloque.nombre}</h3>
                                    <div className="text-sm text-gray-500">
                                        {bloque.pisos?.length || 0} pisos
                                    </div>
                                </div>

                                {/* Lista de pisos */}
                                <div className="space-y-3 mb-4">
                                    {bloque.pisos?.length === 0 ? (
                                        <p className="text-sm text-gray-500">Sin pisos configurados</p>
                                    ) : (
                                        bloque.pisos.map(piso => (
                                            <div key={piso.numero} className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-medium text-sm">Piso {piso.numero}</span>
                                                        <span className="text-sm text-gray-500 ml-2">
                                                            ({piso.cantidadSalones} salones)
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemovePiso(bloque.id, piso.numero)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-600">
                                                    Salones: {piso.salones?.map(s => s.numero).join(', ') || 'Sin configurar'}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Formulario añadir piso */}
                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Añadir Piso</h4>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={pisoForm.numero}
                                            onChange={(e) => setPisoForm(prev => ({ ...prev, numero: parseInt(e.target.value) || 1 }))}
                                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                            placeholder="Piso"
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={pisoForm.cantidadSalones}
                                            onChange={(e) => setPisoForm(prev => ({ ...prev, cantidadSalones: parseInt(e.target.value) || 1 }))}
                                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                                            placeholder="Salones"
                                        />
                                        <button
                                            onClick={() => handleAddPiso(bloque.id)}
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GestionBloques;
