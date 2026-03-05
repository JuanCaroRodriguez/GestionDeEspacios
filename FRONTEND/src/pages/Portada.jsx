import React from 'react';
import '../App.css';
import Logo from '../assets/LogoIsoft.png';
import { Link } from 'react-router-dom';
import { ROUTES } from '../tools/CONSTANTS';

const Portada = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <header className="w-full bg-blue-200 text-slate-800 py-4 flex justify-between items-center px-6">
                <div className="flex items-center">
                    <img src={Logo} alt="Logo" className="h-10 mr-3" />
                    <h1 className="text-2xl font-bold">ClassMatch</h1>
                </div>
                <div>
                    <Link to={ROUTES.auth.login} className="px-4 py-2 bg-green-500 text-white rounded-lg mr-4">Iniciar sesión</Link>
                    <Link to={ROUTES.auth.register} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Registrarse</Link>
                </div>
            </header>
            <main className="flex flex-1 flex-col justify-center items-center text-center px-4">
                <h2 className="text-4xl font-semibold mb-4 text-slate-900">Bienvenido a ClassMatch</h2>
                <p className="text-lg max-w-screen-lg mt-4">El sistema que optimiza la organización de espacios académicos. Accede de forma sencilla a horarios y gestiona tus solicitudes con rapidez y precisión.</p>
            </main>
        </div>
    );
};

export default Portada;