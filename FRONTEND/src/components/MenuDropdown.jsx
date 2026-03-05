import React, { useEffect, useRef, useState } from "react";
import useSession from "../context/Auth/useSession";
import { ROUTES } from "../tools/CONSTANTS";
import { Link } from "react-router-dom";

const MenuDropdown = () => {

    const { session, handleLogOut } = useSession()

    const nameF = session?.user?.name?.split(' ')[0];
    const capitalizedFirstName = nameF?.charAt(0).toUpperCase() + nameF?.slice(1).toLowerCase();

    const nameS = session?.user?.name?.split(' ')[1]
    const letters = (nameF?.charAt(0) + (nameS ? nameS.charAt(0) : '')).toUpperCase()


    const [dropdownOpen, setDropdownOpen] = useState(false);

    const trigger = useRef(null);
    const dropdown = useRef(null);

    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }) => {
            if (!dropdown.current) return;
            if (
                !dropdownOpen ||
                dropdown.current.contains(target) ||
                trigger.current.contains(target)
            )
                return;
            setDropdownOpen(false);
        };
        document.addEventListener("click", clickHandler);
        return () => document.removeEventListener("click", clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }) => {
            if (!dropdownOpen || keyCode !== 27) return;
            setDropdownOpen(false);
        };
        document.addEventListener("keydown", keyHandler);
        return () => document.removeEventListener("keydown", keyHandler);
    });

    return (
        <section className="bg-gray-2">
            <div className="container">
                <div className="flex justify-center">
                    <div className="relative inline-block">
                        <button
                            ref={trigger}
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-stroke mr-4 bg-white px-4 text-base font-medium"
                        >
                            Cuenta
                            <span
                                className={`duration-100 ${
                                    dropdownOpen ? "-scale-y-100" : ""
                                }`}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M10 14.25C9.8125 14.25 9.65625 14.1875 9.5 14.0625L2.3125 7C2.03125 6.71875 2.03125 6.28125 2.3125 6C2.59375 5.71875 3.03125 5.71875 3.3125 6L10 12.5312L16.6875 5.9375C16.9688 5.65625 17.4062 5.65625 17.6875 5.9375C17.9688 6.21875 17.9688 6.65625 17.6875 6.9375L10.5 14C10.3437 14.1562 10.1875 14.25 10 14.25Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </span>
                        </button>
                        <div
                            ref={dropdown}
                            onFocus={() => setDropdownOpen(true)}
                            onBlur={() => setDropdownOpen(false)}
                            className={`absolute right-0 top-full w-[240px] mr-4 z-50 mt-1 divide-y divide-stroke overflow-hidden border rounded-lg bg-white ${
                                dropdownOpen ? "block" : "hidden"
                            }`}
                        >
                            <div className="flex items-center gap-3 px-4 py-3">
                                <div className='flex items-center justify-center size-9 bg-violet-600 rounded-3xl text-white'>
                                    <p className='text-white font-semibold'>{ letters }</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        { capitalizedFirstName }
                                    </p>
                                    <p className="text-sm text-body-color">
                                        { session?.user?.email }
                                    </p>
                                </div>
                            </div>
                           
                            <div>
                                <Link
                                    to={ROUTES.dashboard.profile}
                                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-gray-100"
                                >
                                    Perfil
                                </Link>
                                <button onClick={handleLogOut} className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-gray-100">
                                    Cerrar Sesión
                                </button>
                            </div>
    
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MenuDropdown;