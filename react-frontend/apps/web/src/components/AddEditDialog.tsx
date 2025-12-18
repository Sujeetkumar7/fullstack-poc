import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

import type { Role, UserRow } from "../types/users";

export type UserAddEditDialogProps = {
  open: boolean;
  editMode?: boolean;
  initialValue?: Partial<UserRow>;
  onClose: () => void;
  onSubmit: (value: {
    userId?: string;
    username: string;
    currentBalance: number;
    userRole: Role;
  }) => void;
};

const ROLE_OPTIONS: Role[] = ["USER", "ADMIN"] as const;

export default function UserAddEditDialog({
  open,
  editMode = false,
  initialValue,
  onClose,
  onSubmit,
}: UserAddEditDialogProps) {
  const [username, setUsername] = React.useState<string>(
    initialValue?.username ?? ""
  );
  const [currentBalance, setCurrentBalance] = React.useState<string>(
    initialValue?.currentBalance != null
      ? String(initialValue.currentBalance)
      : ""
  );
  const [role, setRole] = React.useState<string>(
    (initialValue?.userRole as Role | undefined) ?? ""
  );

  React.useEffect(() => {
    setUsername(initialValue?.username ?? "");
    setCurrentBalance(
      initialValue?.currentBalance != null
        ? String(initialValue.currentBalance)
        : ""
    );
    setRole((initialValue?.userRole as Role | undefined) ?? "");
  }, [open, initialValue, editMode]);

  const usernameValid = username.trim().length >= 3 && !/\s/.test(username);
  const balanceValid = currentBalance !== "" && !isNaN(Number(currentBalance));
  const roleValid = ROLE_OPTIONS.includes(role as Role);
  const formValid = usernameValid && balanceValid && roleValid;

  const handleSave = () => {
    if (!formValid) return;
    onSubmit({
      userId: initialValue?.userId,
      username: username.trim(),
      currentBalance: Number(currentBalance),
      userRole: role as Role,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editMode ? "Edit User" : "Add User"}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={editMode}
            error={!usernameValid && username !== ""}
            helperText={
              !usernameValid && username !== ""
                ? "Minimum 3 characters; spaces not allowed."
                : " "
            }
            autoFocus={!editMode}
          />

          <TextField
            label="Current Balance"
            type="number"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
            error={!balanceValid && currentBalance !== ""}
            helperText={
              !balanceValid && currentBalance !== ""
                ? "Enter a valid amount."
                : " "
            }
            inputProps={{ inputMode: "decimal" }}
          />

          <div>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Role
            </Typography>
            <RadioGroup
              row
              value={role}
              onChange={(event) => {
                const value = event.target.value;
                setRole(value);
              }}
            >
              {ROLE_OPTIONS.map((opt) => (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={<Radio />}
                  label={opt}
                />
              ))}
            </RadioGroup>
            {!roleValid && (
              <Typography color="error" variant="caption">
                Role is required.
              </Typography>
            )}
          </div>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={!formValid} variant="contained">
          {editMode ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
