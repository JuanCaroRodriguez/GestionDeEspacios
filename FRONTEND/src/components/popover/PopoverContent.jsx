import { bool, node, object, oneOf, string } from "../../tools/Types";


const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    'top-start': 'bottom-full -left-2 mb-2',
    'top-end': 'bottom-full -right-2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    'bottom-start': 'top-full -left-2 mt-2',
    'bottom-end': 'top-full -right-2 mt-2',
    left: 'right-full top-2 transform -translate-y-1/2 mr-2.5 mb-2',
    'left-start': 'right-full -top-4 mr-2',
    'left-end': 'right-full -bottom-2 mr-2',
    right: 'left-full top-2 transform -translate-y-1/2 ml-2.5 mb-2',
    'right-start': 'left-full -top-4 ml-4',
    'right-end': 'left-full -bottom-2 ml-4',
};
/**
 * @typedef {'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'} Position
 */
/**
 * 
 * @param {number | boolean} isOpen
 * @param {object} popoverRef
 * @param {node} children
 * @param {Position} position
 * @param {boolean} showIndicator
 * @param {string} className
 * @returns 
 */


const PopoverContent = ({ isOpen, className, popoverRef, position = "bottom", showIndicator, children }) => {

    return (
        <div
            ref={popoverRef}
            data-position={position}
            className={`
               
                ${showIndicator ? 'popover-content' : ''}
                ${isOpen ? "" : "pointer-events-none"}
                transition-all duration-300 absolute z-10 mt-2
                bg-white-dark border border-gray-bold rounded-lg
                shadow-lg ${isOpen ? "opacity-100" : "opacity-0"}
                ${positions[position]}
                ${className}
            `}
        >
            {children}
        </div>
    );
};

PopoverContent.propTypes = {
    isOpen: bool,
    className: string,
    popoverRef: object,
    children: node,
    position: oneOf(['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end']),
    showIndicator: bool
};

export default PopoverContent;
