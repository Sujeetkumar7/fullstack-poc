
import * as React from "react";
import { Card, CardHeader, CardContent, Typography, Grid, Alert } from "@mui/material";

export default function Stocks() {
  const [loading] = React.useState(false); // wire up later
  const [items] = React.useState<any[]>([]);

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title="Stocks" subheader="Watchlist / holdings overview" />
      <CardContent>
        {loading ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><SkeletonCard /></Grid>
            <Grid item xs={12} md={4}><SkeletonCard /></Grid>
            <Grid item xs={12} md={4}><SkeletonCard /></Grid>
          </Grid>
        ) : items.length === 0 ? (
          <Alert severity="info">Connect to a market data feed to show quotes and holdings.</Alert>
        ) : (
          <Typography variant="body2">Render your holdings/watchlist cards here.</Typography>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
   return <div style={{ height: 120, background: "var(--mui-palette-divider)", borderRadius: 8 }} />;
}