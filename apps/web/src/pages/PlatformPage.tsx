import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import { Alert, Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { platformOverview } from "@shared/index";
import MetricGrid from "../components/MetricGrid";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { useApiResource } from "../lib/useApiResource";

export default function PlatformPage() {
  const { data, error } = useApiResource("/platform/overview", platformOverview);

  return (
    <>
      <PageHeader
        eyebrow="Platform architecture"
        title="Scale, integrations, and tenancy"
        description="The platform layer defines the system stack, multi-tenant isolation model, enterprise controls, and third-party connectivity needed to compete with CargoWise-class products."
        status="Enterprise scale plan"
      />

      <MetricGrid items={data.architecture} />
      {error ? <Alert sx={{ mt: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Integration map" subtitle="External systems and delivery phases" action={<HubRoundedIcon color="primary" />}>
            <Grid container spacing={1.5}>
              {data.integrations.map((integration) => (
                <Grid key={integration.name} size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 5,
                      border: "1px solid rgba(15,79,191,0.08)",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.84), rgba(245,249,255,0.84))"
                    }}
                  >
                    <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                      {integration.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip size="small" label={integration.phase} variant="outlined" />
                      <Chip size="small" label={integration.method} sx={{ bgcolor: "rgba(15,79,191,0.06)" }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      Integration ownership, credential storage, retries, and auditability should be centralized at the platform layer.
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Security and compliance posture" subtitle="Non-functional expectations" action={<SecurityRoundedIcon color="primary" />}>
            <Stack spacing={1.1}>
              {[
                "SOC 2-aware architecture with encryption at rest and TLS 1.3 in transit.",
                "Role-based access control, audit logs, MFA, and optional IP allowlisting for enterprise tenants.",
                "Data retention, regional residency controls, backups, and disaster recovery targets built in from day one."
              ].map((item) => (
                <Box key={item} sx={{ p: 1.5, borderRadius: 4, bgcolor: "rgba(15,79,191,0.04)" }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Multi-tenancy controls" subtitle="How tenant isolation should work" action={<CloudQueueRoundedIcon color="primary" />}>
            <Stack spacing={1.2}>
              {data.tenancy.map((item) => (
                <Box key={item} sx={{ p: 1.5, borderRadius: 4, bgcolor: "rgba(22,164,201,0.05)" }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Runtime targets" subtitle="Operational expectations from the spec">
            <Grid container spacing={1.5}>
              {[
                { label: "API latency", value: "< 300ms p95" },
                { label: "Search latency", value: "< 500ms" },
                { label: "PDF generation", value: "< 5 seconds" },
                { label: "Tenant concurrency", value: "5,000 users" }
              ].map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 5,
                      border: "1px solid rgba(15,79,191,0.08)",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.84), rgba(245,249,255,0.84))"
                    }}
                  >
                    <Typography variant="overline" color="primary.main">
                      {item.label}
                    </Typography>
                    <Typography variant="h5">{item.value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
