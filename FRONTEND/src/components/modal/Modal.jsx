import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconX } from '@tabler/icons-react';

const Modal = (props) => {
  const { show, onClose, title, info, children, onlyMobile } = props;
  const [showChildren, setShowChildren] = useState(show);

  useEffect(() => {
    let timer;
    if (show) {
      setShowChildren(true);
    } else {
      timer = setTimeout(() => setShowChildren(false), 100);
    }
    return () => clearTimeout(timer); // Limpiar el temporizador en la limpieza
  }, [show]);

  return (
    <div className={`flex items-center justify-center fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 ${show ? 'overlay active' : 'overlay'} ${onlyMobile ? 'sm:hidden' : ''}`}>
      <div className={`w-full h-full md:min-w-[460px] md:w-auto md:h-auto bg-white rounded-lg border border-gray-bold ${show ? 'overlay active' : 'overlay'}`}>
        <div className="flex w-full items-center p-6 py-5 justify-between border-b border-gray-bold">
          <div>
            <h2 className="text-2xl font-semibold text-gray pr-5">{title}</h2>
            <p className='text-gray-20'>{info}</p>
          </div>
          <div className=''>
            <button className='transition-all duration-200 hover:bg-blue-dark size-9 flex justify-center items-center rounded-lg' 
              onClick={onClose}>
              <IconX size={32} />
            </button>
          </div>
        </div>
        <div className='p-6 py-6'>
        {showChildren && children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  show: PropTypes.any.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  info: PropTypes.string,
  children: PropTypes.node.isRequired,
  onlyMobile: PropTypes.bool,
};

export default Modal;
