import React, { useEffect } from 'react';

const LoginModals = ({ 
  showSuccessModal, 
  showFailureModal, 
  showInactiveModal, 
  showInvalidCredentialsModal,
  closeAllModals,
  onContinue
}) => {
  // Modal de éxito se cierra manualmente con el botón "Continuar"
  return (
    <>
      {/* Modal de Éxito - Inicio de Sesión Exitoso */}
      {showSuccessModal && (
        <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              ¡Inicio de Sesión Exitoso!
            </h3>
            
            <p className="text-gray-600 mb-6 text-center">
              Bienvenido al sistema. Has iniciado sesión correctamente.
            </p>
            
            <button
              onClick={() => {
                closeAllModals()
                onContinue()
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continuar
            </button>
          </div>
        </div>
          </>
        )}

      {/* Modal de Falla - Error del Aplicativo */}
      {showFailureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Inicio de Sesión Fallido
            </h3>
            
            <p className="text-gray-600 mb-6 text-center">
              Ha ocurrido un error en el sistema. Por favor, intente nuevamente más tarde.
            </p>
            
            <button
              onClick={closeAllModals}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Usuario Inactivo */}
      {showInactiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Usuario No Activo
            </h3>
            
            <p className="text-gray-600 mb-6 text-center">
              Tu cuenta de usuario se encuentra inactiva. Por favor, contacta al administrador del sistema para activar tu cuenta.
            </p>
            
            <button
              onClick={closeAllModals}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Credenciales Inválidas */}
      {showInvalidCredentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Credenciales Inválidas
            </h3>
            
            <p className="text-gray-600 mb-6 text-center">
              El email o la contraseña que ingresaste son incorrectos. Por favor, verifica tus datos e intenta nuevamente.
            </p>
            
            <button
              onClick={closeAllModals}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginModals;
