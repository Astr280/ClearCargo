import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { dashboardMetrics, platformOverview } from "@shared/index";
import { Link } from "react-router-dom";
import MetricGrid from "../components/MetricGrid";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
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
        description="A clearer control surface for freight execution, customs queues, finance visibility, customer operations, and platform readiness."
        status="Phase 1 foundation in progress"
        actions={
          <Button component={Link} to="/shipments" variant="contained">
            Create shipment
          </Button>
        }
      />

      <MetricGrid items={data.metrics} />

      {error ? <Alert sx={{ mt: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Live shipment activity" subtitle="Recent jobs across the freight network">
            <Stack spacing={1.5}>
              {loading
                ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} variant="rounded" height={92} />)
                : data.recentShipments.map((shipment) => (
                    <Box
                      key={shipment.id}
                      sx={{
                        p: 2,
                        border: "1px solid rgba(22,89,199,0.08)",
                        borderRadius: 5,
                        background: "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(243,248,255,0.88))"
                      }}
                    >
                      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
                        <Stack spacing={0.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography component={Link} to={`/shipments/${shipment.id}`} variant="h6" sx={{ color: "primary.main" }}>
                              {shipment.jobNumber}
                            </Typography>
                            <Chip size="small" label={shipment.mode} />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {shipment.customer} - {shipment.origin} to {shipment.destination}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Chip label={shipment.stage} color="primary" variant="outlined" />
                          <Chip label={`${shipment.marginPercent}% GP`} sx={{ bgcolor: "rgba(22,164,201,0.08)" }} />
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

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Operational focus" subtitle="What matters today">
            <Stack spacing={1.75}>
              {[
                {
                  icon: <LocalShippingOutlinedIcon color="primary" />,
                  title: "Ocean bookings",
                  text: "18 containers need milestone updates before cut-off."
                },
                {
                  icon: <TaskAltOutlinedIcon color="primary" />,
                  title: "Document automation",
                  text: "AWB, invoice, packing list, and release packets are within SLA."
                },
                {
                  icon: <PublicOutlinedIcon color="primary" />,
                  title: "Customs exposure",
                  text: "US filing queue is healthy, but two screenings require review."
                }
              ].map((item) => (
                <Stack key={item.title} direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ mt: 0.4 }}>{item.icon}</Box>
                  <Box>
                    <Typography fontWeight={700}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {item.text}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Launch scorecard" subtitle="Success metrics against the spec">
            <Stack spacing={1.8}>
              {[
                { label: "Create shipment under 3 minutes", value: 78 },
                { label: "Generate doc pack under 30 seconds", value: 86 },
                { label: "Customs filing error rate below 0.5%", value: 92 }
              ].map((item) => (
                <Box key={item.label}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.value}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={item.value}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: "rgba(15,79,191,0.08)"
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Control tower notes" subtitle="Execution signals from the workspace">
            <Stack spacing={1.25}>
              {[
                "Persistent shipment records are now active through the API.",
                "The freight workspace supports create, edit, stage updates, detail drill-down, and delete.",
                "Linked shipment documents and richer module views are ready for the next auth and automation layer."
              ].map((item) => (
                <Box
                  key={item}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 4,
                    bgcolor: "rgba(15,79,191,0.04)"
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
