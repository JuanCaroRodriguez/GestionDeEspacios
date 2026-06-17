import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@components/Layout/DashboardLayout';
import espaciosService from '@api/services/espacios.service';
import reservasService from '@api/services/reservas.service';
import bloquesService from '@api/services/bloques.service';
import { departamentosService } from '@api/services/departamentos.service';
import useSession from '../context/Auth/useSession';
import { toast } from 'sonner';
import { FiBarChart2, FiCalendar, FiFilter, FiDownload, FiRefreshCw, FiPieChart, FiTrendingUp, FiUsers, FiHome, FiLogOut } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const ReportesUso = () => {
    const { session } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [espacios, setEspacios] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [bloques, setBloques] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    
    // Filtros
    const [fechaInicio, setFechaInicio] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split('T')[0]; });
    const [fechaFin, setFechaFin] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth() + 1, 0).toISOString().split('T')[0]; });
    const [tipoEspacio, setTipoEspacio] = useState('todos');
    const [estadoReserva, setEstadoReserva] = useState('todos');
    const [selectedBloque, setSelectedBloque] = useState('todos');
    const [selectedDepartamento, setSelectedDepartamento] = useState('todos');
    const [modoDepartamento, setModoDepartamento] = useState('solo-labs'); // 'solo-labs' o 'labs-mas-sin-dependencia'
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [errorFechas, setErrorFechas] = useState('');
    const exportMenuRef = useRef(null);
    
    // Estadísticas
    const [estadisticas, setEstadisticas] = useState({
        totalEspacios: 0,
        totalReservas: 0,
        ocupacionPromedio: 0,
        espaciosMasUsados: [],
        reservasPorEstado: {},
        reservasPorTipo: {},
        tendenciasMensuales: []
    });

    // Colores para gráficas
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [reservas, espacios, fechaInicio, fechaFin, tipoEspacio, estadoReserva, selectedBloque, selectedDepartamento, modoDepartamento]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const idEmpresa = session?.user?.id_empresa;
            if (!idEmpresa) {
                setError('No tienes una empresa asignada');
                return;
            }

            // Cargar espacios, reservas, bloques y departamentos en paralelo
            const [espaciosData, reservasData, bloquesData, departamentosData] = await Promise.all([
                espaciosService.getByEmpresa(idEmpresa),
                reservasService.getAllByEmpresa(idEmpresa),
                bloquesService.getByIdEmpresa(idEmpresa),
                departamentosService.getByEmpresa(idEmpresa)
            ]);

            // Filtrar espacios según el rol del usuario
            let espaciosFiltrados = espaciosData;
            const userTipo = session?.user?.tipo;
            
            if (userTipo === 'administrador') {
                // Administrador: solo laboratorios de su departamento
                const adminDepartamento = session?.user?.departamento;
                espaciosFiltrados = espaciosData.filter(espacio => {
                    if (espacio.tipo.toLowerCase() === 'laboratorio') {
                        return espacio.departamento === adminDepartamento;
                    }
                    return true; // Otros tipos visibles para todos
                });
            }
            // Superadmin: todos los espacios (filtrado se hace en UI)

            setEspacios(espaciosFiltrados);
            setReservas(reservasData);
            setBloques(bloquesData);
            setDepartamentos(departamentosData);
            
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('No se pudieron cargar los datos. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let reservasFiltradas = [...reservas];

        // Filtrar por fecha
        if (fechaInicio) {
            reservasFiltradas = reservasFiltradas.filter(r => 
                new Date(r.fecha) >= new Date(fechaInicio)
            );
        }
        if (fechaFin) {
            reservasFiltradas = reservasFiltradas.filter(r => 
                new Date(r.fecha) <= new Date(fechaFin)
            );
        }

        // Filtrar por tipo de espacio
        if (tipoEspacio !== 'todos') {
            const espaciosFiltrados = espacios.filter(e => e.tipo === tipoEspacio);
            const espacioIds = espaciosFiltrados.map(e => e.id);
            reservasFiltradas = reservasFiltradas.filter(r => espacioIds.includes(r.espacioId));
        }

        // Filtrar por estado
        if (estadoReserva !== 'todos') {
            reservasFiltradas = reservasFiltradas.filter(r => r.estado === estadoReserva);
        }

        // Filtrar por bloque
        if (selectedBloque !== 'todos') {
            const espaciosFiltrados = espacios.filter(e => e.bloque === selectedBloque);
            const espacioIds = espaciosFiltrados.map(e => e.id);
            reservasFiltradas = reservasFiltradas.filter(r => espacioIds.includes(r.espacioId));
        }

        // Filtrar por departamento para administradores y superadmin
        if (session?.user?.tipo === 'administrador') {
            // Administrador: solo reservas de espacios visibles (ya filtrados por departamento)
            const espacioIds = espacios.map(e => e.id);
            reservasFiltradas = reservasFiltradas.filter(r => espacioIds.includes(r.espacioId));
        } else if (session?.user?.tipo === 'superadmin' && selectedDepartamento !== 'todos') {
            let espaciosFiltrados;
            
            if (modoDepartamento === 'solo-labs') {
                // Modo 1: Solo laboratorios del departamento seleccionado
                espaciosFiltrados = espacios.filter(e => 
                    e.tipo.toLowerCase() === 'laboratorio' && e.departamento === selectedDepartamento
                );
            } else {
                // Modo 2: Laboratorios del departamento + espacios sin dependencia
                espaciosFiltrados = espacios.filter(e => {
                    if (e.tipo.toLowerCase() === 'laboratorio') {
                        return e.departamento === selectedDepartamento;
                    } else {
                        // Espacios que no son laboratorios
                        return !e.departamento || e.departamento === 'no-aplica';
                    }
                });
            }
            
            const espacioIds = espaciosFiltrados.map(e => e.id);
            reservasFiltradas = reservasFiltradas.filter(r => espacioIds.includes(r.espacioId));
        }

        setFilteredData(reservasFiltradas);
        calcularEstadisticas(reservasFiltradas);
    };

    const calcularEstadisticas = (reservasFiltradas) => {
        // Estadísticas básicas
        const totalReservas = reservasFiltradas.length;
        const totalEspacios = espacios.length;

        // Reservas por estado
        const reservasPorEstado = reservasFiltradas.reduce((acc, reserva) => {
            acc[reserva.estado] = (acc[reserva.estado] || 0) + 1;
            return acc;
        }, {});

        // Reservas por tipo de espacio
        const reservasPorTipo = {};
        reservasFiltradas.forEach(reserva => {
            const espacio = espacios.find(e => e.id === reserva.espacioId);
            if (espacio) {
                const tipo = espacio.tipo;
                reservasPorTipo[tipo] = (reservasPorTipo[tipo] || 0) + 1;
            }
        });

        // Espacios más usados
        const usoPorEspacio = {};
        reservasFiltradas.forEach(reserva => {
            const espacio = espacios.find(e => e.id === reserva.espacioId);
            if (espacio) {
                const nombre = `${espacio.tipo} - ${espacio.salon}`;
                usoPorEspacio[nombre] = (usoPorEspacio[nombre] || 0) + 1;
            }
        });

        const espaciosMasUsados = Object.entries(usoPorEspacio)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }));

        // Tendencias mensuales
        const tendenciasMensuales = {};
        reservasFiltradas.forEach(reserva => {
            const fecha = new Date(reserva.fecha);
            const mes = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
            tendenciasMensuales[mes] = (tendenciasMensuales[mes] || 0) + 1;
        });

        const tendenciasArray = Object.entries(tendenciasMensuales)
            .map(([mes, cantidad]) => ({ mes, cantidad }))
            .sort((a, b) => new Date(a.mes) - new Date(b.mes));

        // Ocupación promedio
        const diasUnicos = new Set(reservasFiltradas.map(r => r.fecha)).size;
        const ocupacionPromedio = diasUnicos > 0 ? (totalReservas / diasUnicos).toFixed(1) : 0;

        setEstadisticas({
            totalEspacios,
            totalReservas,
            ocupacionPromedio,
            espaciosMasUsados,
            reservasPorEstado,
            reservasPorTipo,
            tendenciasMensuales: tendenciasArray
        });
    };

    const limpiarFiltros = () => {
        setFechaInicio('');
        setFechaFin('');
        setTipoEspacio('todos');
        setEstadoReserva('todos');
        setSelectedBloque('todos');
    };

    useEffect(() => {
        const handleOutside = (e) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target))
                setShowExportMenu(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const exportarReporteVisual = async () => {
        try {
            toast.info('Generando reporte visual...');
            const { jsPDF } = await import('jspdf');
            const html2canvas = (await import('html2canvas')).default;

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pW = 297, pH = 210, mg = 12, cW = 273;

            // === HEADER ===
            doc.setFillColor(15, 23, 42); doc.rect(0, 0, pW, 24, 'F');
            doc.setFillColor(37, 99, 235); doc.rect(0, 19, pW, 5, 'F');
            doc.setFillColor(30, 58, 138); doc.circle(pW + 8, -8, 48, 'F');
            doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
            doc.text('Reporte de Uso de Espacios', mg, 12);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(147, 197, 253);
            const periodoTextV = (fechaInicio && fechaFin)
                ? `Período: ${new Date(fechaInicio+'T12:00:00').toLocaleDateString('es-ES')} al ${new Date(fechaFin+'T12:00:00').toLocaleDateString('es-ES')}`
                : 'Período: Todos los datos disponibles';
            doc.text(periodoTextV, mg, 18);
            doc.setFontSize(6.5); doc.setTextColor(255,255,255);
            doc.text('Generado: ' + new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' }), pW-mg, 21, { align: 'right' });

            // === STATS CARDS ===
            let y = 28;
            const cardsV = [
                { label:'Total Espacios',     value:String(estadisticas.totalEspacios),    r:59,  g:130, b:246 },
                { label:'Total Reservas',     value:String(estadisticas.totalReservas),    r:16,  g:185, b:129 },
                { label:'Ocup. Promedio',     value:estadisticas.ocupacionPromedio+'/día', r:139, g:92,  b:246 },
                { label:'Reservas Filtradas', value:String(filteredData.length),           r:249, g:115, b:22  },
            ];
            const cardWV = (cW - 9) / 4, cardHV = 16;
            cardsV.forEach((card, i) => {
                const x = mg + i * (cardWV + 3);
                doc.setFillColor(210, 218, 228); doc.roundedRect(x+0.5, y+0.5, cardWV, cardHV, 1.5, 1.5, 'F');
                doc.setFillColor(255, 255, 255); doc.roundedRect(x, y, cardWV, cardHV, 1.5, 1.5, 'F');
                doc.setFillColor(card.r, card.g, card.b); doc.roundedRect(x, y, 2.5, cardHV, 1, 1, 'F');
                doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(card.r, card.g, card.b);
                doc.text(card.value, x+5, y+8);
                doc.setFont('helvetica','bold'); doc.setFontSize(6); doc.setTextColor(30, 41, 59);
                doc.text(card.label, x+5, y+13);
            });
            y += cardHV + 4;

            // === CHART HELPERS ===
            const capV = async (id) => {
                const el = document.getElementById(id);
                if (!el) return null;
                const cv = await html2canvas(el, { scale: 2, backgroundColor:'#ffffff', useCORS:true, logging:false, allowTaint:true });
                return cv.toDataURL('image/png');
            };
            const boxV = (img, x, yp, w, h) => {
                doc.setFillColor(255,255,255); doc.roundedRect(x, yp, w, h, 2, 2, 'F');
                doc.setDrawColor(226,232,240); doc.setLineWidth(0.2); doc.roundedRect(x, yp, w, h, 2, 2, 'S');
                doc.addImage(img, 'PNG', x, yp, w, h);
            };

            // === PIE CHART MANUAL DRAW (html2canvas no captura SVG text) ===
            const drawPieCanvas = (data, colors, title) => {
                const W = 620, H = 400;
                const canvas = document.createElement('canvas');
                canvas.width = W; canvas.height = H;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);

                ctx.fillStyle = '#111827'; ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'left'; ctx.textBaseline = 'top';
                ctx.fillText(title, 20, 18);

                const total = data.reduce((s, d) => s + d.value, 0);
                if (total === 0) return canvas.toDataURL('image/png');

                const cx = W / 2, cy = H / 2 + 10, r = 120;
                let startAngle = -Math.PI / 2;

                data.forEach((item, i) => {
                    const slice = (item.value / total) * 2 * Math.PI;
                    const endAngle = startAngle + slice;
                    const mid = startAngle + slice / 2;

                    // Slice
                    ctx.beginPath(); ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, r, startAngle, endAngle);
                    ctx.closePath();
                    ctx.fillStyle = colors[i % colors.length]; ctx.fill();
                    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();

                    // Label line
                    const lsr = r + 10, ler = r + 38;
                    ctx.beginPath();
                    ctx.moveTo(cx + lsr * Math.cos(mid), cy + lsr * Math.sin(mid));
                    ctx.lineTo(cx + ler * Math.cos(mid), cy + ler * Math.sin(mid));
                    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.stroke();

                    // Label text
                    const lx = cx + (r + 50) * Math.cos(mid);
                    const ly = cy + (r + 50) * Math.sin(mid);
                    const pct = ((item.value / total) * 100).toFixed(0);
                    ctx.fillStyle = colors[i % colors.length];
                    ctx.font = '500 13px sans-serif';
                    ctx.textAlign = lx > cx ? 'left' : 'right';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`${item.name} ${pct}%`, lx, ly);

                    startAngle = endAngle;
                });
                return canvas.toDataURL('image/png');
            };

            // === 4 CHARTS 2×2 ===
            const chartH = Math.floor((pH - mg - y - 4) / 2);
            const halfWV = (cW - 4) / 2;
            const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
            const imgE = drawPieCanvas(datosEstado, pieColors, 'Reservas por Estado');
            const [imgT, imgEsp, imgTend] = await Promise.all([
                capV('chart-tipo'), capV('chart-espacios'), capV('chart-tendencias')
            ]);
            if (imgE)    boxV(imgE,    mg,             y,            halfWV, chartH);
            if (imgT)    boxV(imgT,    mg+halfWV+4,    y,            halfWV, chartH);
            if (imgEsp)  boxV(imgEsp,  mg,             y+chartH+4,   halfWV, chartH);
            if (imgTend) boxV(imgTend, mg+halfWV+4,    y+chartH+4,   halfWV, chartH);

            // === FOOTER ===
            doc.setDrawColor(226,232,240); doc.setLineWidth(0.3);
            doc.line(mg, pH-7, pW-mg, pH-7);
            doc.setFont('helvetica','normal'); doc.setFontSize(5.5); doc.setTextColor(148,163,184);
            doc.text('Sistema de Gestión de Espacios', mg, pH-3);
            doc.text('Reporte Visual · 1 página', pW-mg, pH-3, { align:'right' });

            doc.save(`reporte_visual_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Reporte visual generado');
        } catch (err) {
            console.error(err);
            toast.error('Error al generar el reporte visual');
        }
    };

    const exportarTabla = async () => {
        try {
            toast.info('Generando tabla de datos...');
            const { jsPDF } = await import('jspdf');

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pW = 297, pH = 210, mg = 10, cW = 277;

            const drawPageHeader = () => {
                doc.setFillColor(15, 23, 42); doc.rect(0, 0, pW, 20, 'F');
                doc.setFillColor(37, 99, 235); doc.rect(0, 16, pW, 4, 'F');
                doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(13);
                doc.text('Datos de Reservas', mg, 11);
                doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(147, 197, 253);
                const periodoT = (fechaInicio && fechaFin)
                    ? `Período: ${new Date(fechaInicio+'T12:00:00').toLocaleDateString('es-ES')} al ${new Date(fechaFin+'T12:00:00').toLocaleDateString('es-ES')} · ${filteredData.length} registros`
                    : `Todos los datos · ${filteredData.length} registros`;
                doc.text(periodoT, mg, 15);
                doc.setFontSize(6.5); doc.setTextColor(255,255,255);
                doc.text('Generado: ' + new Date().toLocaleDateString('es-ES'), pW-mg, 18, { align:'right' });
            };
            drawPageHeader();

            const cols = [
                { label:'Fec. Reserva', w:24 }, { label:'Hora Inicio', w:20 },
                { label:'Hora Fin',     w:20 }, { label:'Tipo Espacio', w:26 },
                { label:'Bloque',       w:28 }, { label:'Piso',        w:12 },
                { label:'Salón',        w:18 }, { label:'Estado',      w:24 },
                { label:'Responsable', w:50 }, { label:'Motivo',      w:95 },
            ];
            const statusColors = { 'Reservada':[16,185,129],'Pendiente':[245,158,11],'Ejecutada':[59,130,246],'Cancelada':[239,68,68] };
            const fmtDate = (d) => { try { if (!d) return 'N/A'; const dt = new Date(d); return isNaN(dt.getTime()) ? 'N/A' : dt.toLocaleDateString('es-ES'); } catch { return 'N/A'; } };
            const fmtTime = (d) => { try { if (!d) return 'N/A'; const dt = new Date(d); return isNaN(dt.getTime()) ? 'N/A' : dt.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' }); } catch { return 'N/A'; } };

            const drawTableHeader = (yh) => {
                doc.setFillColor(15,23,42); doc.roundedRect(mg, yh-1.5, cW, 9, 1.5, 1.5, 'F');
                doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(255,255,255);
                let cx = mg + 2.5;
                cols.forEach(c => { doc.text(c.label, cx, yh+4); cx += c.w; });
                return yh + 11;
            };

            let y = 26;
            y = drawTableHeader(y);

            filteredData.forEach((r, idx) => {
                if (y > pH - 14) {
                    doc.addPage();
                    drawPageHeader();
                    y = 26;
                    y = drawTableHeader(y);
                }
                if (idx % 2 === 0) { doc.setFillColor(248,250,252); doc.rect(mg, y-3.5, cW, 7.5, 'F'); }
                const espacio = espacios.find(e => e.id === r.espacioId);
                const bloque = bloques.find(b => b.id === espacio?.bloque || b._id === espacio?.bloque);
                const fechaReserva  = r.fecha || r.fechaReserva || r.fecha_reserva;
                const cells = [
                    { val: fmtDate(fechaReserva),                                            w: cols[0].w },
                    { val: r.horaInicio || r.hora_inicio || r.horaInicio || 'N/A',           w: cols[1].w },
                    { val: r.horaFin    || r.hora_fin    || r.horaFin    || 'N/A',           w: cols[2].w },
                    { val: espacio?.tipo    || 'N/A',                                        w: cols[3].w },
                    { val: bloque?.nombre   || espacio?.bloque || 'N/A',                     w: cols[4].w },
                    { val: String(espacio?.piso ?? 'N/A'),                                   w: cols[5].w },
                    { val: espacio?.salon   || 'N/A',                                        w: cols[6].w },
                    { val: r.estado         || 'N/A', status:true, estado:r.estado,          w: cols[7].w },
                    { val: r.personaNombre  || 'N/A',                                        w: cols[8].w },
                    { val: r.motivo         || r.descripcion || r.razon || 'N/A',            w: cols[9].w },
                ];
                let cx = mg + 2.5;
                cells.forEach(cell => {
                    if (cell.status) { const sc=statusColors[cell.estado]||[100,116,139]; doc.setTextColor(...sc); doc.setFont('helvetica','bold'); }
                    else { doc.setTextColor(51,65,85); doc.setFont('helvetica','normal'); }
                    doc.setFontSize(7);
                    const maxC = Math.floor(cell.w / 1.85);
                    doc.text(cell.val.length>maxC ? cell.val.slice(0,maxC-1)+'…' : cell.val, cx, y+1);
                    cx += cell.w;
                });
                y += 7.5;
            });

            const totalPages = doc.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) {
                doc.setPage(p);
                doc.setDrawColor(226,232,240); doc.setLineWidth(0.3);
                doc.line(mg, pH-7, pW-mg, pH-7);
                doc.setFont('helvetica','normal'); doc.setFontSize(5.5); doc.setTextColor(148,163,184);
                doc.text('Sistema de Gestión de Espacios', mg, pH-3);
                doc.text(`Página ${p} de ${totalPages}`, pW-mg, pH-3, { align:'right' });
            }

            doc.save(`datos_reservas_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Tabla de datos generada');
        } catch (err) {
            console.error(err);
            toast.error('Error al generar la tabla');
        }
    };

    // Datos para gráficas
    const datosEstado = Object.entries(estadisticas.reservasPorEstado).map(([estado, cantidad]) => ({
        name: estado.charAt(0).toUpperCase() + estado.slice(1),
        value: cantidad
    }));

    const datosTipo = Object.entries(estadisticas.reservasPorTipo).map(([tipo, cantidad]) => ({
        name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        value: cantidad
    }));

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FiTrendingUp className="text-red-600 mr-2" />
                        <span className="text-red-800">{error}</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
                <style>{`
                  @keyframes ruFloat1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                  @keyframes ruFloat2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(18px); } }
                  @keyframes ruShimmer { 0% { opacity: 0.2; } 50% { opacity: 0.5; } 100% { opacity: 0.2; } }
                `}</style>
                <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)', padding: '2rem', position: 'relative', overflow: 'hidden', color: 'white' }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(96,165,250,0.12)', animation: 'ruFloat1 8s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(147,197,253,0.09)', animation: 'ruFloat2 10s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', top: '20%', left: '55%', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'ruShimmer 5s ease-in-out infinite' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Reportes de Uso</h1>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>Estadísticas y análisis de uso de los espacios</p>
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

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FiFilter className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={limpiarFiltros}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <FiRefreshCw className="w-4 h-4" />
                                Limpiar filtros
                            </button>
                            <div ref={exportMenuRef} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowExportMenu(v => !v)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FiDownload className="w-4 h-4" />
                                    Exportar
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ marginLeft: '2px' }}><path d="M5 7L1 3h8L5 7z"/></svg>
                                </button>
                                {showExportMenu && (
                                    <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, backgroundColor:'white', borderRadius:'0.75rem', boxShadow:'0 8px 30px rgba(255,255,255,0.13)', zIndex:200, minWidth:'210px', overflow:'hidden', border:'1px solid #e2e8f0' }}>
                                        <button
                                            onClick={() => { setShowExportMenu(false); exportarReporteVisual(); }}
                                            style={{ display:'flex', alignItems:'center', gap:'0.75rem', width:'100%', padding:'0.8rem 1rem', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
                                            onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.background='none'}
                                        >
                                            <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                <FiPieChart size={14} color="#2563eb" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight:'600', fontSize:'0.82rem', color:'#0f172a' }}>Reporte Visual</div>
                                                <div style={{ fontSize:'0.71rem', color:'#94a3b8' }}>Gráficas en 1 página</div>
                                            </div>
                                        </button>
                                        <div style={{ height:'1px', background:'#f1f5f9', margin:'0 0.75rem' }} />
                                        <button
                                            onClick={() => { setShowExportMenu(false); exportarTabla(); }}
                                            style={{ display:'flex', alignItems:'center', gap:'0.75rem', width:'100%', padding:'0.8rem 1rem', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
                                            onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.background='none'}
                                        >
                                            <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                <FiFilter size={14} color="#16a34a" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight:'600', fontSize:'0.82rem', color:'#0f172a' }}>Exportar Datos</div>
                                                <div style={{ fontSize:'0.71rem', color:'#94a3b8' }}>Tabla con todos los registros</div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => {
                                    const nuevaFecha = e.target.value;
                                    setFechaInicio(nuevaFecha);
                                    if (fechaFin && new Date(nuevaFecha) > new Date(fechaFin)) {
                                        setFechaFin('');
                                        setErrorFechas('');
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                min={fechaInicio}
                                onChange={(e) => {
                                    const nuevaFecha = e.target.value;
                                    if (fechaInicio && new Date(nuevaFecha) < new Date(fechaInicio)) {
                                        setErrorFechas('La fecha final no puede ser anterior a la fecha inicial');
                                        return;
                                    }
                                    setErrorFechas('');
                                    setFechaFin(nuevaFecha);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de espacio</label>
                            <select
                                value={tipoEspacio}
                                onChange={(e) => setTipoEspacio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="todos">Todos</option>
                                {[...new Set(espacios.map(e => e.tipo))].map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                value={estadoReserva}
                                onChange={(e) => setEstadoReserva(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="todos">Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Reservada">Reservada</option>
                                <option value="Ejecutada">Ejecutada</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bloque</label>
                            <select
                                value={selectedBloque}
                                onChange={(e) => setSelectedBloque(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="todos">Todos</option>
                                {[...new Set(espacios.map(e => e.bloque))].map(bloqueId => {
                                    const bloque = bloques.find(b => b.id === bloqueId || b._id === bloqueId);
                                    const nombre = bloque?.nombre || bloqueId;
                                    return (
                                        <option key={bloqueId} value={bloqueId}>{nombre}</option>
                                    );
                                })}
                            </select>
                        </div>
                        
                        {/* Filtro por departamento - solo para superadmin */}
                        {session?.user?.tipo === 'superadmin' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                <select
                                    value={selectedDepartamento}
                                    onChange={(e) => setSelectedDepartamento(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="todos">Todos</option>
                                    {departamentos.map(departamento => (
                                        <option key={departamento.id} value={departamento.id}>
                                            {departamento.nombre}
                                        </option>
                                    ))}
                                </select>
                                
                                {selectedDepartamento !== 'todos' && (
                                    <div className="mt-2 space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="modoDepartamento"
                                                value="solo-labs"
                                                checked={modoDepartamento === 'solo-labs'}
                                                onChange={(e) => setModoDepartamento(e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">
                                                Solo laboratorios de este departamento
                                            </span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="modoDepartamento"
                                                value="labs-mas-sin-dependencia"
                                                checked={modoDepartamento === 'labs-mas-sin-dependencia'}
                                                onChange={(e) => setModoDepartamento(e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">
                                                Laboratorios del departamento + espacios sin dependencia
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {errorFechas && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{errorFechas}</span>
                        </div>
                    )}
                </div>

                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total de espacios</p>
                                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalEspacios}</p>
                            </div>
                            <FiHome className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total de reservas</p>
                                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalReservas}</p>
                            </div>
                            <FiCalendar className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ocupación promedio</p>
                                <p className="text-2xl font-bold text-gray-900">{estadisticas.ocupacionPromedio}</p>
                                <p className="text-xs text-gray-500">reservas/día</p>
                            </div>
                            <FiTrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Reservas filtradas</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
                            </div>
                            <FiFilter className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Gráficas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Gráfica de reservas por estado */}
                    <div id="chart-estado" className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas por Estado</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={datosEstado}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                    label={({ cx, cy, midAngle, outerRadius, name, percent, index }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = outerRadius + 36;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return (
                                            <text
                                                x={x} y={y}
                                                fill={COLORS[index % COLORS.length]}
                                                textAnchor={x > cx ? 'start' : 'end'}
                                                dominantBaseline="central"
                                                fontSize={13}
                                                fontWeight="500"
                                                fontFamily="sans-serif"
                                            >
                                                {`${name} ${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                    outerRadius={85}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {datosEstado.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfica de reservas por tipo */}
                    <div id="chart-tipo" className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas por Tipo de Espacio</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={datosTipo}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Espacios más usados */}
                <div id="chart-espacios" className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Espacios Más Usados</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={estadisticas.espaciosMasUsados} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="nombre" type="category" width={200} />
                            <Tooltip />
                            <Bar dataKey="cantidad" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tendencias mensuales */}
                {estadisticas.tendenciasMensuales.length > 0 && (
                    <div id="chart-tendencias" className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias Mensuales</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={estadisticas.tendenciasMensuales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="cantidad" stroke="#8B5CF6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
            </div>
        </DashboardLayout>
    );
};

export default ReportesUso;
