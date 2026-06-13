import { useFormValidate } from "use-form-validate";
import Logo from "../assets/LogoIsoft.png";
import useSession from "../context/Auth/useSession";
import { useState } from "react";
import { ROUTES } from "../tools/CONSTANTS";
import LoginModals from "../components/LoginModals";
import { useNavigate } from "react-router-dom"

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
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="relative max-w-md w-full p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
                <form onSubmit={handleSubmit(onSubmit)}>
                    
                    <div className="flex justify-center w-full">
                        <img src={Logo} alt="Company Logo" className="size-20" />
                    </div>

                    <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">Iniciar sesión</h1>
                    
                    <select
                        {...getFieldProps("tipo", { required: true }, undefined, 'usuario')}
                        className="w-full p-2 mb-1 mt-3 border border-gray-300 rounded"
                    >
                        <option value="usuario">
                            Usuario (Estudiante o Docente)
                        </option>
                        <option value="administrador">Administrador</option>
                        <option value="superadmin">Super Administrador</option>
                    </select>
                    <p className="text-red-500">{getFieldError("tipo")}</p>
                    <input
                        type="email"
                        placeholder="Correo electronico"
                        {...getFieldProps("email", { required: true, email: true })}
                        className={`w-full p-2 mb-1 mt-3 border ${errors['email'] ? 'border-red-500' : 'border-gray-300'}  rounded`}
                    />
                    <p className="text-red-500">{getFieldError("email")}</p>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        {...getFieldProps("contraseña", { required: true })}
                        className={`w-full p-2 mb-1 mt-3 border ${errors['contraseña'] ? 'border-red-500' : 'border-gray-300'}  rounded`}
                    />
                    <p className="text-red-500">{getFieldError("contraseña")}</p>

                    {
                        loading_auth ?
                            <p className="text-center">Loading...</p>
                            :
                            <button
                                type="submit"
                                className="w-full p-2 mb-1 mt-5 text-white bg-blue-500 rounded"
                            >
                                Iniciar sesión
                            </button>
                    }
                </form>
                <div>
                    <p className="text-center text-red-500">{responseError}</p>
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
