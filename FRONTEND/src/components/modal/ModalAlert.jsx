import PropTypes from 'prop-types';
import Modal from "./Modal"

const ModalAlert = (props) => {

  const { show, onClose, title, handleAction, children } = props

  return (
    <>
      <Modal show={show} onClose={onClose} title={title}>
        <div className="flex flex-col gap-6 w-[500px] max-w-[100vw] md:min-w-[500px]">
          
          <div className="text-xl py-2">
            {children}
          </div>

          <div className="flex justify-end gap-6 mb-2">
            <button onClick={onClose} className="flex justify-center items-center max-w-48 gap-2 border border-gray-600 p-3 px-5 rounded-lg font-semibold w-1/2 hover:bg-gray-100 transition-all">Volver</button>
            <button onClick={() => { handleAction(), onClose() }} className="flex justify-center items-center max-w-48 gap-2 bg-primary p-3 px-5 rounded-lg font-semibold w-1/2">Confirmar</button>
          </div>

        </div>

      </Modal>
    </>
  )
}

ModalAlert.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  handleAction: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default ModalAlert