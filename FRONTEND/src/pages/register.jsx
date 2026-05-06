import { useState } from 'react';
import { useFormValidate } from 'use-form-validate';
import Logo from '../assets/LogoIsoft.png';
import useSession from '../context/Auth/useSession';
import { ROUTES, ROL } from '../tools/CONSTANTS';
import { API_PROTOTYPES } from '../api/services';

import SweetAlert2 from 'react-sweetalert2';

function Register() {
  const [responseError, setResponseError] = useState('')
  const {
    handleSubmit,
    getFieldProps,
    getFieldError,
    resetForm,
    errors,
  } = useFormValidate();

  const { handleSignUp, loading_auth } = useSession()

  const [swalProps, setSwalProps] = useState({});
  const [alertKey, setAlertKey] = useState(0); // Key para forzar el re-render


  const onSubmit = (formData) => {
    console.log(formData)
    let registerPromise;
    
    // Seleccionar el método de registro según el rol
    switch(formData.role) {
      case 'administrador':
        registerPromise = API_PROTOTYPES.auth.registerAdmin({
          nombre: formData.name,
          email: formData.email,
          contraseña: formData.password
        });
        break;
      case 'estudiante':
        registerPromise = API_PROTOTYPES.auth.registerEstudiante({
          nombre: formData.name,
          email: formData.email,
          contraseña: formData.password
        });
        break;
      case 'docente':
        registerPromise = API_PROTOTYPES.auth.registerDocente({
          nombre: formData.name,
          email: formData.email,
          contraseña: formData.password
        });
        break;
      default:
        setResponseError('Por favor selecciona un rol válido');
        return;
    }

    registerPromise
      .then((response) => {
        resetForm()
        setSwalProps({
          show: true,
          title: "Registro exitoso",
          text: "Se ha registrado correctamente",
          icon: "success",
        });
        setAlertKey(alertKey + 1);
      })
      .catch((error) => {
        if (error.response?.data?.message) {
          setResponseError(error.response.data.message)
        } else {
          setResponseError('Error en el registro');
          console.error(error)
        }
      })
  };
  return (
<>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative max-w-md w-full p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="flex justify-center w-full">
            <img src={Logo} alt="Company Logo" className="size-20" />
          </div>

          <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">Registrate</h1>
          
          <select
            {...getFieldProps("role", { required: true }, undefined, '')}
            className={`w-full p-2 mb-1 mt-3 border ${errors['role'] ? 'border-red-500' : 'border-gray-300'}  rounded`}
          >
            <option value="">Selecciona un rol</option>
            <option value="administrador">Administrador</option>
            <option value="estudiante">Estudiante</option>
            <option value="docente">Docente</option>
          </select>

          <p className="text-red-500">{getFieldError("rol")}</p>
          <input
            type="text"
            placeholder="Nombre"
            {...getFieldProps("name", { required: true })}
            className={`w-full p-2 mt-3 border ${errors['name'] ? 'border-red-500' : 'border-gray-300'}  rounded`}
          />
          <p className="text-red-500">{getFieldError("name")}</p>
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
                Registrar
              </button>
          }
          <div>
            <p className="text-red-500">{responseError}</p>
          </div>
          <div>
            <p className="text-center mt-6 mb-4">¿Ya tienes cuenta? <a href={ROUTES.auth.login} className="text-blue-500">Inicia sesión</a></p>
          </div>
        </form >
      </div>
    </div >
    <SweetAlert2 key={alertKey} {...swalProps} />
    </>
  );
}

export default Register;