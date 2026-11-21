import Modal from './Modal';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemType = 'registro' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} bgColor="bg-red-600" textColor="text-white" title="¿Estás seguro?">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
          🗑️
        </div>
        <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-2">
          ¿Estás seguro?
        </h3>
        <p className="text-sm font-medium text-gray-400 leading-relaxed mb-8">
          Esta acción eliminará el {itemType} permanentemente de la base de datos. No se puede deshacer.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-red-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            Sí, eliminar {itemType}
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-gray-100 text-gray-500 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;