import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Snackbar, Alert } from "@mui/material";

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null); // { message, opts }
  const queueRef = useRef([]); // array of jobs

  const processQueue = useCallback(() => {
    if (open || current) return;
    const next = queueRef.current.shift() || null;
    if (next) {
      setCurrent(next);
      setOpen(true);
    }
  }, [open, current]);

  const show = useCallback(
    (message, opts = {}) => {
      queueRef.current.push({
        message,
        opts: {
          severity: opts.severity || "info",
          autoHideDuration: opts.autoHideDuration || 4000,
          action: opts.action,
        },
      });
      processQueue();
    },
    [processQueue]
  );

  const close = useCallback(() => setOpen(false), []);

  const handleClose = (_e, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleExited = () => {
    setCurrent(null);
    processQueue();
  };

  const api = useMemo(
    () => ({
      show,
      success: (m, o) => show(m, { ...o, severity: "success" }),
      info: (m, o) => show(m, { ...o, severity: "info" }),
      warning: (m, o) => show(m, { ...o, severity: "warning" }),
      error: (m, o) => show(m, { ...o, severity: "error" }),
      close,
    }),
    [show, close]
  );

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={current?.opts?.autoHideDuration}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        // anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={close}
          severity={current?.opts?.severity}
          variant="filled"
          sx={{ alignItems: "center" }}
          action={current?.opts?.action}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx)
    throw new Error("useSnackbar must be used within <SnackbarProvider>");
  return ctx;
}
