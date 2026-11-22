import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-2xl", isClosable = true }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`bg-white rounded-[40px] shadow-2xl w-full ${maxWidth} overflow-hidden border border-white/20`}
        >
          <div className="p-10 relative">
            {isClosable && (
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {(title || subtitle) && (
              <div className="mb-8 text-left">
                {title && <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">{title}</h2>}
                {subtitle && <p className="text-[10px] font-bold text-[#207b25] uppercase tracking-[0.3em] mt-1">{subtitle}</p>}
              </div>
            )}

            <div className="space-y-6">
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;