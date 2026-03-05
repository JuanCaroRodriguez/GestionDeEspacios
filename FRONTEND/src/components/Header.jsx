import React from "react";
import Logo from "../assets/LogoIsoft.png";
import { ROUTES } from "../tools/CONSTANTS";
import { Link } from "react-router-dom";

import useSession from "../context/Auth/useSession";
import MenuDropdown from "./MenuDropdown";
import Info from "./Info";

const Header = () => {
    const { session } = useSession();

    console.log(session);
    const nameF = session?.user?.name?.split(" ")[0];
    const capitalizedFirstName =
        nameF?.charAt(0).toUpperCase() + nameF?.slice(1).toLowerCase();

    const nameS = session?.user?.name?.split(" ")[1];
    const letters = (
        nameF?.charAt(0) + (nameS ? nameS.charAt(0) : "")
    ).toUpperCase();

    return (
        <header className="bg-white p-2 flex justify-between items-center h-20 border-b">
            <div className="flex items-center ml-1">
                <img src={Logo} alt="Logo" className="h-14" />
                <h2 className="text-black text-2xl font-medium ml-2">
                    Class<span className="text-blue-500">Match</span>
                </h2>
            </div>
            <div className="flex items-center gap-4">
                <Info
                    position="bottom-end"
                >
                    <div className="p-3 w-72 bg-white">
                        <h2 className="text-lg font-semibold">¿Necesitas ayuda?</h2>
                        <p className="text-sm text-slate-600 mb-1">Si tienes alguna duda o problema, no dudes en contactarnos.</p>
                        <a href="mailto:contacto@classmatch.com" className="text-blue-500 font-medium hover:underline">
                        contactar con soporte
                        </a>
                    </div>
                </Info>
                <MenuDropdown />
            </div>
            
            {/* <Link to={ROUTES.dashboard.profile} className="flex items-center gap-3 bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-200">
                <div className='flex items-center justify-center size-9 bg-violet-600 rounded-3xl text-white'>
                    <p className='text-white font-semibold'>{ letters }</p>
                </div>
                <p className='font-semibold'>{ capitalizedFirstName }</p>
            </Link> */}
        </header>
    );
};

export default Header;
