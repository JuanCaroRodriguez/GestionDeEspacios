import { useFormValidate } from "use-form-validate";
import Logo from "../assets/LogoIsoft.png";
import useSession from "../context/Auth/useSession";
import { useState } from "react";
import { ROUTES } from "../tools/CONSTANTS";
import LoginModals from "../components/LoginModals";
import { useNavigate } from "react-router-dom"
import { FiSearch, FiLock, FiCalendar } from "react-icons/fi";

const Login = () => {
    const [responseError, setResponseError] = useState('')
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showFailureModal, setShowFailureModal] = useState(false)
    const [showInactiveModal, setShowInactiveModal] = useState(false)
    const [showInvalidCredentialsModal, setShowInvalidCredentialsModal] = useState(false)
    const {
        handleSubmit,
        getFieldProps,
        getFieldError,
        resetForm,
        errors,
    } = useFormValidate();

    const navigate = useNavigate()
    const { handleLogin, loading_auth } = useSession()

    const closeAllModals = () => {
        setShowSuccessModal(false)
        setShowFailureModal(false)
        setShowInactiveModal(false)
        setShowInvalidCredentialsModal(false)
        setResponseError('')
    }

    const handleContinue = () => {
         navigate(ROUTES.dashboard.home)
    }
    
    const onSubmit = (formData) => {
        handleLogin(formData)
            .then((response) => {

                if(response.estado === 'sin errores') {   
                    console.log(response.user)                 
                    setShowSuccessModal(true)
                    return
                }
                // Verificar si el usuario está inactivo antes de permitir el login
                if(response.estado === 'inactivo') {                    
                    // Usuario inactivo - mostrar modal correspondiente y no permitir login
                    setShowInactiveModal(true)
                    return
                }
                if(response.estado === 'Credenciales no validas') {                    
                    // Usuario inactivo - mostrar modal correspondiente y no permitir login
                    setShowInvalidCredentialsModal(true)
                    return
                }
                if(response.estado === 'Error') {                    
                    // Usuario inactivo - mostrar modal correspondiente y no permitir login
                    setShowFailureModal(true)
                    return
                }
                
                setShowFailureModal(true)
                return

                
                    
            })
            .catch((error) => {
                
                // Manejar diferentes tipos de errores
                if (error.response) {
                    
                    if (error.response.data && error.response.data.message) {
                        const errorMessage = error.response.data.message.toLowerCase()
                        
                        // Analizar el tipo de error y mostrar el modal correspondiente
                        if (errorMessage.includes('inactivo') || errorMessage.includes('deshabilitado') || errorMessage.includes('bloqueado') || error.response.status === 403) {
                            setShowInactiveModal(true)
                        } else if (errorMessage.includes('credenciales') || errorMessage.includes('contraseña') || errorMessage.includes('email') || errorMessage.includes('inválidas') || error.response.status === 401) {
                            setShowInvalidCredentialsModal(true)
                        } else {
                            setShowFailureModal(true)
                        }
                        
                        setResponseError(error.response.data.message)
                    } else {
                        console.error(error)
                        setShowFailureModal(true)
                    }
                } else if (error.request) {
                    // Error de red - no hay respuesta del servidor
                    setShowFailureModal(true)
                    setResponseError('Error de conexión. Por favor, verifica tu conexión a internet.')
                } else {
                    // Error del sistema o configuración
                    console.error(error)
                    setShowFailureModal(true)
                    setResponseError('Error inesperado del sistema.')
                }
            })
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
            <style>{`
                @keyframes float1 {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(25px) scale(0.95); }
                }
                @keyframes float3 {
                    0%, 100% { transform: translateX(0px) translateY(0px); }
                    33% { transform: translateX(15px) translateY(-20px); }
                    66% { transform: translateX(-10px) translateY(10px); }
                }
                @keyframes shimmer {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.7; }
                    100% { opacity: 0.3; }
                }
            `}</style>

            {/* Panel izquierdo - branded */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem',
                position: 'relative',
                overflow: 'hidden',
                minWidth: 0
            }}
            className="hidden md:flex"
            >
                {/* Círculos decorativos animados */}
                <div style={{
                    position: 'absolute', top: '-80px', left: '-80px',
                    width: '320px', height: '320px', borderRadius: '50%',
                    background: 'rgba(96, 165, 250, 0.15)',
                    animation: 'float1 7s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', right: '-60px',
                    width: '280px', height: '280px', borderRadius: '50%',
                    background: 'rgba(147, 197, 253, 0.12)',
                    animation: 'float2 9s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute', top: '40%', right: '-40px',
                    width: '180px', height: '180px', borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.2)',
                    animation: 'float3 11s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute', bottom: '20%', left: '5%',
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'rgba(191, 219, 254, 0.1)',
                    animation: 'float1 6s ease-in-out infinite 2s'
                }} />
                <div style={{
                    position: 'absolute', top: '15%', right: '15%',
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.07)',
                    animation: 'shimmer 4s ease-in-out infinite'
                }} />

                {/* Contenido del panel */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={Logo} alt="ClassMatch Logo" style={{ width: '90px', height: '90px', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.3))' }} />
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                        Class<span style={{ color: '#93c5fd' }}>Match</span>
                    </h1>
                    <p style={{ marginTop: '0.75rem', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '280px', lineHeight: '1.6' }}>
                        Gestión de espacios universitarios
                    </p>

                    <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                        {[
                            { icon: <FiSearch className="w-5 h-5" />, text: 'Consulta disponibilidad en tiempo real' },
                            { icon: <FiCalendar className="w-5 h-5" />, text: 'Reserva espacios en segundos' },
                            { icon: <FiLock className="w-5 h-5" />, text: 'Acceso seguro por roles' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.08)', borderRadius: '0.625rem', padding: '0.75rem 1rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel derecho - formulario */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                padding: '2rem'
            }}
            className="flex-1 md:flex-none md:w-[420px]"
            >
                <div style={{ width: '100%', maxWidth: '380px' }}>
                    {/* Logo solo visible en móvil */}
                    <div className="flex justify-center mb-6 md:hidden">
                        <img src={Logo} alt="ClassMatch Logo" style={{ width: '64px', height: '64px' }} />
                    </div>

                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                        Bienvenido
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '2rem' }}>
                        Ingresa tus credenciales para continuar
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                                Tipo de usuario
                            </label>
                            <select
                                {...getFieldProps("tipo", { required: true }, undefined, 'usuario')}
                                style={{
                                    width: '100%', padding: '0.625rem 0.75rem',
                                    border: '1.5px solid #e2e8f0', borderRadius: '0.5rem',
                                    fontSize: '0.9rem', color: '#1e293b', backgroundColor: 'white',
                                    outline: 'none', boxSizing: 'border-box'
                                }}
                            >
                                <option value="usuario">Usuario (Estudiante o Docente)</option>
                                <option value="administrador">Administrador</option>
                                <option value="superadmin">Super Administrador</option>
                            </select>
                            {getFieldError("tipo") && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{getFieldError("tipo")}</p>}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                placeholder="ejemplo@correo.com"
                                {...getFieldProps("email", { required: true, email: true })}
                                style={{
                                    width: '100%', padding: '0.625rem 0.75rem',
                                    border: `1.5px solid ${errors['email'] ? '#ef4444' : '#e2e8f0'}`,
                                    borderRadius: '0.5rem', fontSize: '0.9rem', color: '#1e293b',
                                    outline: 'none', boxSizing: 'border-box'
                                }}
                            />
                            {getFieldError("email") && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{getFieldError("email")}</p>}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                                Contraseña
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...getFieldProps("contraseña", { required: true })}
                                style={{
                                    width: '100%', padding: '0.625rem 0.75rem',
                                    border: `1.5px solid ${errors['contraseña'] ? '#ef4444' : '#e2e8f0'}`,
                                    borderRadius: '0.5rem', fontSize: '0.9rem', color: '#1e293b',
                                    outline: 'none', boxSizing: 'border-box'
                                }}
                            />
                            {getFieldError("contraseña") && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{getFieldError("contraseña")}</p>}
                        </div>

                        {responseError && (
                            <p style={{ fontSize: '0.8rem', color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{responseError}</p>
                        )}

                        {loading_auth ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', color: '#3b82f6' }}>
                                <div style={{ width: '18px', height: '18px', border: '2px solid #bfdbfe', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                <span style={{ fontSize: '0.875rem' }}>Verificando...</span>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                                    color: 'white', border: 'none', borderRadius: '0.5rem',
                                    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
                                    transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                Iniciar sesión
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Modals de Login */}
            <LoginModals
                showSuccessModal={showSuccessModal}
                showFailureModal={showFailureModal}
                showInactiveModal={showInactiveModal}
                showInvalidCredentialsModal={showInvalidCredentialsModal}
                closeAllModals={closeAllModals}
                onContinue={handleContinue}
            />
        </div>
    );
};

export default Login;
