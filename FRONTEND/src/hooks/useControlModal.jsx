import { useEffect, useState } from "react";

function useControlModal({
  initialCondition = false,
  handleOpen,
  handleClose,
}= {}) {
  const [open, setOpen] = useState(initialCondition);

  useEffect(() => {
    setOpen(initialCondition);
  }, [initialCondition]);

  const openModal = () => {
    setOpen(true);
    if (handleOpen) {
      handleOpen();
    }
  };

  const closeModal = () => {
    setOpen(false);
    if (handleClose) {
      handleClose();
    }
  };

  return [open, openModal, closeModal];
}

export default useControlModal;
