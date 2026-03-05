import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import Table from "../components/table/Table";
import { ROUTES } from "../tools/CONSTANTS";

import Info from "../components/Info";
import useSession from "../context/Auth/useSession";
import ReservationContext from "../context/Reservation/ReservationContext";
import SweetAlert2 from "react-sweetalert2";

import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

const ReservaU = () => {
    const { session } = useSession();
    const { reservations, updateReservation } = useContext(ReservationContext);

    const [swalProps, setSwalProps] = useState({});
    const [alertKey, setAlertKey] = useState(0); // Key para forzar el re-render


    const headerAdmin = [
        { key: "userName", label: "Usuario", type: "text" },
        { key: "spaceId", label: "Espacio", type: "text" },
        { key: "reservationDate", label: "Fecha", type: "date" },
        { key: "startTime", label: "Hora inicio", type: "text" },
        { key: "endTime", label: "Hora salida", type: "text" },
        { key: "reservationReason", label: "Motivo", type: "text" },
        {
            key: "status",
            label: "Estado",
            type: "chip",
            chipCondition: "pendiente",
        },
    ];

    const headerUser = [
        { key: "spaceId", label: "Espacio", type: "text" },
        { key: "reservationDate", label: "Fecha", type: "date" },
        { key: "startTime", label: "Hora inicio", type: "text" },
        { key: "endTime", label: "Hora salida", type: "text" },
        { key: "reservationReason", label: "Motivo", type: "text" },
        {
            key: "status",
            label: "Estado",
            type: "chip",
            chipCondition: "pendiente",
        },
    ];
    const handleDelete = (item) => {
        console.log(item, "handleDelete");
        if (item && item.status === "pendiente") {
            setSwalProps({
                show: true,
                title: "¿Estás seguro?",
                text: "Esto cancelará la reservación. Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, cancelar",
                cancelButtonText: "No, mantener",
                onConfirm: () => {
                    item.status = "Cancelada";
                    // console.log(item, "antes de actualizar");
                    updateReservation(item);

                    // setSwalProps({
                    //     show: true,
                    //     title: "¡Cancelada!",
                    //     text: "La reservación ha sido cancelada.",
                    //     icon: "success",
                    //     showCancelButton: false,
                    //     confirmButtonText: "Aceptar",
                    // });
                },
                onResolve: () => {
                    setSwalProps({
                        show: false,
                    });
                },
            });
            setAlertKey(alertKey + 1); // Forzar re-render
        } else {
            setSwalProps({
                show: true,
                title: "Info",
                text: "La reservación ya esta cancelada.",
                icon: "info",
                showCancelButton: false,
                confirmButtonText: "Aceptar",
            });
            setAlertKey(alertKey + 1); // Forzar re-render
        }
    };

    return (
        <>
            <main className="flex-1 p-10 bg-slate-50 overflow-auto">
                <div className="flex gap-1 mb-4">
                    <h1 className="text-2xl font-bold">
                        {session?.user.role === "administrativo"
                            ? "Listado de reservas"
                            : "Mis reservas"}
                    </h1>
                    <Info>
                        <div className="p-3 w-72 bg-white">
                            <p className="text-sm text-gray">
                                Aquí se presenta el listado de reservas
                            </p>
                        </div>
                    </Info>
                </div>

                <div className="overflow-x-auto mx-auto pt-4">
                    {session?.user.role === "administrativo" ? (
                        <>
                            <Tabs>
                                <TabList>
                                    <Tab>Ordinarias</Tab>
                                    <Tab>Recurrentes</Tab>
                                </TabList>

                                <TabPanel>
                                    <Table
                                        config={{
                                            title: "Reservas",
                                            subTitle: "",
                                            otherOptions: () => {
                                                return (
                                                    <>
                                                        <Link
                                                            to={
                                                                ROUTES.dashboard
                                                                    .rooms
                                                            }
                                                            className="flex select-none items-center gap-2 rounded bg-blue-500 hover:bg-blue-700 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:shadow-lg hover:shadow-slate-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                            type="button"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="20"
                                                                height="20"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                                className="icon icon-tabler icons-tabler-filled icon-tabler-calendar"
                                                            >
                                                                <path
                                                                    stroke="none"
                                                                    d="M0 0h24v24H0z"
                                                                    fill="none"
                                                                />
                                                                <path d="M16 2a1 1 0 0 1 .993 .883l.007 .117v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 1.993 -.117l.007 .117v1h6v-1a1 1 0 0 1 1 -1zm3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16v-9.625z" />
                                                                <path d="M12 12a1 1 0 0 1 .993 .883l.007 .117v3a1 1 0 0 1 -1.993 .117l-.007 -.117v-2a1 1 0 0 1 -.117 -1.993l.117 -.007h1z" />
                                                            </svg>
                                                            Nueva Reserva
                                                        </Link>
                                                    </>
                                                );
                                            },
                                            data: reservations.filter( (res) => res.reservationType === "normal"),
                                            headers: headerAdmin,
                                            actions: [
                                                {
                                                    icon: (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="24"
                                                            height="24"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                                                        >
                                                            <path
                                                                stroke="none"
                                                                d="M0 0h24v24H0z"
                                                                fill="none"
                                                            />
                                                            <path d="M4 7l16 0" />
                                                            <path d="M10 11l0 6" />
                                                            <path d="M14 11l0 6" />
                                                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                                        </svg>
                                                    ),
                                                    onClick: (item) => {
                                                        handleDelete(item);
                                                    },
                                                },
                                            ],
                                            actionsConfig: {
                                                label: "Acciones",
                                            },
                                        }}
                                    />
                                </TabPanel>
                                <TabPanel>
                                    <Table
                                        config={{
                                            title: "Reservas",
                                            subTitle: "",
                                            otherOptions: () => {
                                                return (
                                                    <>
                                                        <Link
                                                            to={
                                                                ROUTES.dashboard
                                                                    .rooms
                                                            }
                                                            className="flex select-none items-center gap-2 rounded bg-blue-500 hover:bg-blue-700 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:shadow-lg hover:shadow-slate-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                            type="button"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="20"
                                                                height="20"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                                className="icon icon-tabler icons-tabler-filled icon-tabler-calendar"
                                                            >
                                                                <path
                                                                    stroke="none"
                                                                    d="M0 0h24v24H0z"
                                                                    fill="none"
                                                                />
                                                                <path d="M16 2a1 1 0 0 1 .993 .883l.007 .117v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 1.993 -.117l.007 .117v1h6v-1a1 1 0 0 1 1 -1zm3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16v-9.625z" />
                                                                <path d="M12 12a1 1 0 0 1 .993 .883l.007 .117v3a1 1 0 0 1 -1.993 .117l-.007 -.117v-2a1 1 0 0 1 -.117 -1.993l.117 -.007h1z" />
                                                            </svg>
                                                            Nueva Reserva
                                                        </Link>
                                                    </>
                                                );
                                            },
                                            data: reservations.filter((res) => res.reservationType === "recurrente"),
                                            headers: headerAdmin,
                                            actions: [
                                                {
                                                    icon: (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="24"
                                                            height="24"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                                                        >
                                                            <path
                                                                stroke="none"
                                                                d="M0 0h24v24H0z"
                                                                fill="none"
                                                            />
                                                            <path d="M4 7l16 0" />
                                                            <path d="M10 11l0 6" />
                                                            <path d="M14 11l0 6" />
                                                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                                        </svg>
                                                    ),
                                                    onClick: (item) => {
                                                        handleDelete(item);
                                                    },
                                                },
                                            ],
                                            actionsConfig: {
                                                label: "Acciones",
                                            },
                                        }}
                                    />
                                </TabPanel>
                            </Tabs>
                        </>
                    ) : (
                        <Table
                            config={{
                                title: "Reservas",
                                subTitle: "",
                                otherOptions: () => {
                                    return (
                                        <>
                                            <Link
                                                to={ROUTES.dashboard.rooms}
                                                className="flex select-none items-center gap-2 rounded bg-blue-500 hover:bg-blue-700 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:shadow-lg hover:shadow-slate-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                                type="button"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="icon icon-tabler icons-tabler-filled icon-tabler-calendar"
                                                >
                                                    <path
                                                        stroke="none"
                                                        d="M0 0h24v24H0z"
                                                        fill="none"
                                                    />
                                                    <path d="M16 2a1 1 0 0 1 .993 .883l.007 .117v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 1.993 -.117l.007 .117v1h6v-1a1 1 0 0 1 1 -1zm3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16v-9.625z" />
                                                    <path d="M12 12a1 1 0 0 1 .993 .883l.007 .117v3a1 1 0 0 1 -1.993 .117l-.007 -.117v-2a1 1 0 0 1 -.117 -1.993l.117 -.007h1z" />
                                                </svg>
                                                Nueva Reserva
                                            </Link>
                                        </>
                                    );
                                },
                                data: reservations,
                                headers: headerUser,
                                actions: [
                                    {
                                        icon: (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                                            >
                                                <path
                                                    stroke="none"
                                                    d="M0 0h24v24H0z"
                                                    fill="none"
                                                />
                                                <path d="M4 7l16 0" />
                                                <path d="M10 11l0 6" />
                                                <path d="M14 11l0 6" />
                                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                            </svg>
                                        ),
                                        onClick: (item) => {
                                            handleDelete(item);
                                        },
                                    },
                                ],
                                actionsConfig: {
                                    label: "Acciones",
                                },
                            }}
                        />
                    )}
                </div>
            </main>
            <SweetAlert2 key={alertKey} {...swalProps} />
        </>
    );
};

export default ReservaU;
