'use client';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/shared/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/shared/components/ui/dialog';

import { useModal } from '../calendar/providers/modal-context';

interface CustomModalProps {
  title?: string;
  subheading?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  contentClass?: string;
  id?: string;
  customizedModal?: boolean;
}

export default function CustomModal({
  title,
  subheading,
  children,
  defaultOpen = false,
  contentClass,
  id = 'default',
  customizedModal = false,
}: CustomModalProps) {
  const { isOpen, setClose, setOpen, canClose, setCanClose } = useModal();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  const contentClassName = clsx('overflow-auto rounded-md bg-card', contentClass);

  // Narrow dependency: only react to isOpen for this specific modal.
  useEffect(() => {
    setLocalOpen(isOpen[id] ?? defaultOpen);
  }, [isOpen[id], id, defaultOpen]);

  // Auto-focus when modal opens.
  useEffect(() => {
    if (localOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [localOpen]);

  function handleOpenChange(open: boolean) {
    // Check the specific modal's canClose flag.
    if (!open && canClose[id] === false) {
      setShowConfirmation(true);
    } else {
      setLocalOpen(open);
      if (!open) {
        setTimeout(() => setClose(id), 300);
      } else {
        // IMPORTANT: Ensure you pass a valid modal element when opening.
        setOpen(
          <CustomModal
            id={id}
            title={title}
            subheading={subheading}
            contentClass={contentClass}
            customizedModal={customizedModal}
          >
            {children}
          </CustomModal>,
          undefined,
          id,
        );
      }
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      const focusableElements = contentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as NodeListOf<HTMLElement>;
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    } else if (event.key === 'Escape') {
      handleOpenChange(false);
    }
  }

  // Updated handleConfirmClose to force-close the modal.
  function handleConfirmClose() {
    setShowConfirmation(false);
    // Force the modal to be closable by updating canClose.
    setCanClose(id, true);
    setLocalOpen(false);
    setTimeout(() => setClose(id), 300);
  }

  return (
    <>
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to close?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will close the current modal. Any unsaved changes may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {customizedModal ? (
        <AnimatePresence>
          {localOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/10 bg-opacity-50 backdrop-blur-sm"
              onClick={() => handleOpenChange(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={clsx('relative rounded-xl p-1 shadow-xl outline-none md:p-6', contentClassName)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                ref={contentRef}
                tabIndex={-1}
              >
                <button
                  className="absolute right-2 top-2 rounded-full p-1 transition-colors"
                  onClick={() => handleOpenChange(false)}
                >
                  <X className="size-4" />
                </button>
                {title && <h2 className="mb-4 text-2xl font-semibold tracking-tighter">{title}</h2>}
                {subheading && <p className="mb-4 text-muted-foreground">{subheading}</p>}
                <div className="flex grow flex-col pt-[0.5em]">{children}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <Dialog open={localOpen} onOpenChange={handleOpenChange}>
          <DialogContent className={contentClassName}>
            <DialogHeader className="py-2 text-left">
              <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
              {subheading && <DialogDescription>{subheading}</DialogDescription>}
              <div className="flex grow flex-col pt-[0.5em]">{children}</div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
