import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function useFocusOut({
    handleFocusOut = () => {},
    ignoreElementsById = [],
    ignoreElementsByRef = [],
}) {
    const elementRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                elementRef.current &&
                !elementRef.current.contains(event.target)
            ) {
                if (!isIgnoredElement(event.target)) {
                    handleFocusOut(event);
                }
            }
        };

        const isIgnoredElement = (target) => {
            let parent = target;

            while (parent) {
                if (parent) {
                    if (ignoreElementsById.includes(parent.id)) {
                        return true;
                    }
                    if (ignoreElementsByRef.some(ref => ref.current === parent)) {
                        return true;
                    }
                }

                parent = parent.parentNode;
            }

            return false;
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleFocusOut, ignoreElementsById, ignoreElementsByRef]);

    return elementRef;
}

// Solo puedes usar PropTypes para validar props en componentes, no en hooks
useFocusOut.propTypes = {
    handleFocusOut: PropTypes.func.isRequired,
    ignoreElementsById: PropTypes.arrayOf(PropTypes.string),
    ignoreElementsByRef: PropTypes.arrayOf(PropTypes.shape({ current: PropTypes.instanceOf(Element) })),
};

export default useFocusOut;
