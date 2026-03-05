import { useCallback, useEffect, useState } from 'react'
import { any, array, arrayOf, func, oneOf, shape, string } from '../../tools/Types'
import Paginate from './Paginate'
import Row from './Row'
import TableHead from './TableHead'

function Table({ config }) {

    const [dataTable, setDataTable] = useState(config.data)
    const [sorted, setSorted] = useState()
    const { otherOptions: OtherOptions } = config

    const sortByCol = useCallback(
        (key) => {
            console.log("Sorting by", key);

            const newSortedData = [...dataTable]; // Crear una copia para evitar mutaciones

            if ((sorted && sorted.direction === "desc") || !sorted) {
                // Ordenar ascendentemente
                newSortedData.sort((a, b) => {
                    if (JSON.stringify(a[key]) < JSON.stringify(b[key])) return -1;
                    if (JSON.stringify(a[key]) > JSON.stringify(b[key])) return 1;
                    return 0;
                });
                setDataTable(newSortedData); // Actualizar con los datos ordenados
                setSorted({
                    key,
                    direction: "asc"
                });
            } else {
                // Ordenar descendentemente
                newSortedData.sort((a, b) => {
                    if (JSON.stringify(a[key]) > JSON.stringify(b[key])) return -1;
                    if (JSON.stringify(a[key]) < JSON.stringify(b[key])) return 1;
                    return 0;
                });
                setDataTable(newSortedData); // Actualizar con los datos ordenados
                setSorted({
                    key,
                    direction: "desc"
                });
            }
        },
        [dataTable, sorted, config.data] // Dependencias para que el hook se mantenga actualizado
    );

    useEffect(() => {
        if (JSON.stringify(config.data) !== JSON.stringify(dataTable)) {
            setDataTable(config.data);
        }
    }, [config.data]);


    return (
        <div className="relative flex flex-col w-full text-slate-900 bg-white shadow-sm border rounded-md bg-clip-border">
            <div className="relative mx-4 mt-4 overflow-hidden text-slate-900 bg-white rounded-none bg-clip-border">
                <div className="flex items-center justify-between ">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {config.title}
                        </h3>
                        <p className="text-slate-900">
                            {config.subTitle}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
                        {
                            <OtherOptions />
                        }
                    </div>
                </div>
            </div>
            <div className="p-0">
                <table className="w-full mt-4 text-left table-auto min-w-max">
                    <TableHead
                        cols={config.headers}
                        actions={!!config.actions}
                        actionsConfig={config.actionsConfig}
                        sortable={sortByCol}
                        sortBy={sorted}
                    />
                    <tbody>
                        {
                            dataTable && dataTable.map((item, index) => (
                                <Row key={index}
                                    item={item}
                                    headers={config.headers}
                                    actions={config.actions}
                                />
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <Paginate
                data={config.data}
                setDataTable={setDataTable}
                limit={5}
            />
        </div>
    )
}
const ColumnType = {
    TEXT: 'text',
    CHIP: 'chip',
    DATE: 'date',
    USER: 'user',
    COL: 'col'
};

Table.propTypes = {
    config: shape({
        title: string.isRequired,
        subTitle: string.isRequired,
        otherOptions: any,
        data: array.isRequired,
        headers: arrayOf(
            shape({
                key: string.isRequired,
                label: string.isRequired,
                type: oneOf(Object.values(ColumnType)),
                chipCondition: string
            })
        ).isRequired,
        actions: arrayOf(
            shape({
                icon: string,
                label: string,
                onClick: func.isRequired
            })
        ),

    }).isRequired,
    actionsConfig: shape({
        label: string.isRequired,
    })
};
export default Table