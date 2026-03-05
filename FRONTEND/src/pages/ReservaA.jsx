import { useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "../App.css";

const ReservaA = () => {
    const [reservas, setReservas] = useState([
        {
            dia: "Lunes",
            hora: "8:00",
            salon: "A101",
            estado: "solicitud",
            usuario: "Juan Pérez",
        },
        {
            dia: "Martes",
            hora: "9:00",
            salon: "B202",
            estado: "activa",
            usuario: "Ana Gómez",
        },
        {
            dia: "Miércoles",
            hora: "10:00",
            salon: "C303",
            estado: "rechazada",
            usuario: "Carlos Ruiz",
        },
        {
            dia: "Jueves",
            hora: "11:00",
            salon: "C104",
            estado: "activa",
            usuario: "María López",
        },
        {
            dia: "Viernes",
            hora: "12:00",
            salon: "B205",
            estado: "solicitud",
            usuario: "Luis Fernández",
        },
    ]);

    const renderReservas = (estado) => {
        return reservas
            .filter((reserva) => reserva.estado === estado)
            .map((reserva, index) => (
                <div
                    key={index}
                    className="reserva-item"
                    style={{
                        borderBottom: "1px solid #ccc",
                        padding: "10px 0",
                    }}
                >
                    <p>
                        <strong>Usuario:</strong> {reserva.usuario}
                    </p>
                    <p>
                        <strong>Día:</strong> {reserva.dia}
                    </p>
                    <p>
                        <strong>Hora:</strong> {reserva.hora}
                    </p>
                    <p>
                        <strong>Salón:</strong> {reserva.salon}
                    </p>
                </div>
            ));
    };

    return (
        <>
            <main className="flex-1 p-10 flex-col flex items-center">
                <h1 className="text-2xl font-bold mb-4">Lista de reservas</h1>
                <div
                    style={{
                        width: "50%",
                        maxWidth: "1200px",
                        height: "500px",
                        border: "2px solid blue",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#f9f9f9",
                    }}
                >
                    <Tabs>
                        <TabList
                            style={{
                                backgroundColor: "#e0e0e0",
                                padding: "10px",
                                borderRadius: "8px 8px 0 0",
                            }}
                        >
                            <Tab
                                style={{
                                    backgroundColor: "#6aa9e9",
                                    padding: "10px",
                                    borderRadius: "8px 8px 0 0",
                                }}
                            >
                                Solicitud
                            </Tab>
                            <Tab
                                style={{
                                    backgroundColor: "#98c3ed",
                                    padding: "10px",
                                    borderRadius: "8px 8px 0 0",
                                }}
                            >
                                Activas
                            </Tab>
                            <Tab
                                style={{
                                    backgroundColor: "#cfe2ff",
                                    padding: "10px",
                                    borderRadius: "8px 8px 0 0",
                                }}
                            >
                                Rechazadas
                            </Tab>
                        </TabList>

                        <TabPanel>
                            <div>{renderReservas("solicitud")}</div>
                        </TabPanel>
                        <TabPanel>
                            <div>{renderReservas("Activa")}</div>
                        </TabPanel>
                        <TabPanel>
                            <div>{renderReservas("Rechazada")}</div>
                        </TabPanel>
                    </Tabs>
                </div>
            </main>
        </>
    );
};

export default ReservaA;
