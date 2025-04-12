'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import ReactDOM from 'react-dom';

interface OverlayProps {
  onClose?: () => void;
  isOpen?: boolean;
}

const Overlay: React.FC<OverlayProps> = ({ onClose, isOpen = true }) => {
  // Get or create a root element for the portal
  const portalRoot = typeof document !== 'undefined' ? document.getElementById('overlay-root') || document.body : null;

  if (!portalRoot) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.85, 0, 0.24, 1] }}
          className="fixed inset-0 z-50 flex size-full items-center justify-center bg-black/10 bg-opacity-50 backdrop-blur-md"
          onClick={onClose}
        />
      )}
    </AnimatePresence>,
    portalRoot,
  );
};

export default Overlay;
