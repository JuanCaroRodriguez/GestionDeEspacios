# Sistema de Gestión de Espacios Universitarios

> Una plataforma web integral para la administración y reserva de espacios físicos en instituciones educativas

---

## [Descripción]

El Sistema de Gestión de Espacios Universitarios es una aplicación web moderna diseñada para optimizar la administración, reserva y control de espacios físicos en entornos universitarios. La plataforma facilita la gestión eficiente de aulas, laboratorios, salones y otros espacios educativos mediante un sistema centralizado basado en roles y permisos.

---

## [Características Principales]

### **Gestión de Espacios**

- **Administración completa** de espacios físicos por bloques y pisos
- **Clasificación por tipo**: Aulas, Laboratorios, Salones, Auditorios
- **Control de capacidad** y disponibilidad en tiempo real
- **Consultas de disponibilidad** por fecha y franjas horarias

### **Sistema de Reservas**

- **Reservas programadas** con confirmación automática
- **Gestión de estados**: Pendiente, Aprobada, Ejecutada, Cancelada
- **Historial completo** de reservas por usuario
- **Cancelación controlada** con validación de permisos

### **Administración por Roles**

- **Super Administrador**: Gestión global del sistema
- **Administradores**: Control de reservas y espacios por empresa
- **Docentes/Estudiantes**: Reserva y consulta de espacios
- **Permisos granulares** según el rol asignado

### **Panel de Control**

- **Dashboard personalizado** según el tipo de usuario
- **Estadísticas en tiempo real** de reservas y ocupación
- **Evaluación de solicitudes** con aprobación/rechazo
- **Reportes y métricas** de utilización con gráficas interactivas
- **Análisis de ocupación** por tipo de espacio y período
- **Tendencias mensuales** de uso de espacios físicos
- **Exportación de datos** a CSV para análisis externo

---

## [Arquitectura Tecnológica]

### **Frontend**

- **React.js** - Framework principal de UI
- **Tailwind CSS** - Sistema de diseño moderno
- **React Router** - Navegación SPA
- **Axios** - Comunicación con API
- **Sonner** - Sistema de notificaciones

### **Backend**

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **TypeScript** - Tipado estático

### **Infraestructura**

- **Arquitectura RESTful** - API estándar
- **Autenticación JWT** - Seguridad de sesiones
- **CORS configurado** - Comunicación segura
- **Manejo de errores** centralizado

---

## [Módulos del Sistema]

### **Gestión de Empresas**

- Creación y configuración de instituciones
- Asignación de espacios por empresa
- Control de usuarios administrativos

### **Gestión de Bloques**

- Organización jerárquica de espacios
- Configuración de pisos y distribución
- Nomenclatura estandarizada

### **Gestión de Espacios**

- Registro detallado de características
- Control de capacidad y equipamiento
- Estados de disponibilidad

### **Sistema de Reservas**

- Flujo completo de solicitud y aprobación
- Validación de disponibilidad
- Gestión de conflictos y superposiciones

### **Panel Administrativo**

- Evaluación de solicitudes pendientes
- Estadísticas de ocupación
- Reportes de utilización

### **Reportes de Uso**

- **Dashboard de análisis** con gráficas interactivas (barras, líneas, pastel)
- **Filtros avanzados** por fecha, tipo de espacio, estado y bloque
- **Estadísticas clave**: total de espacios, reservas, ocupación promedio
- **Análisis por estado**: distribución de reservas (Pendiente, Reservada, Ejecutada, Cancelada)
- **Análisis por tipo**: uso comparativo entre aulas, laboratorios, oficinas y otros espacios
- **Espacios más utilizados**: ranking de los 10 espacios con mayor demanda
- **Tendencias mensuales**: evolución del uso de espacios a lo largo del tiempo

#### **Sistema de Exportación PDF Mejorado**

- **Opciones de exportación** mediante menú desplegable con un solo botón "Exportar"
- **Reporte Visual**: PDF de una sola página en formato landscape con:
  - Gráficas interactivas (barras, líneas, pastel) capturadas como imágenes
  - Tarjetas de estadísticas con diseño moderno
  - Layout optimizado para presentación visual
- **Exportación de Datos**: PDF con tabla detallada de reservas incluyendo:
  - **Fecha de Reserva**: fecha programada de la reserva
  - **Hora Inicio y Fin**: franjas horarias completas
  - **Tipo Espacio**: clasificación del espacio reservado
  - **Bloque, Piso y Salón**: ubicación detallada
  - **Estado**: estado actual de la reserva
  - **Responsable**: nombre del solicitante
  - **Motivo**: descripción del propósito (con ancho maximizado para escritura)
- **Formato landscape** para mejor visualización de datos tabulares
- **Paginación automática** para manejar grandes volúmenes de datos
- **Diseño consistente** con colores y tipografía de la marca
- **Acceso restringido**: disponible solo para administradores y super administradores

---

## [Flujo de Trabajo]

### **Para Estudiantes/Docentes**

1. **Consulta de disponibilidad** de espacios
2. **Selección de fecha** y franja horaria
3. **Solicitud de reserva** con motivo
4. **Seguimiento del estado** de la solicitud
5. **Gestión de reservas** activas

### **Para Administradores**

1. **Evaluación de solicitudes** pendientes
2. **Aprobación o rechazo** de reservas
3. **Monitoreo de ocupación** de espacios
4. **Generación de reportes** de utilización con filtros y gráficas
5. **Análisis de tendencias** y espacios más demandados
6. **Configuración de espacios** y disponibilidad

### **Para Super Administradores**

1. **Gestión de empresas** y usuarios
2. **Configuración global** del sistema
3. **Supervisión general** de operaciones
4. **Generación de reportes globales** de uso del sistema
5. **Mantenimiento de la plataforma**

---

## [Seguridad y Control]

### **Autenticación**

- **Sistema de login** unificado por roles
- **Tokens JWT** para sesiones seguras
- **Control de acceso** basado en permisos
- **Sesiones persistentes** con timeout

### **Validaciones**

- **Disponibilidad real** de espacios
- **Prevención de conflictos** de horarios
- **Validación de permisos** por operación
- **Integridad de datos** en transacciones

---

## [Experiencia de Usuario]

### **Diseño Responsivo**

- **Adaptable a dispositivos** móviles y desktop
- **Interfaz intuitiva** con navegación clara
- **Feedback visual** inmediato
- **Accesibilidad** optimizada

### **Funcionalidades UX**

- **Búsqueda y filtrado** avanzado
- **Notificaciones en tiempo real**
- **Carga asíncrona** de datos
- **Manejo de errores** amigable

---

## [Instalación y Configuración]

### **Prerrequisitos**

- Node.js 16+
- MongoDB 4.4+
- NPM o Yarn

### **Configuración del Backend**

```bash
cd BACKEND
npm install
npm run dev
```

### **Configuración del Frontend**

```bash
cd FRONTEND
npm install
npm run dev
```

### **Variables de Entorno**

- Configuración de base de datos MongoDB
- URLs de conexión y puertos
- Claves de seguridad JWT

---

## [Casos de Uso]

### **Instituciones Educativas**

- Universidades y colegios
- Centros de formación técnica
- Institutos de investigación
- Bibliotecas y centros de estudio

### **Tipos de Espacios**

- Aulas y salones de clase
- Laboratorios informáticos
- Auditorios y salas de conferencia
- Espacios de estudio grupal
- Oficinas administrativas

---

## [Beneficios]

### **Para Instituciones**

- **Optimización del uso** de espacios físicos
- **Reducción de conflictos** de asignación
- **Control centralizado** de disponibilidad
- **Métricas de utilización** detalladas

### **Para Usuarios**

- **Acceso simplificado** a espacios
- **Transparencia** en disponibilidad
- **Gestión personal** de reservas
- **Notificaciones** de cambios

### **Para Administradores**

- **Control eficiente** de operaciones
- **Automatización** de procesos
- **Reportes** para toma de decisiones
- **Gestión escalable** de usuarios

---

## [Licencia]

Este proyecto está desarrollado como parte de proyectos académicos y está disponible para uso educativo y de investigación.

---

## [Soporte y Contribuciones]

Para reportar problemas, sugerir mejoras o contribuir al desarrollo del proyecto, por favor contactar al equipo de desarrollo a través de los canales institucionales.

---

## [Equipo de Desarrollo]

Este sistema fue planificado, diseñado y desarrollado por:

| Rol                            | Nombre               | GitHub                                                     |
| ------------------------------ | -------------------- | ---------------------------------------------------------- |
| Planificadora & Desarrolladora | Wendy Buelvas España | [@WendyBuelvas](https://github.com/WendyBuelvas)           |
| Planificador & Desarrollador   | Juan C. Caro         | [@JuanCaroRodriguez](https://github.com/JuanCaroRodriguez) |

---

_Versión 2.0.0 | Sistema de Gestión de Espacios Universitarios_

_Desarrollado por Wendy Buelvas España & Juan C. Caro — Proyecto de Grado_
