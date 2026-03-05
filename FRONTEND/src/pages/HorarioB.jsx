import { useState } from "react";
import "../App.css";
import Info from "../components/Info";

import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../tools/CONSTANTS";

import SweetAlert2 from "react-sweetalert2";

const HorarioB = () => {

    const navigate = useNavigate();

    const [swalProps, setSwalProps] = useState({});

    const [bloque, setBloque] = useState("");
    const salonesPorBloque = {
        bloqueA: generateSalones("A"),
        bloqueB: generateSalones("B"),
        bloqueC: generateSalones("C"),
        laboratorios: generateLaboratorios(),
    };

    function generateSalones(letter) {
        const salones = [];
        for (let row = 0; row < 3; row++) {
            const rowSalones = [];
            rowSalones.push(`Piso ${row + 1}`);
            for (let col = 0; col < 5; col++) {
                rowSalones.push(`${letter}${row + 1}0${col + 1}`);
            }
            salones.push(rowSalones);
        }
        return salones;
    }

    function generateLaboratorios() {
        return [["Lab 1", "Lab 2", "Lab 3", "Lab 4", "Lab 5"]];
    }

    const handleChange = (event) => {
        setBloque(event.target.value);
    };

    const handleClick = (codigo) => {

        navigate(`/week-room/${codigo}`);
    };

    return (
        <>
            <main className="flex-1 p-10 bg-slate-50">
                <div className="flex justify-between h-12 items-center">
                    <div className="flex">
                        <h1 className="text-2xl font-semibold mr-1">Selecciona un Salón o laboratorio</h1>

                        <Info>
                            <div className="p-3 w-72 bg-white">
                                <p className="text-sm text-gray">
                                    Aquí se presentan los salones por su respectivo bloque
                                </p>
                            </div>
                        </Info>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className={"px-4 py-2 rounded h-10 text-white bg-slate-800 flex gap-2 items-center text-sm font-medium"}
                    >
                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none" stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-back"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 11l-4 4l4 4m-4 -4h11a4 4 0 0 0 0 -8h-1" /></svg>
                        Regresar
                    </button>
                </div>

                <label
                    htmlFor="bloque"
                    className="block text-base font-medium text-gray-700 mb-2 mt-3  "
                >
                    Escoge un bloque:
                </label>
                <select
                    id="bloque"
                    value={bloque}
                    onChange={handleChange}
                    className="block w-1/4 p-2 border border-blue-400 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
                >
                    <option value="">---</option>
                    <option value="bloqueA">Bloque A</option>
                    <option value="bloqueB">Bloque B</option>
                    <option value="bloqueC">Bloque C</option>
                    <option value="laboratorios">Laboratorios</option>
                </select>

                {bloque ? (
                    <table className="min-w-full bg-white border border-slate-300">
                        <thead>
                            <tr className="bg-slate-100">
                                {bloque === "laboratorios" ? (
                                    salonesPorBloque[bloque][0].map(
                                        (lab, index) => (
                                            <th
                                                key={index}
                                                className="py-2 px-4 border-b text-center"
                                            >
                                                {lab}
                                            </th>
                                        )
                                    )
                                ) : (
                                    <>
                                        <th className="py-2 px-4 border-b text-center bg-slate-100">
                                            Piso
                                        </th>
                                        {[...Array(5)].map((_, index) => (
                                            <th
                                                key={index}
                                                className="py-2 px-4 border-b text-center"
                                            >
                                                Salón {index + 1}
                                            </th>
                                        ))}
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {salonesPorBloque[bloque].map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="hover:bg-gray-100"
                                >
                                    {row.map((salon, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`py-2 px-4 border-b text-center ${
                                                colIndex === 0 &&
                                                bloque !== "laboratorios"
                                                    ? "bg-blue-200 text-blue-700 font-semibold"
                                                    : ""
                                            }`}
                                        >
                                            {colIndex === 0 &&
                                            bloque !== "laboratorios" ? (
                                                salon // Renderizar el piso sin botón y en color diferenciado
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleClick(salon)
                                                    }
                                                    className="w-full h-full bg-transparent transition-all text-gray-600 py-1 px-2 rounded hover:bg-blue-600 hover:text-white"
                                                >
                                                    {salon}
                                                </button>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <></>
                )}
            </main>
            <SweetAlert2 {...swalProps} />
        </>
    );
};

export default HorarioB;
