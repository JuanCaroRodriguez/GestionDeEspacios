import { Children, cloneElement } from "react";
import { bool, func, node, object } from "../../tools/Types";

const PopoverHandler = ({ children, togglePopover,buttonRef  }) => {
    return Children.map(children, (child) => {
        return cloneElement(child, {
            onClick: togglePopover,
            ref: buttonRef
        });
    });
};

PopoverHandler.propTypes = {
    children: node.isRequired,
    isOpen: bool,
    togglePopover: func,
    buttonRef: object,
};

export default PopoverHandler;
