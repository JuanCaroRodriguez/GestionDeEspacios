import { useState, useEffect } from 'react';

import DashboardLayout from '@components/Layout/DashboardLayout';

import espaciosService from '@api/services/espacios.service';

import bloquesService from '@api/services/bloques.service';

import { departamentosService } from '@api/services/departamentos.service';

import useSession from '../context/Auth/useSession';

import { toast } from 'sonner';

import { FiEdit2, FiTrash2, FiHome, FiLogOut } from 'react-icons/fi';
import { PiBroom } from "react-icons/pi";
import { RiRefreshLine } from "react-icons/ri";
import { IoIosAddCircleOutline } from "react-icons/io";

const GestionEspacios = () => {

    const { session } = useSession();

    const [espacios, setEspacios] = useState([]);

    const [bloques, setBloques] = useState([]);

    const [departamentos, setDepartamentos] = useState([]);

    const [selectedBloque, setSelectedBloque] = useState('');

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [espacioToDelete, setEspacioToDelete] = useState(null);

    const [formData, setFormData] = useState({

        id: '',

        nombre: '',

        tipo: '',

        capacidad: '',

        bloque: '',

        piso: '',

        salon: '',

        departamento: 'no-aplica'

    });

    const [editFormData, setEditFormData] = useState({

        id: '',

        nombre: '',

        tipo: '',

        capacidad: '',

        bloque: '',

        piso: '',

        salon: '',

        departamento: 'no-aplica'

    });

    const [currentPage, setCurrentPage] = useState(1);

    const [itemsPerPage] = useState(10);

    const [filterUbicacion, setFilterUbicacion] = useState('');

    const [filterBloque, setFilterBloque] = useState('');

    const [filterPiso, setFilterPiso] = useState('');

    const [filterDepartamento, setFilterDepartamento] = useState('');

    const [filterTipo, setFilterTipo] = useState('');

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [createdSpace, setCreatedSpace] = useState(null);

    const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);



    // Cargar datos desde la API

    useEffect(() => {

        const fetchData = async () => {

            try {

                setLoading(true);

                setError(null);

                

                // Obtener id_empresa del usuario logueado

                const idEmpresa = session?.user?.id_empresa;

                if (!idEmpresa) {

                    setError('No se encontró la empresa del usuario');

                    return;

                }

                

                // Cargar espacios, bloques y departamentos en paralelo

                const [espaciosData, bloquesData, departamentosData] = await Promise.all([

                    espaciosService.getByEmpresa(idEmpresa),

                    bloquesService.getByIdEmpresa(idEmpresa),

                    departamentosService.getByEmpresa(idEmpresa)

                ]);

                

                setEspacios(espaciosData);

                setBloques(bloquesData);

                setDepartamentos(departamentosData);

                console.log('Espacios cargados:', espaciosData);

                console.log('Bloques cargados:', bloquesData);

                console.log('Empresa:', idEmpresa);

            } catch (err) {

                console.error('Error al cargar datos:', err);

                setError('No se pudieron cargar los datos. Por favor, intente nuevamente.');

                

            } finally {

                setLoading(false);

            }

        };



        fetchData();

    }, [session]);



    // Función helper para obtener el nombre del bloque por ID

    const getNombreBloque = (bloqueId) => {

        const bloque = bloques.find(b => b.id === bloqueId);

        return bloque ? bloque.nombre : bloqueId;

    };

    // Función helper para obtener el nombre del departamento por ID

    const getNombreDepartamento = (departamentoId) => {

        if (!departamentoId || departamentoId === 'no-aplica') return 'No aplica';

        const departamento = departamentos.find(d => d.id === departamentoId);

        return departamento ? departamento.nombre : departamentoId;

    };



    const handleCreateEspacio = async () => {

        // Validaciones

        if (!formData.nombre || !formData.tipo || !formData.capacidad || !formData.bloque || !formData.piso || !formData.salon) {

            toast.error('Por favor complete todos los campos');

            return;

        }

        // Validar que el espacio no esté duplicado
        if (isEspacioDuplicado()) {
            toast.error(`El espacio ${formData.salon} ya existe en el bloque ${formData.bloque} y piso ${formData.piso}`);
            return;
        }



        try {

            // Generar un ID único automáticamente

            const generatedId = `${formData.tipo.toLowerCase()}-${Date.now()}`;



            // Calcular código del espacio automáticamente: [numeropiso][0 si espacio<10][numeroespacio]

            const salonFormato = parseInt(formData.salon) < 10 

                ? `${formData.piso}0${formData.salon}` 

                : `${formData.piso}${formData.salon}`;



            // Crear nuevo espacio en la API

            console.log("Datos de creación: ",formData)
            const nuevoEspacio = {

                ...formData,

                id: generatedId,

                capacidad: parseInt(formData.capacidad),

                piso: parseInt(formData.piso),

                salon: salonFormato, // Usar el código calculado

                id_empresa: session?.user?.id_empresa,

                disponible: true,
                departamento :formData.departamento

            };



            const response = await espaciosService.create(nuevoEspacio);

            console.log('Espacio creado:', response);

            

            // Actualizar estado local

            setEspacios([...espacios, response]);

            setCreatedSpace(response);

            setShowModal(false);

            setShowConfirmModal(true);

            setFormData({

                id: '',

                nombre: '',

                tipo: '',

                capacidad: '',

                bloque: '',

                piso: '',

                salon: ''

            });

            

            toast.success('Espacio creado exitosamente');

        } catch (error) {

            console.error('Error al crear espacio:', error);

            toast.error('Error al crear el espacio. Por favor, intente nuevamente.');

        }

    };



    const handleToggleDisponibilidad = async (id) => {

        try {

            await espaciosService.toggleDisponibilidad(id);

            // Actualizar estado local

            setEspacios(espacios.map(espacio => 

                espacio.id === id ? { ...espacio, disponible: !espacio.disponible } : espacio

            ));

            console.log('Disponibilidad actualizada para el espacio:', id);

        } catch (error) {

            console.error('Error al cambiar disponibilidad:', error);

            toast.error('Error al cambiar la disponibilidad del espacio');

        }

    };



    const handleDeleteEspacio = (id) => {
        setEspacioToDelete(id);
        setShowDeleteConfirmModal(true);
    };

    const confirmDeleteEspacio = async () => {
        try {
            await espaciosService.delete(espacioToDelete);
            setEspacios(espacios.filter(espacio => espacio.id !== espacioToDelete));
            console.log('Espacio eliminado:', espacioToDelete);
            
            // Cerrar modal de confirmación y mostrar modal de éxito
            setShowDeleteConfirmModal(false);
            setShowSuccessModal(true);
            
            // Resetear el espacio a eliminar
            setEspacioToDelete(null);
        } catch (error) {
            console.error('Error al eliminar espacio:', error);
            toast.error('Error al eliminar el espacio');
            setShowDeleteConfirmModal(false);
            setEspacioToDelete(null);
        }
    };

    const cancelDeleteEspacio = () => {
        setShowDeleteConfirmModal(false);
        setEspacioToDelete(null);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };



    const handleEditEspacio = (espacio) => {

        // Extraer número de espacio del código (ej: "101" → "1", "110" → "10")

        let numeroEspacio = '';

        if (espacio.salon) {

            const salonStr = espacio.salon.toString();

            // Si el código tiene 3 dígitos y el segundo es 0, extraer el último dígito

            if (salonStr.length === 3 && salonStr[1] === '0') {

                numeroEspacio = salonStr[2];

            } else {

                // Extraer los últimos dígitos después del piso

                numeroEspacio = salonStr.slice(1);

            }

        }



        const departamentoValor = espacio.departamento || 'no-aplica';
        setEditFormData({

            id: espacio.id,

            nombre: espacio.nombre,

            tipo: espacio.tipo,

            capacidad: espacio.capacidad.toString(),

            bloque: espacio.bloque || '',

            piso: espacio.piso?.toString() || '',

            salon: numeroEspacio,

            departamento: departamentoValor

        });

        // Establecer el bloque seleccionado para mostrar pisos correctos
        if (espacio.bloque) {
            setSelectedBloque(espacio.bloque);
        }

        setShowEditModal(true);

    };



    const handleUpdateEspacio = async () => {

        // Validaciones

        if (!editFormData.nombre || !editFormData.tipo || !editFormData.capacidad || !editFormData.bloque || !editFormData.piso || !editFormData.salon) {

            toast.error('Por favor complete todos los campos');

            return;

        }

        // Validar que el espacio no esté duplicado (excluyendo el espacio actual)
        if (isEditEspacioDuplicado()) {
            toast.error(`El espacio ${editFormData.salon} ya existe en el bloque ${editFormData.bloque} y piso ${editFormData.piso}`);
            return;
        }



        try {

            // Calcular código del espacio automáticamente: [numeropiso][0 si espacio<10][numeroespacio]

            const salonFormato = parseInt(editFormData.salon) < 10 

                ? `${editFormData.piso}0${editFormData.salon}` 

                : `${editFormData.piso}${editFormData.salon}`;



            // Actualizar espacio en la API
            console.log("Datos de edición:",editFormData)
            const espacioActualizado = {

                ...editFormData,

                capacidad: parseInt(editFormData.capacidad),

                piso: parseInt(editFormData.piso),

                salon: salonFormato,// Usar el código calculado
                
                departamento:editFormData.departamento

            };



            const response = await espaciosService.update(editFormData.id, espacioActualizado);

            console.log('Espacio actualizado:', response);

            

            // Actualizar estado local

            setEspacios(espacios.map(espacio => 

                espacio.id === editFormData.id ? response : espacio

            ));

            setShowEditModal(false);

            setEditFormData({

                id: '',

                nombre: '',

                tipo: '',

                capacidad: '',

                bloque: '',

                salon: '',

                departamento: 'no-aplica'

            });

            setShowEditModal(false);

            setShowEditConfirmModal(true);

            toast.success('Espacio actualizado exitosamente');

        } catch (error) {

            console.error('Error al actualizar espacio:', error);

            toast.error('Error al actualizar el espacio. Por favor, intente nuevamente.');

        }

    };



    const handleEditInputChange = (e) => {

        const { name, value } = e.target;

        // Si cambia el tipo y no es Laboratorio, establecer departamento a no-aplica
        if (name === 'tipo' && value !== 'Laboratorio') {
            setEditFormData({

                ...editFormData,

                [name]: value,

                departamento: 'no-aplica'

            });
        } else {
            setEditFormData({

                ...editFormData,

                [name]: value

            });
        }

    };

    // Manejar cambio de bloque para obtener pisos disponibles en edición
    const handleEditBloqueChange = (e) => {
        const bloqueId = e.target.value;
        
        // Actualizar editFormData
        setEditFormData({
            ...editFormData,
            bloque: bloqueId,
            piso: '', // Resetear piso al cambiar de bloque
            salon: '' // Resetear salon al cambiar de bloque
        });
    };

    // Obtener pisos del bloque seleccionado para edición
    const getEditPisosDisponibles = () => {
        if (!editFormData.bloque) return [];
        
        const bloque = bloques.find(b => b.id === editFormData.bloque);
        if (!bloque || !bloque.pisos) return [];
        
        return bloque.pisos.map(piso => piso.numero).sort((a, b) => a - b);
    };

    // Obtener salones disponibles para el piso seleccionado en edición
    const getEditSalonesDisponibles = () => {
        if (!editFormData.bloque || !editFormData.piso) return [];
        
        const bloque = bloques.find(b => b.id === editFormData.bloque);
        if (!bloque || !bloque.pisos) return [];
        
        const piso = bloque.pisos.find(p => p.numero === parseInt(editFormData.piso));
        if (!piso || !piso.salones) return [];
        
        return piso.salones.map(salon => salon.numero).sort();
    };

    // Validar si el espacio ya existe en el bloque y piso seleccionados (para edición)
    const isEditEspacioDuplicado = () => {
        if (!editFormData.bloque || !editFormData.piso || !editFormData.salon) return false;
        
        // Buscar espacios existentes en el mismo bloque y piso, excluyendo el espacio actual
        const espaciosExistentes = espacios.filter(espacio => 
            espacio.bloque === editFormData.bloque && 
            espacio.piso === parseInt(editFormData.piso) &&
            espacio.id !== editFormData.id // Excluir el espacio actual que se está editando
        );
        
        // Verificar si algún espacio existente tiene el mismo número de salon
        return espaciosExistentes.some(espacio => {
            // Extraer número de espacio del código (ej: "101" → "1", "110" → "10")
            if (espacio.salon) {
                const salonStr = espacio.salon.toString();
                if (salonStr.length === 3 && salonStr[1] === '0') {
                    return salonStr[2] === editFormData.salon;
                } else {
                    return salonStr.slice(1) === editFormData.salon;
                }
            }
            return false;
        });
    };



    const handleInputChange = (e) => {

        const { name, value } = e.target;

        // Si cambia el tipo y no es Laboratorio, establecer departamento a no-aplica
        if (name === 'tipo' && value !== 'Laboratorio') {
            setFormData({

                ...formData,

                [name]: value,

                departamento: 'no-aplica'

            });
        } else {
            setFormData({

                ...formData,

                [name]: value

            });
        }

    };

    // Manejar cambio de bloque para obtener pisos disponibles
    const handleBloqueChange = (e) => {
        const bloqueId = e.target.value;
        
        // Actualizar formData
        setFormData({
            ...formData,
            bloque: bloqueId,
            piso: '', // Resetear piso al cambiar de bloque
            salon: '' // Resetear salon al cambiar de bloque
        });

        // Actualizar selectedBloque
        setSelectedBloque(bloqueId);
    };

    // Obtener pisos del bloque seleccionado
    const getPisosDisponibles = () => {
        if (!selectedBloque) return [];
        
        const bloque = bloques.find(b => b.id === selectedBloque);
        if (!bloque || !bloque.pisos) return [];
        
        return bloque.pisos.map(piso => piso.numero).sort((a, b) => a - b);
    };

    // Obtener salones disponibles para el piso seleccionado
    const getSalonesDisponibles = () => {
        if (!selectedBloque || !formData.piso) return [];
        
        const bloque = bloques.find(b => b.id === selectedBloque);
        if (!bloque || !bloque.pisos) return [];
        
        const piso = bloque.pisos.find(p => p.numero === parseInt(formData.piso));
        if (!piso || !piso.salones) return [];
        
        return piso.salones.map(salon => salon.numero).sort();
    };

    // Validar si el espacio ya existe en el bloque y piso seleccionados
    const isEspacioDuplicado = () => {
        if (!selectedBloque || !formData.piso || !formData.salon) return false;
        
        // Buscar espacios existentes en el mismo bloque y piso
        const espaciosExistentes = espacios.filter(espacio => 
            espacio.bloque === selectedBloque && 
            espacio.piso === parseInt(formData.piso)
        );
        
        // Verificar si algún espacio existente tiene el mismo número de salon
        return espaciosExistentes.some(espacio => {
            // Extraer número de espacio del código (ej: "101" → "1", "110" → "10")
            if (espacio.salon) {
                const salonStr = espacio.salon.toString();
                if (salonStr.length === 3 && salonStr[1] === '0') {
                    return salonStr[2] === formData.salon;
                } else {
                    return salonStr.slice(1) === formData.salon;
                }
            }
            return false;
        });
    };

    // Obtener espacios existentes en el piso seleccionado
    const getEspaciosExistentesEnPiso = () => {
        if (!selectedBloque || !formData.piso) return [];
        
        const espaciosExistentes = espacios.filter(espacio => 
            espacio.bloque === selectedBloque && 
            espacio.piso === parseInt(formData.piso)
        );
        
        return espaciosExistentes.map(espacio => {
            // Extraer número de espacio del código
            if (espacio.salon) {
                const salonStr = espacio.salon.toString();
                if (salonStr.length === 3 && salonStr[1] === '0') {
                    return salonStr[2];
                } else {
                    return salonStr.slice(1);
                }
            }
            return '';
        }).sort((a, b) => parseInt(a) - parseInt(b));
    };



    // Filtrar espacios por bloque, piso y ubicación

    const filteredEspacios = espacios.filter(espacio => {

        // Filtro por bloque

        if (filterBloque && espacio.bloque !== filterBloque) {

            return false;

        }

        

        // Filtro por piso

        if (filterPiso && espacio.piso?.toString() !== filterPiso) {

            return false;

        }

        

        // Filtro por departamento

        if (filterDepartamento) {

            if (filterDepartamento === 'no-aplica') {

                // Mostrar espacios con departamento = 'no-aplica' en BD
                return espacio.departamento === 'no-aplica';

            } else {

                return espacio.departamento === filterDepartamento;

            }

        }

        

        // Filtro por tipo
        if (filterTipo && espacio.tipo !== filterTipo) {
            return false;
        }

        

        // Filtro por ubicación (búsqueda general)

        if (filterUbicacion) {

            const nombreBloque = getNombreBloque(espacio.bloque);

            const ubicacion = `bloque ${nombreBloque || ''} espacio ${espacio.salon || ''}`.toLowerCase();

            return ubicacion.includes(filterUbicacion.toLowerCase());

        }

        

        return true;

    });



    // Calcular paginación

    const indexOfLastItem = currentPage * itemsPerPage;

    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentEspacios = filteredEspacios.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredEspacios.length / itemsPerPage);



    // Cambiar página

    const paginate = (pageNumber) => setCurrentPage(pageNumber);



    // Resetear a página 1 cuando cambia el filtro

    const handleFilterChange = (e) => {

        setFilterUbicacion(e.target.value);

        setCurrentPage(1);

    };



    return (

        <DashboardLayout title="Gestión de Espacios">

            <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
                <style>{`
                  @keyframes geFloat1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                  @keyframes geFloat2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(18px); } }
                  @keyframes geShimmer { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
                `}</style>
                <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)', padding: '2rem', position: 'relative', overflow: 'hidden', color: 'white' }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(96,165,250,0.12)', animation: 'geFloat1 8s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(147,197,253,0.09)', animation: 'geFloat2 10s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', top: '20%', left: '55%', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'geShimmer 5s ease-in-out infinite' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Gestión de Espacios</h1>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>Administra todos los espacios y laboratorios del sistema</p>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem("session");
                                window.location.href = "/auth";
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1.25rem',
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <FiLogOut style={{ width: '16px', height: '16px' }} />
                            Cerrar sesión
                        </button>
                    </div>
                </div>

            <div className="p-6">

                <div className="flex justify-between items-center mb-6">

                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FiHome className="w-6 h-6" />
                    Gestión de Espacios
                </h1>

                    <div className="flex space-x-3">

                        <button

                            onClick={() => window.location.reload()}

                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"

                        >

                            <RiRefreshLine  className="w-4 h-4 mr-2" />
                            Actualizar

                        </button>

                        <button

                            onClick={() => setShowModal(true)}

                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"

                        >

                            <IoIosAddCircleOutline className="w-5 h-5 mr-2" />
                            Crear Espacio

                        </button>

                    </div>

                </div>



                {/* Mensaje de error */}

                {error && (

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">

                        <div className="flex">

                            <div className="flex-shrink-0">

                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">

                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />

                                </svg>

                            </div>

                            <div className="ml-3">

                                <h3 className="text-sm font-medium text-red-800">Error de carga</h3>

                                <div className="mt-2 text-sm text-red-700">

                                    <p>{error}</p>

                                </div>

                            </div>

                        </div>

                    </div>

                )}



            {/* Filtro de búsqueda */}

            <div className="bg-white rounded-lg shadow p-4 mb-6">

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                            Tipo

                        </label>

                        <select

                            value={filterTipo}

                            onChange={(e) => {

                                setFilterTipo(e.target.value);

                                setCurrentPage(1);

                            }}

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                        >

                            <option value="">Todos los tipos</option>

                            <option value="Por asignar">Por asignar</option>

                            <option value="Laboratorio">Laboratorio</option>

                            <option value="Aula">Aula</option>

                            <option value="Auditorio">Auditorio</option>

                            <option value="Oficina">Oficina</option>

                        </select>

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                            Bloque

                        </label>

                        <select

                            value={filterBloque}

                            onChange={(e) => {

                                setFilterBloque(e.target.value);

                                setCurrentPage(1);

                            }}

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                        >

                            <option value="">Todos los bloques</option>

                            {bloques.map((bloque) => (

                                <option key={bloque.id} value={bloque.id}>

                                    {bloque.nombre}

                                </option>

                            ))}

                        </select>

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                            Piso

                        </label>

                        <select

                            value={filterPiso}

                            onChange={(e) => {

                                setFilterPiso(e.target.value);

                                setCurrentPage(1);

                            }}

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                        >

                            <option value="">Todos los pisos</option>

                            {[...new Set(espacios.map(e => e.piso).filter(Boolean))].sort((a, b) => a - b).map(piso => (

                                <option key={piso} value={piso.toString()}>

                                    Piso {piso}

                                </option>

                            ))}

                        </select>

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                            Departamento

                        </label>

                        <select

                            value={filterDepartamento}

                            onChange={(e) => {

                                setFilterDepartamento(e.target.value);

                                setCurrentPage(1);

                            }}

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                        >

                            <option value="">Todos los departamentos</option>

                            <option value="no-aplica">No aplica</option>

                            {departamentos.map((departamento) => (

                                <option key={departamento.id} value={departamento.id}>

                                    {departamento.nombre}

                                </option>

                            ))}

                        </select>

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                            Búsqueda general

                        </label>

                        <input

                            type="text"

                            value={filterUbicacion}

                            onChange={(e) => {

                                setFilterUbicacion(e.target.value);

                                setCurrentPage(1);

                            }}

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                            placeholder="Ej: Bloque A, 101..."

                        />

                    </div>

                    <div className="flex items-end">

                        <button

                            onClick={() => {

                                setFilterBloque('');

                                setFilterPiso('');

                                setFilterDepartamento('');

                                setFilterTipo('');

                                setFilterUbicacion('');

                                setCurrentPage(1);

                            }}

                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"

                        >

                            <PiBroom className="w-4 h-4 mr-2" />
                            Limpiar filtros

                        </button>

                    </div>

                </div>

                <div className="mt-2 text-sm text-gray-600">

                    Mostrando {filteredEspacios.length} de {espacios.length} espacios

                </div>

            </div>



            {/* Estadísticas */}

            <div className="mb-6">

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">

                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">

                        <div className="text-3xl font-bold text-blue-600 mb-2">{espacios.length}</div>

                        <div className="text-base text-gray-700 font-medium">Total Espacios</div>

                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">

                        <div className="text-3xl font-bold text-orange-600 mb-2">

                            {espacios.filter(e => e.tipo === 'Por asignar').length}

                        </div>

                        <div className="text-base text-gray-700 font-medium">Por asignar</div>

                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">

                        <div className="text-3xl font-bold text-green-600 mb-2">

                            {espacios.filter(e => e.tipo === 'Laboratorio').length}

                        </div>

                        <div className="text-base text-gray-700 font-medium">Laboratorios</div>

                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">

                        <div className="text-3xl font-bold text-purple-600 mb-2">

                            {espacios.filter(e => e.tipo === 'Aula').length}

                        </div>

                        <div className="text-base text-gray-700 font-medium">Aulas</div>

                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">

                        <div className="text-3xl font-bold text-red-600 mb-2">

                            {espacios.filter(e => e.tipo === 'Auditorio').length}

                        </div>

                        <div className="text-base text-gray-700 font-medium">Auditorios</div>

                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">

                        <div className="text-3xl font-bold text-indigo-600 mb-2">

                            {espacios.filter(e => e.tipo === 'Oficina').length}

                        </div>

                        <div className="text-base text-gray-700 font-medium">Oficinas</div>

                    </div>

                </div>

            </div>



            {/* Lista de Espacios */}

            <div className="bg-white rounded-lg shadow overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="min-w-full divide-y divide-gray-200">

                        <thead className="bg-gray-50">

                            <tr>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                    Nombre

                                </th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                    Tipo

                                </th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                    Capacidad

                                </th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                    Bloque

                                </th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                    Departamento

                                </th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                    Espacio

                                </th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                    Estado

                                </th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                    Acciones

                                </th>

                            </tr>

                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">

                            {loading ? (

                                <tr>

                                    <td colSpan="7" className="px-6 py-4 text-center">

                                        <div className="flex items-center justify-center">

                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>

                                            <span>Cargando...</span>

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                currentEspacios.map((espacio) => (

                                    <tr key={espacio.id} data-espacio-id={espacio.id} className="hover:bg-gray-50">

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                                            {espacio.nombre}

                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">

                                                {espacio.tipo}

                                            </span>

                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                                            {espacio.capacidad}

                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                                            {getNombreBloque(espacio.bloque)}

                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                                            {getNombreDepartamento(espacio.departamento)}

                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                                            {espacio.salon}

                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                                            <button

                                                onClick={() => handleToggleDisponibilidad(espacio.id)}

                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${

                                                    espacio.disponible ? 'bg-green-500' : 'bg-red-500'

                                                }`}

                                            >

                                                <span

                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${

                                                        espacio.disponible ? 'translate-x-6' : 'translate-x-1'

                                                    }`}

                                                />

                                            </button>

                                            <span className="ml-2 text-xs text-gray-600">

                                                {espacio.disponible ? 'Activo' : 'Inactivo'}

                                            </span>

                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                                            <div className="flex space-x-2">

                                                <button

                                                    onClick={() => handleEditEspacio(espacio)}

                                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center"

                                                >

                                                    <FiEdit2 className="w-3 h-3 mr-1" />
                                                    Editar

                                                </button>

                                                <button

                                                    onClick={() => handleDeleteEspacio(espacio.id)}

                                                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center"

                                                >

                                                    <FiTrash2 className="w-3 h-3 mr-1" />
                                                    Eliminar

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>



                {/* Paginación */}

                {totalPages > 1 && (

                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">

                        <div className="text-sm text-gray-700">

                            Página {currentPage} de {totalPages}

                        </div>

                        <div className="flex space-x-2">

                            <button

                                onClick={() => paginate(currentPage - 1)}

                                disabled={currentPage === 1}

                                className={`px-3 py-1 rounded ${

                                    currentPage === 1

                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'

                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'

                                }`}

                            >

                                Anterior

                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (

                                <button

                                    key={page}

                                    onClick={() => paginate(page)}

                                    className={`px-3 py-1 rounded ${

                                        currentPage === page

                                            ? 'bg-blue-500 text-white'

                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'

                                    }`}

                                >

                                    {page}

                                </button>

                            ))}

                            <button

                                onClick={() => paginate(currentPage + 1)}

                                disabled={currentPage === totalPages}

                                className={`px-3 py-1 rounded ${

                                    currentPage === totalPages

                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'

                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'

                                }`}

                            >

                                Siguiente

                            </button>

                        </div>

                    </div>

                )}

            </div>



            {/* Modal Crear Espacio */}

            {showModal && (

                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">

                    <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">

                        <h2 className="text-xl font-bold text-gray-900 mb-4">Crear Nuevo Espacio</h2>

                        

                        <div className="space-y-4">

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">

                                    Nombre del Espacio

                                </label>

                                <input

                                    type="text"

                                    name="nombre"

                                    value={formData.nombre}

                                    onChange={handleInputChange}

                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                    placeholder="Ej: Laboratorio de Sistemas"

                                    required

                                />

                            </div>

                            

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">

                                    Tipo de Espacio

                                </label>

                                <select

                                    name="tipo"

                                    value={formData.tipo}

                                    onChange={handleInputChange}

                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                    required

                                >

                                    <option value="">Seleccionar tipo</option>

                                    <option value="Laboratorio">Laboratorio</option>

                                    <option value="Aula">Aula</option>

                                    <option value="Auditorio">Auditorio</option>

                                    <option value="Oficina">Oficina</option>

                                </select>

                            </div>

                            {formData.tipo === 'Laboratorio' ? (
                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">

                                        Departamento

                                    </label>

                                    <select

                                        name="departamento"

                                        value={formData.departamento}

                                        onChange={handleInputChange}

                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                    >

                                        <option value="">Seleccionar departamento</option>

                                        {departamentos.map((departamento) => (

                                            <option key={departamento.id} value={departamento.id}>

                                                {departamento.nombre}

                                        </option>

                                    ))}

                                </select>

                            </div>
                            ) : (
                                <input
                                    type="hidden"
                                    name="departamento"
                                    value="no-aplica"
                                />
                            )}

                            <div>

                                <label className="block text-sm font-medium text-700 mb-1">

                                    Capacidad de personas

                                </label>

                                <input

                                    type="number"

                                    name="capacidad"

                                    value={formData.capacidad}

                                    onChange={handleInputChange}

                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                    placeholder="Ej: 30"

                                    min="1"

                                    required

                                />

                            </div>

                            

                            <div className="grid grid-cols-3 gap-3">

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">

                                        Bloque

                                    </label>

                                    <select

                                        name="bloque"

                                        value={formData.bloque}

                                        onChange={handleBloqueChange}

                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                        required

                                    >

                                        <option value="">Seleccionar bloque</option>

                                        {bloques.map((bloque) => (

                                            <option key={bloque.id} value={bloque.id}>

                                                {bloque.nombre}

                                            </option>

                                        ))}

                                    </select>

                                </div>

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">

                                        Piso

                                    </label>

                                    <select

                                        name="piso"

                                        value={formData.piso}

                                        onChange={handleInputChange}

                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                        required

                                        disabled={!selectedBloque}

                                    >

                                        <option value="">{selectedBloque ? 'Seleccionar piso' : 'Primero selecciona un bloque'}</option>

                                        {getPisosDisponibles().map((piso) => (

                                            <option key={piso} value={piso}>

                                                Piso {piso}

                                            </option>

                                        ))}

                                    </select>

                                </div>

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">

                                        Espacio

                                    </label>

                                    <input

                                        type="number"

                                        name="salon"

                                        value={formData.salon}

                                        onChange={handleInputChange}

                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            isEspacioDuplicado() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}

                                        placeholder="Ej: 1"

                                        min="1"

                                        required

                                        disabled={!selectedBloque || !formData.piso}

                                    />

                                    {formData.salon && isEspacioDuplicado() && (

                                        <p className="text-xs text-red-600 mt-1">

                                            El espacio {formData.salon} ya existe en este bloque y piso

                                        </p>

                                    )}

                                    {formData.piso && !formData.salon && (

                                        <p className="text-xs text-gray-500 mt-1">

                                            Espacios existentes en este piso: {getEspaciosExistentesEnPiso().join(', ') || 'Ninguno'}

                                        </p>

                                    )}

                                </div>

                            </div>

                        </div>

                        

                        <div className="flex justify-end space-x-3 mt-6">

                            <button

                                type="button"

                                onClick={() => setShowModal(false)}

                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"

                            >

                                Cancelar

                            </button>

                            <button

                                type="button"

                                onClick={handleCreateEspacio}

                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"

                            >

                                Crear Espacio

                            </button>

                        </div>

                    </div>

                </div>

            )}



            {/* Modal Editar Espacio */}

            {showEditModal && (

                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">

                    <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">

                        <h2 className="text-xl font-bold text-gray-900 mb-4">Editar Espacio</h2>

                        

                        <div className="space-y-4">

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">

                                    Nombre del Espacio

                                </label>

                                <input

                                    type="text"

                                    name="nombre"

                                    value={editFormData.nombre}

                                    onChange={handleEditInputChange}

                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                    placeholder="Ej: Laboratorio de Sistemas"

                                    required

                                />

                            </div>

                            

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">

                                    Tipo de Espacio

                                </label>

                                <select

                                    name="tipo"

                                    value={editFormData.tipo}

                                    onChange={handleEditInputChange}

                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                    required

                                >

                                    <option value="">Seleccionar tipo</option>

                                    <option value="Por asignar">Por asignar</option>

                                    <option value="Laboratorio">Laboratorio</option>

                                    <option value="Aula">Aula</option>

                                    <option value="Auditorio">Auditorio</option>

                                    <option value="Oficina">Oficina</option>

                                </select>

                            </div>

                            {editFormData.tipo === 'Laboratorio' ? (
                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">

                                        Departamento

                                    </label>

                                    <select

                                        name="departamento"

                                        value={editFormData.departamento}

                                        onChange={handleEditInputChange}

                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                    >

                                        <option value="">Seleccionar departamento</option>

                                        {departamentos.map((departamento) => (

                                            <option key={departamento.id} value={departamento.id}>

                                                {departamento.nombre}

                                            </option>

                                        ))}

                                    </select>

                                </div>
                            ) : (
                                <input
                                    type="hidden"
                                    name="departamento"
                                    value="no-aplica"
                                />
                            )}

                            

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">

                                    Capacidad de personas

                                </label>

                                <input

                                    type="number"

                                    name="capacidad"

                                    value={editFormData.capacidad}

                                    onChange={handleEditInputChange}

                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                    placeholder="Ej: 30"

                                    min="1"

                                    required

                                />

                            </div>

                            

                            <div className="grid grid-cols-3 gap-3">

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">

                                        Bloque

                                    </label>

                                    <select

                                        name="bloque"

                                        value={editFormData.bloque}

                                        onChange={handleEditBloqueChange}

                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                        required

                                    >

                                        <option value="">Seleccionar bloque</option>

                                        {bloques.map((bloque) => (

                                            <option key={bloque.id} value={bloque.id}>

                                                {bloque.nombre}

                                            </option>

                                        ))}

                                    </select>

                                </div>

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">

                                        Piso

                                    </label>

                                    <select

                                        name="piso"

                                        value={editFormData.piso}

                                        onChange={handleEditInputChange}

                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                                        required

                                        disabled={!editFormData.bloque}

                                    >

                                        <option value="">{editFormData.bloque ? 'Seleccionar piso' : 'Primero selecciona un bloque'}</option>

                                        {getEditPisosDisponibles().map((piso) => (

                                            <option key={piso} value={piso}>

                                                Piso {piso}

                                            </option>

                                        ))}

                                    </select>

                                </div>

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">

                                        Espacio

                                    </label>

                                    <input

                                        type="number"

                                        name="salon"

                                        value={editFormData.salon}

                                        onChange={handleEditInputChange}

                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            isEditEspacioDuplicado() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}

                                        placeholder="Ej: 1"

                                        min="1"

                                        required

                                        disabled={!editFormData.bloque || !editFormData.piso}

                                    />

                                    {editFormData.salon && isEditEspacioDuplicado() && (

                                        <p className="text-xs text-red-600 mt-1">

                                             El espacio {editFormData.salon} ya existe en este bloque y piso

                                        </p>

                                    )}

                                </div>

                            </div>

                        </div>

                        

                        <div className="flex justify-end space-x-3 mt-6">

                            <button

                                type="button"

                                onClick={() => setShowEditModal(false)}

                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"

                            >

                                Cancelar

                            </button>

                            <button

                                type="button"

                                onClick={handleUpdateEspacio}

                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"

                            >

                                Actualizar Espacio

                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* Modal de Confirmación de Creación */}
            {showConfirmModal && createdSpace && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full transform transition-all">
                        <div className="text-center">
                            {/* Icono de éxito */}
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                ¡Espacio Creado Exitosamente! 
                            </h3>
                            
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                <h4 className="font-semibold text-gray-700 mb-3">Detalles del espacio:</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nombre:</span>
                                        <span className="font-medium text-gray-900">{createdSpace.nombre}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tipo:</span>
                                        <span className="font-medium text-gray-900">{createdSpace.tipo}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Capacidad:</span>
                                        <span className="font-medium text-gray-900">{createdSpace.capacidad} persona(s)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Bloque:</span>
                                        <span className="font-medium text-gray-900">{getNombreBloque(createdSpace.bloque)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Piso:</span>
                                        <span className="font-medium text-gray-900">{createdSpace.piso}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Espacio:</span>
                                        <span className="font-medium text-gray-900">{createdSpace.salon}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Estado:</span>
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                            createdSpace.disponible 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {createdSpace.disponible ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Cerrar
                                </button>
                                
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Edición */}
            {showEditConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full transform transition-all">
                        <div className="text-center">
                            {/* Icono de éxito */}
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                                <FiEdit2 className="w-5 h-5" />
                                ¡Espacio Actualizado!
                            </h3>
                            
                            <p className="text-gray-600 mb-6">
                                Los cambios del espacio han sido guardados exitosamente.
                            </p>
                            
                            <button
                                onClick={() => setShowEditConfirmModal(false)}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {showDeleteConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                            <FiTrash2 className="w-6 h-6 text-red-600" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                            ¿Eliminar Espacio?
                        </h3>
                        
                        <p className="text-gray-600 mb-6 text-center">
                            ¿Está seguro de que desea eliminar este espacio? Esta acción no se puede deshacer.
                        </p>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelDeleteEspacio}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteEspacio}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Éxito */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                            ¡Espacio Eliminado!
                        </h3>
                        
                        <p className="text-gray-600 mb-6 text-center">
                            El espacio ha sido eliminado exitosamente del sistema.
                        </p>
                        
                        <button
                            onClick={closeSuccessModal}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            </div>
            </div>

        </DashboardLayout>

    );

};



export default GestionEspacios;

