import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import {
  Alert,
  Box,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { complianceQueue } from "@shared/index";
import MetricGrid from "../components/MetricGrid";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { useApiResource } from "../lib/useApiResource";

export default function CompliancePage() {
  const { data, error } = useApiResource("/compliance/queue", complianceQueue);

  const metrics = [
    { label: "Open filings", value: String(data.length), trend: "Queue across AES, ISF, entry, and screening" },
    {
      label: "High priority",
      value: String(data.filter((item) => item.priority === "High").length),
      trend: "Broker and compliance analyst attention required"
    },
    {
      label: "Jurisdictions",
      value: String(new Set(data.map((item) => item.jurisdiction)).size),
      trend: "Current regulatory footprint in the queue"
    },
    { label: "Audit posture", value: "Full log", trend: "Every customs action is intended to be attributable and retained" }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Customs and compliance"
        title="Regulatory execution workspace"
        description="Import and export declarations, tariff validation, sanctions screening, customs bond management, and audit-ready customs actions live in one tightly controlled workspace."
        status="High-regulation module"
      />

      <MetricGrid items={metrics} />
      {error ? <Alert sx={{ mt: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Compliance queue" subtitle="Live filing and screening workbench" action={<GavelRoundedIcon color="primary" />}>
            <Table sx={{ "& td, & th": { borderBottomColor: "rgba(15,79,191,0.08)" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Jurisdiction</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.jurisdiction}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.priority}
                        color={item.priority === "High" ? "error" : item.priority === "Medium" ? "warning" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="Screening coverage" subtitle="Sanctions and trade controls" action={<PolicyRoundedIcon color="primary" />}>
            <Stack spacing={1.1}>
              {[
                "OFAC SDN, EU, UN, and BIS denied party screening on every relevant party.",
                "Country of origin, tariff code, and dual-use checks attached to the shipment audit history.",
                "Continuous bond and single-entry bond references preserved for downstream filing."
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
          <SectionCard title="Required capabilities" subtitle="Spec coverage for customs execution" action={<PublicRoundedIcon color="primary" />}>
            <Grid container spacing={1.5}>
              {[
                "Import and export declaration creation",
                "HS code search and duty calculation engine",
                "AES, ISF 10+2, and CBP 7501 workflow support",
                "Post-entry amendments and broker power of attorney storage",
                "Worksheet automation for duties, taxes, and origin management",
                "Auditable screening logs for AEO and C-TPAT readiness"
              ].map((item) => (
                <Grid key={item} size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 5,
                      border: "1px solid rgba(15,79,191,0.08)",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.84), rgba(245,249,255,0.84))"
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                      {item}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Broker cockpit" subtitle="Decision points for the current queue">
            <Stack spacing={1.5}>
              {[
                { title: "Priority escalation", text: "High priority queues should route to broker leads before cargo availability windows close." },
                { title: "Country rules", text: "Country-specific filing rules and duty formulas should stay configurable by tenant." },
                { title: "Audit retention", text: "Every create, edit, and submit event needs user attribution and durable retention." }
              ].map((item) => (
                <Box key={item.title}>
                  <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {item.text}
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
