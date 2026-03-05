import { any, oneOf, string } from "../../tools/Types";

function Col({ data, type = "text", chipCondition }) {

    if (!data) return null;
    if (type === "col" && !data.title) return
    if (type === "col" && !data.subtitle) return
    if (type === "user" && !data.name) return

    return (
        <>
            {
                type === "col" && (
                    <td className="p-4 border-b border-slate-200">
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-slate-700">
                                {data.title}
                            </p>
                            <p className="text-sm text-slate-700">
                                {data.subtitle}
                            </p>
                        </div>
                    </td>
                )
            }
            {
                type === "text" && (
                    <td className="p-4 border-b border-slate-200">
                        <p className="text-sm text-slate-700">
                            {data.toString()}
                        </p>
                    </td>
                )
            }
            {
                type === "chip" && (
                    <td className="p-4 border-b border-slate-200">
                        <div className="w-max">
                            {
                                (chipCondition && 'Cancelada' === data.toString()) ?
                                    (
                                        <div className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-gray-900 uppercase rounded-md select-none whitespace-nowrap bg-red-200">
                                            <span className="">
                                                {data.toString()}
                                            </span>
                                        </div>
                                    )
                                    : ('pendiente' === data.toString() ? (
                                            <div className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20">
                                                <span className="">
                                                    {data.toString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-slate-100 uppercase rounded-md select-none whitespace-nowrap bg-slate-500">
                                                <span className="">
                                                    {data.toString()}
                                                </span>
                                            </div>
                                        )
                                    )
                            }
                        </div>
                    </td>
                )
            }
            {
                type === "date" && (
                    <td className="p-4 border-b border-slate-200">
                        <p className="text-sm text-slate-700">
                            {data.toString()}
                        </p>
                    </td>
                )
            }
            {
                type === "user" && (
                    <td className="p-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <img
                                src={data.img || "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-3.jpg"}
                                alt={data.name || "John Michael"}
                                className="relative inline-block h-9 w-9 !rounded-full object-cover object-center"
                            />
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold text-slate-700">
                                    {data.name || "John Michael"}
                                </p>
                                <p className="text-sm text-slate-700">
                                    {data.email || "john@creative-tim.com"}
                                </p>
                            </div>
                        </div>
                    </td>
                )
            }


        </>
    )
}

const ColumnType = {
    TEXT: 'text',
    CHIP: 'chip',
    DATE: 'date',
    USER: 'user',
    COL: 'col'
};

Col.propTypes = {
    data: any.isRequired,
    type: oneOf(Object.values(ColumnType)).isRequired,
    chipCondition: string
};

export default Col;