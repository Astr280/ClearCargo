import { Alert, Box, Button, Chip, Grid, List, ListItem, ListItemText, Skeleton, Stack, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";
import MetricGrid from "../components/MetricGrid";
import SectionCard from "../components/SectionCard";
import { dashboardMetrics, platformOverview } from "@shared/index";
import { useApiResource } from "../lib/useApiResource";

interface DashboardResponse {
  metrics: typeof dashboardMetrics;
  recentShipments: Array<{
    id: string;
    jobNumber: string;
    customer: string;
    origin: string;
    destination: string;
    mode: string;
    stage: string;
    marginPercent: number;
  }>;
  platform: typeof platformOverview.architecture;
}

export default function DashboardPage() {
  const { data, loading, error } = useApiResource<DashboardResponse>("/dashboard", {
    metrics: dashboardMetrics,
    recentShipments: [],
    platform: platformOverview.architecture
  });

  return (
    <>
      <PageHeader
        eyebrow="Control tower"
        title="CargoClear operations command"
        description="This is the actual platform shell: shipment execution, compliance queues, finance visibility, warehouse readiness, customer operations, and platform controls."
        status="Phase 1 foundation in progress"
        actions={<Button variant="contained">Create shipment</Button>}
      />

      <MetricGrid items={data.metrics} />

      {error ? <Alert sx={{ mt: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Shipment activity" subtitle="Live jobs across freight modes">
            <Stack spacing={1.5}>
              {loading
                ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} variant="rounded" height={92} />)
                : data.recentShipments.map((shipment) => (
                <Box key={shipment.id} sx={{ p: 2, border: "1px solid rgba(22,89,199,0.08)", borderRadius: 4 }}>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="h6">{shipment.jobNumber}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {shipment.customer} · {shipment.origin} to {shipment.destination} · {shipment.mode}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label={shipment.stage} color="primary" variant="outlined" />
                      <Chip label={`${shipment.marginPercent}% GP`} />
                    </Stack>
                  </Stack>
                </Box>
                ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="Platform readiness" subtitle="Architecture and scale posture">
            <List disablePadding>
              {platformOverview.tenancy.map((item) => (
                <ListItem key={item} disableGutters>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
