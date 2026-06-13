import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './AppDialog.module.css';

export type AppDialogVariant = 'info' | 'success' | 'warning' | 'error' | 'danger';

interface AppDialogProps {
  open: boolean;
  title: string;
  message: string;
  variant?: AppDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

function DialogIcon({ variant }: { variant: AppDialogVariant }) {
  if (variant === 'success') return <CheckCircle2 size={26} />;
  if (variant === 'error' || variant === 'danger') return <XCircle size={26} />;
  if (variant === 'warning') return <AlertTriangle size={26} />;
  return <Info size={26} />;
}

export function AppDialog({
  open,
  title,
  message,
  variant = 'info',
  confirmLabel = 'Entendi',
  cancelLabel,
  onConfirm,
  onCancel,
}: AppDialogProps) {
  const handleCancel = onCancel || onConfirm;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
        >
          <motion.section
            className={styles.dialog}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="app-dialog-title"
            aria-describedby="app-dialog-description"
            onClick={(event) => event.stopPropagation()}
          >
            <button className={styles.closeBtn} type="button" onClick={handleCancel} aria-label="Fechar alerta">
              <X size={18} />
            </button>

            <div className={`${styles.iconCircle} ${styles[variant]}`}>
              <DialogIcon variant={variant} />
            </div>

            <h2 id="app-dialog-title">{title}</h2>
            <p id="app-dialog-description">{message}</p>

            <div className={styles.actions}>
              {cancelLabel && (
                <button className={styles.cancelBtn} type="button" onClick={handleCancel}>
                  {cancelLabel}
                </button>
              )}
              <button
                className={`${styles.confirmBtn} ${variant === 'danger' ? styles.dangerBtn : ''}`}
                type="button"
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
