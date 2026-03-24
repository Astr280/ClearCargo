import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import type { DashboardMetric } from "@shared/index";

interface MetricGridProps {
  items: DashboardMetric[];
}

export default function MetricGrid({ items }: MetricGridProps) {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.label} size={{ xs: 12, md: 6, xl: 3 }}>
          <Card
            sx={{
              borderRadius: "16px",
              height: "100%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,250,255,0.96) 100%)"
            }}
          >
            <CardContent sx={{ px: 3, py: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {item.label}
                </Typography>
                <TrendingUpRoundedIcon sx={{ color: "secondary.main", fontSize: 20 }} />
              </Stack>
              <Typography variant="h4" sx={{ mb: 1.25 }}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item.trend}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
