
import * as React from "react";
import { Card, CardHeader, CardContent, Typography, Stack, TextField, InputAdornment, Alert } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function Transactions() {
  const [query, setQuery] = React.useState("");
  const [loading] = React.useState(false); // wire to your store/API
  const [rows] = React.useState<any[]>([]); // wire to your data

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        title="Transactions"
        action={
          <TextField
            size="small"
            placeholder="Search transactions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
        }
      />
      <CardContent>
        {loading ? (
          <Stack spacing={1}>
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine />
          </Stack>
        ) : rows.length === 0 ? (
          <Alert severity="info">No transactions found. Connect your API to populate data.</Alert>
        ) : (
          <Typography variant="body2">Render your transactions table here.</Typography>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonLine() {
  return <div style={{ height: 16, background: "var(--mui-palette-divider)", borderRadius: 6 }} />;
}
