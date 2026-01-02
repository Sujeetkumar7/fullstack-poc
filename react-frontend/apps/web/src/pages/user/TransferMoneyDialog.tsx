
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";

import { getUsersList } from "@rsd/api";
import { saveTransaction } from "../../../../../packages/api/src/transactions";
import { UseSnackbar } from "../../components/useSnackbar";

type Props = {
  open: boolean;
  fromUserId: string;
  fromUsername: string;
  currentBalance: number;
  onClose: () => void;
  onSuccess: (result?: any) => void;
};

type UserOption = { userId: string; username: string };

export default function TransferMoneyDialog({
  open,
  fromUserId,
  fromUsername,
  currentBalance,
  onClose,
  onSuccess,
}: Props) {
  const [users, setUsers] = React.useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string>("");

  const [toUserId, setToUserId] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string>("");

  const { openSnackbar, SnackbarRenderer } = UseSnackbar();

  const resetForm = () => {
    setToUserId("");
    setAmount("");
    setSubmitError("");
  };

  // Load users when opened
  React.useEffect(() => {
    if (!open) return;
    let active = true;

    const load = async () => {
      setLoadingUsers(true);
      setLoadError("");
      try {
        const list = await getUsersList(); // expects [{ userId, username, ...}]
        if (!active) return;
        const options = (list || [])
          .filter((u: any) => u?.userId && String(u.userId) !== String(fromUserId))
          .map((u: any) => ({
            userId: String(u.userId),
            username: String(u.username ?? u.userId),
          }));
        setUsers(options);
      } catch (e: any) {
        if (active) setLoadError(e?.message ?? "Failed to load users.");
      } finally {
        if (active) setLoadingUsers(false);
      }
    };
    load();

    return () => {
      active = false;
    };
  }, [open, fromUserId]);

  // Validation helpers (min = 1 like Angular; amount <= currentBalance)
  const amtNum = Number(amount);
  const isAmtValid = Number.isFinite(amtNum) && amtNum >= 1 && amtNum <= currentBalance;
  const canSubmit = open && !submitting && !!toUserId && isAmtValid;

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const handleTransfer = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      setSubmitError("");

      const body = {
        sourceUserId: fromUserId,
        destinationUserId: toUserId,
        amount: amtNum,
      };
      const result = await saveTransaction(body);

      // Resolve selected user's username for a friendly message
      const destinationUser = users.find((u) => u.userId === toUserId);
      openSnackbar(`₹${amtNum} transferred to ${destinationUser?.username ?? toUserId}`, {
        duration: 3000,
        variant: "success",
        className: "success-snackbar",
      });

      resetForm();
      onSuccess?.(result);
      onClose();
    } catch (e: any) {
      const msg = e?.message ?? "Transfer failed. Please try again.";
      setSubmitError(msg);
      openSnackbar(msg, {
        duration: 3000,
        variant: "error",
        className: "error-snackbar",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Transfer Money</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {loadError && <Alert severity="error">{loadError}</Alert>}

            <TextField
              label="From User"
              value={`${fromUsername}`}
              InputProps={{ readOnly: true }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="to-user-label">To User</InputLabel>
              <Select
                labelId="to-user-label"
                label="To User"
                value={toUserId}
                onChange={(e) => setToUserId(String(e.target.value))}
                disabled={loadingUsers}
              >
                <MenuItem value="">
                  <em>-- Select user --</em>
                </MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.userId} value={u.userId}>
                    {u.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              inputProps={{ min: 1, step: "0.01" }}
              error={!!amount && !isAmtValid}
              helperText={
                !!amount && !isAmtValid
                  ? `Enter an amount between ₹1 and ₹${currentBalance}`
                  : " "
              }
              fullWidth
            />

            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleTransfer}
            disabled={!canSubmit}
            endIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting ? "Transferring…" : "Transfer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Render the reusable snackbar once per dialog */}
      {SnackbarRenderer}
    </div>
  );
}
