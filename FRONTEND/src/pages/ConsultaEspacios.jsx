import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@components/Layout/DashboardLayout';
import espaciosService from '@api/services/espacios.service';
import bloquesService from '@api/services/bloques.service';
import reservasService from '@api/services/reservas.service';
import { departamentosService } from '@api/services/departamentos.service';
import useSession from '../context/Auth/useSession';
import { toast } from 'sonner';
import { FiArrowLeft, FiCalendar, FiX, FiMap, FiMapPin, FiTag, FiUsers, FiInfo, FiLogOut} from 'react-icons/fi';
import { FaRegBuilding } from "react-icons/fa";
import ModalResumenReserva from '@components/ModalResumenReserva';

const ConsultaDisponibilidad = () => {
    const { session } = useSession();
    const [espacios, setEspacios] = useState([]);
    const [bloques, setBloques] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBlock, setSelectedBlock] = useState(null); // { bloque, espacios }
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [showUnavailableModal, setShowUnavailableModal] = useState(false);
    const [unavailableSpace, setUnavailableSpace] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [loadingReservas, setLoadingReservas] = useState(false);
    const [reservasError, setReservasError] = useState(null);
    
    // Estados para selección de reservas
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [showReservaModal, setShowReservaModal] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // Estado alternativo
    const [forceRender, setForceRender] = useState(0); // Forzar re-render
    const modalRef = useRef(null); // Referencia directa al modal
    const [reservaMotivo, setReservaMotivo] = useState('');
    const [loadingReserva, setLoadingReserva] = useState(false);
    const creatingRef = useRef(false); // Guarda sincrónica contra doble-click
    const [showResumenModal, setShowResumenModal] = useState(false);
    const [resumenReserva, setResumenReserva] = useState(null);
    const [conflictoEspacio, setConflictoEspacio] = useState(null);

    // Franjas horarias
    const timeSlots = [
        '07:00AM - 07:50AM',
        '07:50AM - 08:40AM', 
        '08:40AM - 09:30AM',
        '09:30AM - 10:20AM',
        '10:20AM - 11:10AM',
        '11:10AM - 12:00PM',
        '12:00PM - 12:50PM',
        '01:00PM - 01:50PM',
        '01:50PM - 02:40PM',
        '02:40PM - 03:30PM',
        '03:30PM - 04:20PM',
        '04:20PM - 05:10PM',
        '05:10PM - 06:00PM',
        '06:00PM - 06:50PM',
        '06:50PM - 07:40PM',
        '07:40PM - 08:30PM',
        '08:30PM - 09:20PM',
        '09:20PM - 10:00PM'
    ];

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Obtener fechas de la semana actual (lunes a sábado)
    const getWeekDates = (weekStart) => {
        const d = new Date(weekStart);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea 1
        const monday = new Date(d.getFullYear(), d.getMonth(), diff);
        const weekDates = [];
        for (let i = 0; i < 6; i++) {
            const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    };

    const weekDates = getWeekDates(currentWeek);    
    

    const prevWeek = () => {
        const prev = new Date(currentWeek);
        prev.setDate(prev.getDate() - 7);
        setCurrentWeek(prev);
        // Limpiar selección al cambiar de semana
        clearSelection();
    };

    const nextWeek = () => {
        const next = new Date(currentWeek);
        next.setDate(next.getDate() + 7);
        setCurrentWeek(next);
        // Limpiar selección al cambiar de semana
        clearSelection();
    };

    const isCurrentWeek = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentWeekStart = new Date(currentWeek);
        currentWeekStart.setHours(0, 0, 0, 0);
        // Normalizar ambos al lunes de su semana
        const todayWeekStart = getWeekDates(today)[0];
        const selectedWeekStart = getWeekDates(currentWeekStart)[0];
        todayWeekStart.setHours(0, 0, 0, 0);
        selectedWeekStart.setHours(0, 0, 0, 0);
        return todayWeekStart.getTime() === selectedWeekStart.getTime();
    };

    const formatWeekRange = () => {
        const start = weekDates[0];
        const end = weekDates[5];
        return `${start.getDate()} ${start.toLocaleString('default', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
    };

    // Función para cargar reservas de un espacio
    const cargarReservasEspacio = async (espacioId) => {
        
        
        
        if (!espacioId) {
            
            return;
        }
        
        if (!session || !session.user) {
            
            setReservas([]);
            return;
        }
        
        const idEmpresa = session.user.id_empresa;
        if (!idEmpresa) {
            
            setReservas([]);
            return;
        }
        
        setLoadingReservas(true);
        setReservasError(null);
        
        try {
            
            const todasReservasData = await reservasService.getAllByEmpresa(idEmpresa);
            
            
            // Las reservas pueden venir directamente o en .data
            const todasReservasArray = todasReservasData.data || todasReservasData || [];
            
            
            // Filtrar por espacio
            const reservasEspacio = todasReservasArray.filter(reserva => reserva.espacioId === espacioId);
            
            
            setReservas(reservasEspacio);
        } catch (error) {
            console.error(' Error al cargar reservas:', error);
            setReservasError('No se pudieron cargar las reservas existentes');
            toast.error('Error al cargar las reservas');
        } finally {
            setLoadingReservas(false);
        }
    };

    // Helper: hora actual en Colombia (UTC-5)
    const ahoraColombia = () => {
        try {
            return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
        } catch {
            return new Date();
        }
    };

    // Función para verificar si un slot ya pasó (hora Colombia)
    const esSlotPasado = (day, slot) => {
        const d = days.indexOf(day);
        const fecha = weekDates[d];
        const { horaInicio } = reservasService.timeSlotToHoras(slot);

        const match = horaInicio.match(/(\d+):(\d+)(AM|PM)/i);
        if (!match) return false;
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const periodo = match[3].toUpperCase();
        if (periodo === 'PM' && h !== 12) h += 12;
        if (periodo === 'AM' && h === 12) h = 0;

        const slotDate = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), h, m);
        return slotDate < ahoraColombia();
    };

    // Función para verificar si un horario está ocupado
    const estaOcupado = (day, slot) => {
        if (!selectedSpace || reservas.length === 0) {
            
            return false;
        }

        const { horaInicio, horaFin } = reservasService.timeSlotToHoras(slot);
        const fecha = weekDates[days.indexOf(day)];
        // Buscar si alguna reserva afecta este horario
        const resultado = reservas.some(reserva => {
            const afecta = reservasService.reservaAfectaHorario(reserva, fecha, day, horaInicio, horaFin, session?.user?.id_empresa);
            
                
            return afecta;
        });
        
        
        return resultado;
    };

    // Función para manejar clic en franja disponible
    const handleSlotClick = (day, slot) => {
        if (!selectedSpace || loadingReservas || estaOcupado(day, slot) || esSlotPasado(day, slot)) return;

        const slotKey = `${day}-${slot}`;
        const slotIndex = timeSlots.indexOf(slot);
        
        setSelectedSlots(prevSlots => {
            let newSlots;
            
            // Si ya está seleccionado, deseleccionarlo
            if (prevSlots.some(s => s.key === slotKey)) {
                newSlots = prevSlots.filter(s => s.key !== slotKey);
            } else {
                // Si no hay selección, añadir esta franja
                if (prevSlots.length === 0) {
                    newSlots = [{ key: slotKey, day, slot, index: slotIndex }];
                } else {
                    // Si el nuevo slot es de un día diferente, reemplazar toda la selección
                    const differentDay = prevSlots.some(existingSlot => existingSlot.day !== day);
                    if (differentDay) {
                        newSlots = [{ key: slotKey, day, slot, index: slotIndex }];
                    } else {
                        // Mismo día: verificar si es consecutiva con alguna franja existente
                        const isConsecutive = prevSlots.some(existingSlot => {
                            const indexDiff = Math.abs(slotIndex - existingSlot.index);
                            return indexDiff === 1;
                        });
                        
                        if (isConsecutive) {
                            newSlots = [...prevSlots, { key: slotKey, day, slot, index: slotIndex }];
                        } else {
                            // No consecutiva en el mismo día, reemplazar la selección
                            newSlots = [{ key: slotKey, day, slot, index: slotIndex }];
                        }
                    }
                }
            }
            
            // SIEMPRE ordenar las franjas seleccionadas cronológicamente
            // Primero por día, luego por hora
            const sortedSlots = newSlots.sort((a, b) => {
                const dayA = days.indexOf(a.day);
                const dayB = days.indexOf(b.day);
                
                if (dayA !== dayB) {
                    return dayA - dayB; // Ordenar por día (Lunes=0, Martes=1, etc.)
                }
                
                return a.index - b.index; // Ordenar por hora dentro del mismo día
            });
            
            
            return sortedSlots;
        });
    };

    // Función para verificar si una franja está seleccionada
    const isSlotSelected = (day, slot) => {
        const slotKey = `${day}-${slot}`;
        return selectedSlots.some(s => s.key === slotKey);
    };

    // Función para limpiar selección
    const clearSelection = () => {
        setSelectedSlots([]);
        setReservaMotivo('');
    };

    // Función directa para mostrar modal (bypass de estado)
    const mostrarModalDirecto = () => {
        
        
        // Limpiar estados basura de intentos anteriores
        setReservaMotivo('');
        
        // Guardar las selecciones actuales para evitar que se pierdan
        const currentSelections = {
            selectedSlots: [...selectedSlots],
            selectedSpace: { ...selectedSpace },
            session: { ...session }
        };
        
        
        
        
        // Crear modal directamente en el DOM
        const modalExistente = document.getElementById('modal-directo');
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // Determinar el tipo de reserva según rol y espacio (ANTES de crear el HTML)
        const userRole = session?.user?.tipo || '';
        const espacioTipo = currentSelections.selectedSpace?.tipo || '';
        
        
        
        
        
        
        let mostrarTipoSelector = false;
        let tipoPorDefecto = 'ocasional';
        let estadoPorDefecto = 'Reservada';
        
        if (userRole === 'superadmin') {
            
            mostrarTipoSelector = true;
            tipoPorDefecto = 'ocasional';
        } else if (userRole === 'administrador' && espacioTipo === 'Laboratorio') {
            
            mostrarTipoSelector = true;
            tipoPorDefecto = 'ocasional';
        } else if (userRole === 'estudiante' || userRole === 'docente') {
            
            if (espacioTipo !== 'Aula') {
                tipoPorDefecto = 'ocasional';
                estadoPorDefecto = 'Pendiente';
            }
        } else {
            
        }
        
        
        
        // Guardar estas variables en el window para usarlas en confirmación
        window.modalConfig = {
            mostrarTipoSelector,
            tipoPorDefecto,
            estadoPorDefecto
        };
        
        // Guardar currentSelections para acceso global
        window.currentSelections = currentSelections;
        
        const modalDiv = document.createElement('div');
        modalDiv.id = 'modal-directo';
        modalDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;
        
        modalDiv.innerHTML = `
            <div style="
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow: auto;
            ">
                <h3 style="margin: 0 0 15px 0; font-size: 18px;">Confirmar Reserva</h3>
                <div style="margin-bottom: 15px;">
                    <strong>Espacio:</strong> ${currentSelections.selectedSpace?.nombre}<br/>
                    <strong>Franjas:</strong><br/>
                    ${currentSelections.selectedSlots.map(slot => `• ${slot.day} - ${slot.slot}`).join('<br/>')}
                </div>
                ${mostrarTipoSelector ? `
                <div style="margin-bottom: 15px;">
                    <label><strong>Tipo de Reserva:</strong></label><br/>
                    <select id="tipo-directo" style="
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        margin-top: 5px;
                    ">
                        <option value="ocasional">Ocasional</option>
                        <option value="permanente">Permanente</option>
                    </select>
                </div>` : ''}
                <div style="margin-bottom: 15px;">
                    <label><strong>Motivo:</strong></label><br/>
                    <textarea id="motivo-directo" style="
                        width: 100%;
                        height: 80px;
                        padding: 8px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        resize: vertical;
                    " placeholder="Escribe el motivo..."></textarea>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="cerrarModalDirecto()" style="
                        flex: 1;
                        padding: 10px;
                        background-color: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Cancelar</button>
                    <button onclick="confirmarModalDirecto()" style="
                        flex: 1;
                        padding: 10px;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Confirmar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalDiv);
        
        // Limpiar el textarea al abrir el modal
        setTimeout(() => {
            const textarea = document.getElementById('motivo-directo');
            if (textarea) {
                textarea.value = '';
                
            }
        }, 50);
        
        // Funciones globales para los botones
        window.cerrarModalDirecto = () => {
            
            const modal = document.getElementById('modal-directo');
            if (modal) modal.remove();
        };
        
        window.confirmarModalDirecto = async () => {
            // Guarda contra doble-click en el modal directo
            if (creatingRef.current) {
                return;
            }

            // Obtener el valor del motivo
            const motivoElement = document.getElementById('motivo-directo');
            const motivo = motivoElement ? motivoElement.value : '';
            
            // Obtener el tipo de reserva seleccionado
            const config = window.modalConfig || {};
            let tipoReserva = config.tipoPorDefecto || 'ocasional';
            
            if (config.mostrarTipoSelector) {
                const tipoElement = document.getElementById('tipo-directo');
                if (tipoElement) {
                    tipoReserva = tipoElement.value;
                }
            } 
            
            const currentSelections = window.currentSelections || {};
            if (!currentSelections.selectedSlots || currentSelections.selectedSlots.length === 0 || !currentSelections.selectedSpace) {
                alert('Error: No hay franjas seleccionadas o espacio seleccionado. Por favor, selecciona nuevamente.');
                window.cerrarModalDirecto();
                return;
            }
            
            // Validación SIMPLE del motivo
            if (!motivo || motivo.trim() === '') {
                alert('Por favor, ingresa un motivo');
                return; // NO cerrar el modal
            }
            
            try {
                
                // Pasar el motivo, tipo y estado directamente para evitar problemas de timing
                await handleReserva(motivo.trim(), tipoReserva, config.estadoPorDefecto);
                
                window.cerrarModalDirecto();
            } catch (error) {
                console.error(' ERROR EN RESERVA:', error);
                alert('Error al crear la reserva: ' + error.message);
                // No cerrar el modal si hay error para que pueda reintentar
            }
        };
        
        
    };

    // Función para crear reserva
    const handleReserva = async (motivoDirecto = null, tipoDirecto = null, estadoDirecto = null) => {
        // Guarda sincrónica: si ya se está creando una reserva, ignorar el click
        if (creatingRef.current) {
            return;
        }
        creatingRef.current = true;

        // Usar los valores directos si se proporcionan, si no usar los estados
        const motivoFinal = motivoDirecto || reservaMotivo;
        const tipoFinal = tipoDirecto || 'ocasional';
        const estadoFinal = estadoDirecto || 'Reservada';

        if (!motivoFinal.trim()) {
            creatingRef.current = false;
            alert('Error: Debes ingresar un motivo');
            return;
        }

        if (selectedSlots.length === 0) {
            creatingRef.current = false;
            alert('Error: Debes seleccionar al menos una franja horaria');
            return;
        }

        if (!selectedSpace) {
            creatingRef.current = false;
            alert('Error: No hay espacio seleccionado');
            return;
        }

        setLoadingReserva(true);
        
        try {
            // Las franjas ya están ordenadas cronológicamente por handleSlotClick
            // Pero hacemos una doble seguridad por si acaso
            const sortedSlots = [...selectedSlots].sort((a, b) => {
                const dayA = days.indexOf(a.day);
                const dayB = days.indexOf(b.day);
                if (dayA !== dayB) return dayA - dayB;
                return a.index - b.index;
            });

            

            // Obtener primera y última franja para calcular horario
            const firstSlot = sortedSlots[0]; // Más temprano
            const lastSlot = sortedSlots[sortedSlots.length - 1]; // Más tardío
            // Usar la fecha del primer día seleccionado
            const fecha = weekDates[days.indexOf(firstSlot.day)];
            // Para múltiples franjas, necesitamos la hora de inicio de la primera
            // y la hora de fin de la última (la hora de fin REAL, no la hora de inicio)
            const { horaInicio: horaInicioFirst } = reservasService.timeSlotToHoras(firstSlot.slot);
            const { horaFin: horaFinLast } = reservasService.timeSlotToHoras(lastSlot.slot);
            
            // Función para convertir hora 12h a 24h
            const convertirA24h = (hora12h) => {
                const [hora, periodo] = hora12h.split(/(AM|PM)/);
                let [h, m] = hora.trim().split(':').map(Number);
                
                if (periodo.trim() === 'PM' && h !== 12) {
                    h += 12;
                } else if (periodo.trim() === 'AM' && h === 12) {
                    h = 0;
                }
                
                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            };           

            // Determinar las horas finales según el caso
            let horaInicioFinal, horaFinFinal;
            
            if (sortedSlots.length === 1) {
                // UNA SOLA FRANJA: usar horaInicio y horaFin de la misma franja
                
                const timeSlotData = reservasService.timeSlotToHoras(firstSlot.slot);
                
                
                const { horaInicio, horaFin } = timeSlotData;
                
                horaInicioFinal = horaInicio.trim()
                horaFinFinal = horaFin.trim()
                
                
            } else {
                // MÚLTIPLES FRANJAS: usar horaInicio de la primera y horaFin de la última
                horaInicioFinal = horaInicioFirst.trim()
                horaFinFinal = horaFinLast.trim()
            }            
            
            // Crear datos de reserva
            const reservaData = {
                id: `reserva-${Date.now()}`,
                personaId: session?.user?.id,
                espacioId: selectedSpace.id,
                fecha: fecha.toISOString().split('T')[0],
                horaInicio: horaInicioFinal,
                horaFin: horaFinFinal,
                motivo: motivoFinal.trim(),
                tipo: tipoFinal,
                estado: estadoFinal,
                id_empresa: session?.user?.id_empresa
            };
            
            
            
            // Verificar conflicto con reservas vigentes (estado 'Reservada')
            const reservaConflicto = reservas.find(r =>
                reservasService.reservaAfectaHorario(r, fecha, firstSlot.day, horaInicioFinal, horaFinFinal, session?.user?.id_empresa)
            );
            if (reservaConflicto) {
                setConflictoEspacio(reservaConflicto);
                setLoadingReserva(false);
                creatingRef.current = false;
                return;
            }

            await reservasService.create(reservaData);
            // Recargar reservas del espacio
            await cargarReservasEspacio(selectedSpace.id);
            
            // Actualizar el estado del motivo y limpiar selección
            setReservaMotivo(motivoFinal);
            clearSelection();
            
            // Mostrar modal de resumen
            setResumenReserva({
                espacio: selectedSpace.nombre,
                bloque: getNombreBloque(selectedSpace.bloque),
                piso: selectedSpace.piso,
                salon: selectedSpace.salon,
                fecha: reservaData.fecha,
                horaInicio: horaInicioFinal,
                horaFin: horaFinFinal,
                motivo: motivoFinal.trim(),
                tipo: tipoFinal,
                estado: estadoFinal,
                usuario: session?.user?.nombre,
                franjas: sortedSlots
            });
            setShowResumenModal(true);
            
            toast.success('Reserva creada exitosamente');
        } catch (error) {
            console.error('Error al crear reserva:', error);
            console.error('Respuesta del backend:', error.response?.data);
            console.error('Status:', error.response?.status);
            console.error('Headers:', error.response?.headers);
            
            if (error.response?.status === 400) {
                alert(`Error 400 - Bad Request: ${JSON.stringify(error.response?.data, null, 2)}`);
            }
            
            toast.error('No se pudo crear la reserva');
        } finally {
            setLoadingReserva(false);
            creatingRef.current = false;
        }
    };

    // Función para obtener información de reserva en un horario
    const getReservaInfo = (day, slot) => {
        if (!selectedSpace || reservas.length === 0) return null;

        const { horaInicio, horaFin } = reservasService.timeSlotToHoras(slot);
        const fecha = weekDates[days.indexOf(day)];
        
        // Buscar la reserva que afecta este horario
        return reservas.find(reserva => 
            reservasService.reservaAfectaHorario(reserva, fecha, day, horaInicio, horaFin, session?.user?.id_empresa)
        );
    };

    // Función helper para obtener el nombre del bloque por ID
    const getNombreBloque = (bloqueId) => {
        const bloque = bloques.find(b => b.id === bloqueId);
        return bloque ? bloque.nombre : bloqueId;
    };

    // Función helper para obtener el nombre del departamento por ID
    const getNombreDepartamento = (departamentoId) => {
        if (!departamentoId) return '';
        const departamento = departamentos.find(d => d.id === departamentoId);
        return departamento ? departamento.nombre : '';
    };

    // Cargar todos los espacios y bloques
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Obtener id_empresa del usuario logueado
                const idEmpresa = session?.user?.id_empresa;
                
                if (!idEmpresa) {
                    setError('No tienes una empresa asignada');
                    return;
                }
                
                // Cargar espacios, bloques y departamentos en paralelo
                const [espaciosData, bloquesData, departamentosData] = await Promise.all([
                    espaciosService.getByEmpresa(idEmpresa),
                    bloquesService.getByIdEmpresa(idEmpresa),
                    departamentosService.getByEmpresa(idEmpresa)
                ]);
                
                // Filtrar espacios según el rol del usuario
                let espaciosFiltrados = espaciosData;
                const userTipo = session?.user?.tipo;
                
                if (userTipo === 'superadmin') {
                    // Superadmin: todos los tipos de espacios (sin filtro)
                    espaciosFiltrados = espaciosData;
                } else if (userTipo === 'administrador') {
                    // Administrador: todos menos oficinas, pero laboratorios solo de su departamento
                    const adminDepartamento = session?.user?.departamento;
                    espaciosFiltrados = espaciosData.filter(espacio => {
                        const tipo = espacio.tipo.toLowerCase();
                        
                        // Excluir oficinas y espacios por asignar
                        if (tipo === 'oficina' || tipo === 'por asignar') {
                            return false;
                        }
                        
                        // Si es laboratorio, debe ser del mismo departamento del administrador
                        if (tipo === 'laboratorio') {
                            return espacio.departamento === adminDepartamento;
                        }
                        
                        // Otros tipos (aulas, auditorios) son visibles para todos los administradores
                        return true;
                    });
                } else if (userTipo === 'estudiante' || userTipo === 'docente') {
                    // Estudiante/Docente: solo aulas y laboratorios
                    espaciosFiltrados = espaciosData.filter(espacio => {
                        const tipo = espacio.tipo.toLowerCase();
                        return tipo === 'aula' || tipo === 'laboratorio';
                    });
                }
                
                
                setEspacios(espaciosFiltrados);
                setBloques(bloquesData);
                setDepartamentos(departamentosData);
                
                
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('No se pudieron cargar los datos. Por favor, intente nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    // Agrupar espacios por bloque
    const groupedEspacios = espacios.reduce((acc, espacio) => {
        const nombreBloque = getNombreBloque(espacio.bloque);
        if (!acc[nombreBloque]) {
            acc[nombreBloque] = [];
        }
        acc[nombreBloque].push(espacio);
        return acc;
    }, {});

    // Renderizar plano 2D general de todos los bloques
    const renderMain2D = () => {
        if (selectedBlock) {
            // Vista de salones de un bloque
            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FiMapPin className="w-5 h-5" />
                            Espacios de {selectedBlock.bloque}
                        </h2>
                        <button
                            onClick={() => setSelectedBlock(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm flex"
                        >
                            <FiArrowLeft className="w-4 h-4 mr-2" />
                            Volver al plano general
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                            {selectedBlock.espacios.map(espacio => (
                                <div
                                    key={espacio.id}
                                    onClick={() => selectSpace(espacio)}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                                        espacio.disponible
                                            ? 'border-green-400 bg-green-50 hover:bg-green-100'
                                            : 'border-red-400 bg-red-50 hover:bg-red-100'
                                    }`}
                                >
                                    <div className="flex flex-col justify-between h-full">
                                        <div>
                                            <div className="font-semibold text-sm text-gray-800">
                                                {espacio.nombre}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1 flex items-center">
                                                <FiTag className="w-3 h-3 mr-1" />
                                                {espacio.tipo}
                                            </div>
                                            <div className="text-xs text-gray-600 flex items-center">
                                                <FiMapPin className="w-3 h-3 mr-1" />
                                                Salón {espacio.salon}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center">
                                                <FiUsers className="w-3 h-3 mr-1" />
                                                Capacidad: {espacio.capacidad}
                                            </div>
                                            {espacio.tipo.toLowerCase() === 'laboratorio' && espacio.departamento && espacio.departamento !== 'no-aplica' && (
                                                <div className="text-xs text-gray-500 flex items-center">
                                                    <FaRegBuilding className="w-3 h-3 mr-1" />
                                                    {getNombreDepartamento(espacio.departamento)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-center mt-3">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                espacio.disponible
                                                    ? 'bg-green-200 text-green-800'
                                                    : 'bg-red-200 text-red-800'
                                            }`}>
                                                {espacio.disponible ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Vista general de bloques con formas arquitectónicas
        const blocks = Object.keys(groupedEspacios).sort(); // Ordenar alfabéticamente
        
        // Layout dinámico adaptable
        const svgWidth = 350;
        const svgHeight = 320;
        const margin = 20;
        const streetWidth = 15;
        const minCellWidth = 80;
        const minCellHeight = 60;
        
        // Calcular columnas y filas óptimas
        const totalBlocks = blocks.length;
        let gridCols = Math.ceil(Math.sqrt(totalBlocks));
        let gridRows = Math.ceil(totalBlocks / gridCols);
        
        // Ajustar para mejor distribución
        while (gridCols > 1 && (gridCols - 1) * gridRows >= totalBlocks) {
            gridCols--;
            gridRows = Math.ceil(totalBlocks / gridCols);
        }
        
        // Calcular tamaño de celdas y espaciado
        const availableWidth = svgWidth - 2 * margin;
        const availableHeight = svgHeight - 2 * margin;
        const totalStreetWidthH = (gridRows - 1) * streetWidth;
        const totalStreetWidthV = (gridCols - 1) * streetWidth;
        
        const cellWidth = Math.max(minCellWidth, Math.floor((availableWidth - totalStreetWidthV) / gridCols));
        const cellHeight = Math.max(minCellHeight, Math.floor((availableHeight - totalStreetWidthH) / gridRows));
        
        // Generar posiciones automáticamente
        const blockLayouts = {};
        blocks.forEach((bloque, index) => {
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            blockLayouts[bloque] = {
                x: margin + col * (cellWidth + streetWidth),
                y: margin + row * (cellHeight + streetWidth),
                width: cellWidth,
                height: cellHeight,
                shape: 'rect'
            };
        });

        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiMap className="w-5 h-5" />
                    Plano General de Bloques
                </h2>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="relative bg-gray-50 rounded-lg" style={{ width: '100%', height: '400px' }}>
                        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="border border-gray-300 rounded">
                            {/* Calles dinámicas entre cuadrículas */}
                            {Array.from({ length: gridRows - 1 }).map((_, rowIndex) => (
                                <rect
                                    key={`street-h-${rowIndex}`}
                                    x={0}
                                    y={margin + (rowIndex + 1) * cellHeight + rowIndex * streetWidth}
                                    width={svgWidth}
                                    height={streetWidth}
                                    fill="#d1d5db"
                                />
                            ))}
                            {Array.from({ length: gridCols - 1 }).map((_, colIndex) => (
                                <rect
                                    key={`street-v-${colIndex}`}
                                    x={margin + (colIndex + 1) * cellWidth + colIndex * streetWidth}
                                    y={0}
                                    width={streetWidth}
                                    height={svgHeight}
                                    fill="#d1d5db"
                                />
                            ))}
                            
                            {/* Renderizar bloques en cuadrícula */}
                            {blocks.map(bloque => {
                                const layout = blockLayouts[bloque];
                                const espacios = groupedEspacios[bloque];
                                const activos = espacios.filter(e => e.disponible).length;
                                
                                return (
                                    <g key={bloque}>
                                        <rect
                                            x={layout.x}
                                            y={layout.y}
                                            width={layout.width}
                                            height={layout.height}
                                            fill="#dbeafe"
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                            className="cursor-pointer hover:fill-blue-200 transition-colors"
                                            onClick={() => setSelectedBlock({ bloque, espacios })}
                                            rx="4"
                                        />
                                        <text
                                            x={layout.x + layout.width/2}
                                            y={layout.y + layout.height/2 - 8}
                                            textAnchor="middle"
                                            className="text-sm font-bold fill-gray-800 pointer-events-none"
                                        >
                                            {bloque}
                                        </text>
                                        <text
                                            x={layout.x + layout.width/2}
                                            y={layout.y + layout.height/2 + 8}
                                            textAnchor="middle"
                                            className="text-xs fill-gray-600 pointer-events-none"
                                        >
                                            {espacios.length} espacios
                                        </text>
                                        <text
                                            x={layout.x + layout.width/2}
                                            y={layout.y + layout.height/2 + 20}
                                            textAnchor="middle"
                                            className="text-xs fill-green-600 pointer-events-none"
                                        >
                                            {activos} activos
                                        </text>
                                    </g>
                                );
                            })}
                            
                                                    </svg>
                    </div>

                    
                </div>
            </div>
        );
    };


    // Seleccionar espacio para ver horario
    const selectSpace = (space) => {
        
        
        
        
        
        
        
        
        
        
        // Verificar si el espacio está disponible
        if (!space.disponible) {
            
            setUnavailableSpace(space);
            setShowUnavailableModal(true);
            return;
        }
        
        
        setSelectedSpace(space);
        setShowSchedule(true);
        
        // Limpiar selección al cambiar de espacio
        clearSelection();
        
        // Cargar reservas del espacio
        cargarReservasEspacio(space.id);
    };

    // Volver a la lista de espacios
    const backToSpaces = () => {
        setShowSchedule(false);
        setSelectedSpace(null);
    };


    if (showSchedule && selectedSpace) {
        return (
            <DashboardLayout title="Horario del Espacio">
                <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
                    <style>{`
                      @keyframes cdFloat1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                      @keyframes cdFloat2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(18px); } }
                      @keyframes cdShimmer { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
                    `}</style>
                    <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)', padding: '1.5rem 2rem', position: 'relative', overflow: 'hidden', color: 'white' }}>
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(96,165,250,0.12)', animation: 'cdFloat1 8s ease-in-out infinite' }} />
                        <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(147,197,253,0.09)', animation: 'cdFloat2 10s ease-in-out infinite' }} />
                        <div style={{ position: 'absolute', top: '20%', left: '55%', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'cdShimmer 5s ease-in-out infinite' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.2rem' }}>
                                {getNombreBloque(selectedSpace.bloque)} · Salón {selectedSpace.salon} · {selectedSpace.capacidad} personas
                            </p>
                            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
                                Horario — {selectedSpace.nombre}
                            </h1>
                        </div>
                    </div>
                    <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button
                            onClick={backToSpaces}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                        >
                            <FiArrowLeft size={13} /> Volver a espacios
                        </button>
                    </div>
                    <div className="p-6">
                    

                    {/* Navegación de semanas */}
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={prevWeek}
                                disabled={isCurrentWeek()}
                                className={`px-4 py-2 rounded transition-colors text-sm flex items-center justify-center ${
                                    isCurrentWeek()
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-500 text-white hover:bg-gray-600'
                                }`}
                            >
                                <FiArrowLeft className="w-4 h-4 mr-2" />
                            Semana anterior
                            </button>
                            <div className="text-sm font-medium text-gray-700 flex items-center justify-center">
                                <FiCalendar className="w-4 h-4 mr-2" />
                            Semana: {formatWeekRange()}
                            </div>
                            <button
                                onClick={nextWeek}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center justify-center"
                            >
                                Siguiente semana
                                <FiArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </button>
                        </div>
                    </div>

                    {/* Grid de horario */}
                    {/* Botón de reservar */}
                    {selectedSlots.length > 0 && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-blue-800">
                                        Franjas seleccionadas: {selectedSlots.length}
                                    </h4>
                                    <div className="text-xs text-blue-600 mt-1">
                                        {selectedSlots.map(s => `${s.day} ${s.slot}`).join(', ')}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={clearSelection}
                                        className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                                    >
                                        Limpiar
                                    </button>
                                    <button
                                        onClick={() => {
                                            
                                            mostrarModalDirecto();
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Reservar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow overflow-auto relative">
                        {loadingReservas && (
                            <div className="absolute inset-0 bg-white/75 z-10 flex flex-col items-center justify-center rounded-lg gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                <span className="text-sm text-gray-600 font-medium">Cargando disponibilidad...</span>
                            </div>
                        )}
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                        Franja Horaria
                                    </th>
                                    {days.map((day, index) => (
                                        <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                                            <div>{day}</div>
                                            <div className="text-xs text-gray-400">
                                                {weekDates[index].getDate()} {weekDates[index].toLocaleString('default', { month: 'short' })}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {timeSlots.map((slot, slotIndex) => (
                                    <tr key={slotIndex} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border">
                                            {slot}
                                        </td>
                                        {days.map((day, dayIndex) => {
                                            const ocupado = estaOcupado(day, slot);
                                            const pasado = esSlotPasado(day, slot);
                                            const reservaInfo = getReservaInfo(day, slot);
                                            const seleccionado = isSlotSelected(day, slot);

                                            return (
                                                <td key={`${dayIndex}-${slotIndex}`} className="px-2 py-2 text-center border">
                                                    {ocupado ? (
                                                        <div className="relative group">
                                                            <div className="w-full h-8 bg-red-100 rounded hover:bg-red-200 cursor-pointer transition-colors flex items-center justify-center">
                                                                <span className="text-xs text-red-800 font-medium">Ocupado</span>
                                                            </div>
                                                            
                                                            {/* Tooltip con información de la reserva */}
                                                            {reservaInfo && (
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10">
                                                                    <div className="font-medium">{reservaInfo.motivo || 'Sin motivo'}</div>
                                                                    <div className="text-gray-300">
                                                                        {reservaInfo.tipo === 'permanente' ? 'Permanente' : 'Ocasional'}
                                                                    </div>  
                                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : pasado ? (
                                                        <div className="w-full h-8 bg-gray-100 rounded flex items-center justify-center cursor-not-allowed">
                                                            <span className="text-xs text-gray-400">No disponible</span>
                                                        </div>
                                                    ) : seleccionado ? (
                                                        <div
                                                            onClick={() => handleSlotClick(day, slot)}
                                                            className="w-full h-8 bg-blue-500 rounded hover:bg-blue-600 cursor-pointer transition-colors flex items-center justify-center"
                                                        >
                                                            <span className="text-xs text-white font-medium">Seleccionado</span>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={() => handleSlotClick(day, slot)}
                                                            className="w-full h-8 bg-green-100 rounded hover:bg-green-200 cursor-pointer transition-colors flex items-center justify-center"
                                                        >
                                                            <span className="text-xs text-green-800">Disponible</span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        
                        
                                                
                        {/* Indicador de carga de reservas */}
                        {loadingReservas && (
                            <div className="mt-3 flex items-center text-xs text-gray-600">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                                Cargando reservas existentes...
                            </div>
                        )}
                        
                        {/* Error de carga */}
                        {reservasError && (
                            <div className="mt-3 flex items-center text-xs text-red-600">
                                <FiInfo className="mr-1" />
                                {reservasError}
                            </div>
                        )}
                    </div>
                </div>
                </div>

                {/* Modal de resumen de reserva */}
                <ModalResumenReserva
                    show={showResumenModal}
                    onClose={() => setShowResumenModal(false)}
                    resumen={resumenReserva}
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Consulta de Disponibilidad">
            <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
                <style>{`
                  @keyframes cdFloat1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                  @keyframes cdFloat2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(18px); } }
                  @keyframes cdShimmer { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
                `}</style>
                <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)', padding: '2rem', position: 'relative', overflow: 'hidden', color: 'white' }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(96,165,250,0.12)', animation: 'cdFloat1 8s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(147,197,253,0.09)', animation: 'cdFloat2 10s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', top: '20%', left: '55%', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'cdShimmer 5s ease-in-out infinite' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Consulta de Disponibilidad</h1>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>Selecciona un bloque y espacio para ver disponibilidad y reservar</p>
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

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                        <span className="text-gray-600">Cargando espacios...</span>
                    </div>
                )}

                {/* Plano 2D general */}
                {!loading && !error && (
                    renderMain2D()
                )}

            {/* Modal de Espacio No Disponible */}
            {showUnavailableModal && unavailableSpace && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full transform transition-all">
                        <div className="text-center">
                            {/* Icono de no disponible */}
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Espacio No Disponible
                            </h3>
                            
                            
                            
                            <p className="text-gray-600 mb-6">
                                Este espacio no se encuentra disponible para consultas o reservas en este momento. 
                                Por favor, contacte al administrador del sistema para más información.
                            </p>
                            
                            <button
                                onClick={() => setShowUnavailableModal(false)}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de reserva - Simple */}
            {(() => {
               
                if (modalVisible || showReservaModal) {
                }
                return modalVisible || showReservaModal;
            })() && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Confirmar Reserva</h3>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <strong>Espacio:</strong> {selectedSpace?.nombre}<br/>
                            <strong>Franjas:</strong><br/>
                            {selectedSlots.map((slot, i) => (
                                <div key={i}>• {slot.day} - {slot.slot}</div>
                            ))}
                        </div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label><strong>Motivo:</strong></label><br/>
                            <textarea
                                value={reservaMotivo}
                                onChange={(e) => setReservaMotivo(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '80px',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    resize: 'vertical'
                                }}
                                placeholder="Escribe el motivo..."
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => {
                                    setModalVisible(false);
                                    setShowReservaModal(false);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReserva}
                                disabled={!reservaMotivo.trim() || loadingReserva}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: (!reservaMotivo.trim() || loadingReserva) ? '#ccc' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: (!reservaMotivo.trim() || loadingReserva) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loadingReserva ? 'Creando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
            </div>

            {/* Modal espacio ocupado */}
            {conflictoEspacio && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50" style={{ zIndex: 100000 }}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <FiAlertCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Espacio ocupado</h3>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                Este espacio ya tiene una reserva vigente para ese horario:
                            </p>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 space-y-1">
                                <div><span className="font-medium">Horario:</span> {conflictoEspacio.horaInicio} – {conflictoEspacio.horaFin}</div>
                                {conflictoEspacio.personaNombre && <div><span className="font-medium">Reservado por:</span> {conflictoEspacio.personaNombre}</div>}
                                {conflictoEspacio.motivo && <div><span className="font-medium">Motivo:</span> {conflictoEspacio.motivo}</div>}
                            </div>
                            <p className="text-gray-500 text-xs mt-3">Por favor selecciona otro horario disponible.</p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setConflictoEspacio(null)}
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de resumen de reserva */}
            <ModalResumenReserva
                show={showResumenModal}
                onClose={() => setShowResumenModal(false)}
                resumen={resumenReserva}
            />
        </DashboardLayout>
    );
};

export default ConsultaDisponibilidad;
