import { useFormValidate } from "use-form-validate";
import Logo from "../assets/LogoIsoft.png";
import useSession from "../context/Auth/useSession";
import { useState } from "react";
import { ROUTES } from "../tools/CONSTANTS";

const Login = () => {
    const [responseError, setResponseError] = useState('')
    const {
        handleSubmit,
        getFieldProps,
        getFieldError,
        resetForm,
        errors,
    } = useFormValidate();

    const { handleLogin, loading_auth } = useSession()

    const onSubmit = (formData) => {
        console.log('Frontend - Submitting form data:', formData); // Debug frontend
        handleLogin(formData)
            .then((response) => {
                console.log('Frontend - Login response:', response); // Debug response
                if(response){
                    resetForm()
                }
            })
            .catch((error) => {
                console.log('Frontend - Login error:', error); // Debug error
                if (error.response) {
                    console.log('Frontend - Error response data:', error.response.data); // Debug error response
                    if (error.response.data.message) {
                        setResponseError(error.response.data.message)
                    }else{
                        console.error(error)
                    }
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
        </div>
    );
};

export default Login;
