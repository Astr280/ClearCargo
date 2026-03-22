import { Card, CardContent, Grid, Typography } from "@mui/material";
import type { DashboardMetric } from "@shared/index";

interface MetricGridProps {
  items: DashboardMetric[];
}

export default function MetricGrid({ items }: MetricGridProps) {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.label} size={{ xs: 12, md: 6, xl: 3 }}>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.trend}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
