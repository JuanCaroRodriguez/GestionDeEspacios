import { array, arrayOf, func, object, shape, string } from "../../tools/Types"
import Col from "./Col"

function Row({ item, headers, actions }) {
    return (
        <tr>
            {
                headers.map((header, index) => (
                    <Col key={index} data={item[header.key]} type={header?.type}
                        chipCondition={header?.chipCondition}
                    />
                ))
            }
            <td className="p-4 border-b border-slate-200">
                {
                    actions && actions.map((data, index) => (
                        
                        <button
                            key={index}
                            className="mr-2 relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button"
                            onClick={() => data?.onClick(item)}
                        >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                                {
                                    data.icon && data.icon 
                                }
                                {
                                    data.label && data.label
                                }
                            </span>

                        </button>
                    ))
                }

            </td>
        </tr>
    )
}

Row.propTypes = {
    item: object.isRequired,
    headers: array.isRequired,
    actions: arrayOf(
        shape({
            icon: string,
            label: string,
            onClick: func.isRequired
        })
    ),
}

export default Row