
// src/components/useSnackbar.tsx
import * as React from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

type OpenOptions = {
  duration?: number;
  variant?: AlertColor;      
  className?: string;
};

export function UseSnackbar() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState<string>("");
  const [duration, setDuration] = React.useState<number>(3000);
  const [variant, setVariant] = React.useState<AlertColor>("info");
  const [className, setClassName] = React.useState<string | undefined>(undefined);

  const openSnackbar = (text: string, opts?: OpenOptions) => {
    setMessage(text);
    setDuration(opts?.duration ?? 3000);
    setVariant(opts?.variant ?? "info");
    setClassName(opts?.className);
    setOpen(true);
  };

  const closeSnackbar = () => setOpen(false);

  const SnackbarRenderer = (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={closeSnackbar}
        severity={variant}
        variant="filled"
        sx={{ width: "100%" }}
        className={className}
      >
        {message}
      </Alert>
    </Snackbar>
  );

  return { openSnackbar, closeSnackbar, SnackbarRenderer };
}
