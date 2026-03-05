import { useState } from "react";

import SweetAlert2 from "react-sweetalert2";

import useSession from "../context/Auth/useSession";    

const Perfil = () => {

    const { session, handleUpdate } = useSession()
    const {user} = session;

    const [swalProps, setSwalProps] = useState({});
    const [alertKey, setAlertKey] = useState(0); // Key para forzar el re-render

    const nameF = session?.user?.name?.split(' ')[0];
    const nameS = session?.user?.name?.split(' ')[1];

    const letters = (nameF?.charAt(0) + (nameS ? nameS.charAt(0) : '')).toUpperCase();


    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState(user.role);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");

    const handleNameChange = (e) => setName(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
    const handleCurrentPasswordChange = (e) => setCurrentPassword(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setSwalProps({
                show: true,
                title: "Error",
                text: "Las contraseñas no coinciden",
                icon: "error",
                onResolve: () => {
                    setSwalProps({
                        show: false,
                    });
                },
            });

            return;
        }
        if (currentPassword === "") {
            setSwalProps({
                show: true,
                title: "Error",
                text: "Debes ingresar tu contraseña actual",
                icon: "warning",
                onResolve: () => {
                    setSwalProps({
                        show: false,
                    });
                },
            });

            return;
        }

        handleUpdate({
            id: user.id,
            name,
            email,
            role,
            password,
            currentPassword
        });

        setSwalProps({
            show: true,
            title: "Perfil actualizado",
            text: "Tu perfil ha sido actualizado correctamente",
            icon: "success",
            onResolve: () => {
                setSwalProps({
                    show: false,
                });
            },
        });

        setCurrentPassword("");
    };

    return (
        <>
            <main className="flex-1 p-10 bg-slate-50">
                <h2 className="text-3xl font-medium px-8 mb-10">Configuración de perfil</h2>
                <div className="flex gap-20">
                    <div className="p-8">
                        <div className="flex flex-col justify-center items-center">
                            <div className="flex items-center justify-center size-40 bg-violet-600 rounded-full text-white">
                                <p className="text-white text-6xl font-semibold">
                                    {letters}
                                </p>
                            </div>
                            <div className="text-center mt-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {user.name}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                    <form className="flex-1 space-y-5" onSubmit={handleSubmit}>
                        
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={name}
                                    onChange={handleNameChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor="confirm-password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Confirmar contraseña
                                </label>
                                <input
                                    type="password"
                                    name="confirm-password"
                                    id="confirm-password"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">Escribe tu contraseña para confirmar</p>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label
                                    htmlFor="current-password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Contraseña actual
                                </label>
                                <input
                                    type="password"
                                    name="current-password"
                                    id="current-password"
                                    value={currentPassword}
                                    onChange={handleCurrentPasswordChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                            <div className="flex-1"></div>
                        </div>
                        
                        <div>
                            <button
                                type="submit"
                                className="w-52 mt-4 bg-blue-500 text-white p-2 rounded-md shadow-sm hover:bg-blue-600"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <SweetAlert2 key={alertKey} {...swalProps} />
        </>
    );
};

export default Perfil;
