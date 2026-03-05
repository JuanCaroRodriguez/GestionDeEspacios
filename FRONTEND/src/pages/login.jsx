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
        handleLogin(formData)
            .then((response) => {
                if(response){
                    resetForm()
                }
            })
            .catch((error) => {
                console.log(error)
                if (error.response.data) {
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
                    {/* <select
                        {...getFieldProps("role", { required: true }, undefined, 'user')}
                        className="w-full p-2 mb-1 mt3 border border-gray-300 rounded"
                    >
                        <option value="user">
                            Usuario (Estudiante o Docente)
                        </option>
                        <option value="admin">Administrador</option>
                    </select> */}
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
                        {...getFieldProps("password", { required: true })}
                        className={`w-full p-2 mb-1 mt-3 border ${errors['password'] ? 'border-red-500' : 'border-gray-300'}  rounded`}
                    />
                    <p className="text-red-500">{getFieldError("password")}</p>

                    {
                        loading_auth ?
                            <p className="text-center">Loading...</p>
                            :
                            <button
                                className="w-full p-2 mb-1 mt-5 text-white bg-blue-500 rounded"
                            >
                                Iniciar sesión
                            </button>
                    }
                </form>
                <div>
                    <p className="text-center text-red-500">{responseError}</p>
                </div>

                <div>
                    <p className="text-center mt-6 mb-4">¿No tienes cuenta? <a href={ROUTES.auth.register} className="text-blue-500">Regístrate</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
