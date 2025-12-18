import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /**
   * Use "delete" to render destructive styling for the confirm button.
   * Defaults to "default".
   */
  intent?: "default" | "delete";
  /**
   * When true, confirm button shows loading-like disabled state and dialog can’t be closed.
   */
  loading?: boolean;
  maxWidth?: "xs" | "sm" | "md";
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmDialog({
  open,
  title = "Confirm",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  intent = "default",
  loading = false,
  maxWidth = "xs",
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  // Prevent closing while loading (e.g., during async delete)
  const handleClose = (
    _?: unknown,
    reason?: "backdropClick" | "escapeKeyDown"
  ) => {
    if (loading) return;
    // Only allow programmatic onClose when not loading
    if (!reason) onClose();
  };

  const handleCancel = () => {
    if (!loading) onClose();
  };

  const handleConfirm = async () => {
    const result = onConfirm();
    if (result && typeof (result as Promise<void>).then === "function") {
      try {
        await result;
      } catch {
        // Let the parent manage error display if needed
      }
    }
  };

  const confirmColor = intent === "delete" ? "error" : "primary";

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>{title}</DialogTitle>
      {description ? (
        <DialogContent dividers>
          {typeof description === "string" ? (
            <Typography>{description}</Typography>
          ) : (
            description
          )}
        </DialogContent>
      ) : null}
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          color={confirmColor}
          variant="contained"
          onClick={handleConfirm}
          disabled={loading}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
