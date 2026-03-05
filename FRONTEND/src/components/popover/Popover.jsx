import { Children, cloneElement, useEffect, useRef, useState } from 'react';
import useFocusOut from '../../hooks/useFocusOut';
import { bool, node, shape, string } from '../../tools/Types';
const initialConfig = {
  open: false,
}
const Popover = ({ children,config=initialConfig,className }) => {
  const [isOpen, setIsOpen] = useState(config.open);
  const buttonRef = useRef(null);
  useEffect(() => {
    setIsOpen(config.open)
  }, [config])

  const popoverRef = useFocusOut({
    handleFocusOut: ()=>{
       setIsOpen(false)
    },
    ignoreElementsByRef: [buttonRef],
});


  const togglePopover = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      {Children.map(children, (child) =>
        cloneElement(child, {
          isOpen,
          togglePopover,
          popoverRef,
          buttonRef,
        })
      )}
    </div>
  );
};

Popover.propTypes = {
  children: node.isRequired,
  className: string,
  config: shape({
    open: bool
  })
};

export default Popover;
