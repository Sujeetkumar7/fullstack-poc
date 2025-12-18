import * as React from "react";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  TableBody,
  TablePagination,
  Chip,
  Stack,
  IconButton,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { UserRow } from "../types/users";

type Order = "asc" | "desc";

export type UsersTableProps = {
  rows: UserRow[];
  totalCount: number;
  order: Order;
  orderBy: keyof UserRow;
  onRequestSort: (
    e: React.MouseEvent<unknown>,
    property: keyof UserRow
  ) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (_event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  onEditUser: (row: UserRow) => void;
  onDeleteUser: (row: UserRow) => void;
};

export default function UsersTable({
  rows,
  totalCount,
  order,
  orderBy,
  onRequestSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
  onEditUser,
  onDeleteUser,
}: UsersTableProps) {
  const columns: (keyof UserRow | "actions")[] = [
    "userId",
    "username",
    "userRole",
    "currentBalance",
    "actions",
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
        <CircularProgress size={40} color="primary" />
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 480 }}>
        <Table size="small" stickyHeader aria-label="Users table">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col as string}
                  sortDirection={orderBy === col ? order : false}
                >
                  {col === "actions" ? (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Actions
                    </Typography>
                  ) : (
                    <TableSortLabel
                      active={orderBy === col}
                      direction={orderBy === col ? order : "asc"}
                      onClick={(e) => onRequestSort(e, col as keyof UserRow)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {
                          {
                            userId: "User ID",
                            username: "Username",
                            userRole: "Role",
                            currentBalance: "Current Balance",
                          }[col as keyof UserRow]
                        }
                      </Typography>
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow
                hover
                key={row.userId}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "rgba(0,0,0,0.02)" },
                }}
              >
                <TableCell>{row.userId}</TableCell>
                <TableCell>{row.username}</TableCell>
                <TableCell>
                  <Chip
                    label={row.userRole}
                    size="small"
                    color={row.userRole === "ADMIN" ? "primary" : "default"}
                    variant={row.userRole === "ADMIN" ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell>{`₹ ${Number(row.currentBalance).toLocaleString(
                  "en-IN"
                )}`}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      aria-label="Edit user"
                      size="small"
                      onClick={() => onEditUser(row)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="Delete user"
                      size="small"
                      color="error"
                      onClick={() => onDeleteUser(row)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box
                    sx={{ py: 4, textAlign: "center", color: "text.secondary" }}
                  >
                    No matching users found.
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </Paper>
  );
}
