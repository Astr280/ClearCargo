import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import { Alert, Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { customers } from "@shared/index";
import MetricGrid from "../components/MetricGrid";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { useApiResource } from "../lib/useApiResource";

export default function CustomersPage() {
  const { data, error } = useApiResource("/customers", customers);

  const metrics = [
    { label: "Accounts", value: String(data.length), trend: "Active customers across current seed portfolio" },
    { label: "Open shipments", value: String(data.reduce((sum, customer) => sum + customer.openShipments, 0)), trend: "Combined execution load" },
    { label: "Quoted lanes", value: String(new Set(data.map((customer) => customer.lane)).size), trend: "Trade-lane diversity across customers" },
    { label: "Won pipeline", value: String(data.filter((customer) => customer.quoteStage === "Won").length), trend: "Accounts already converted from quote to live work" }
  ];

  return (
    <>
      <PageHeader
        eyebrow="CRM and customer portal"
        title="Customers, quotes, and self-service visibility"
        description="Customer master data, commercial pipeline, account health, portal access, shipment visibility, and coordinator communication all belong in one joined-up workspace."
        status="CRM plus portal scope"
      />

      <MetricGrid items={metrics} />
      {error ? <Alert sx={{ mt: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Customer portfolio" subtitle="Accounts, trade lanes, and commercial state" action={<GroupsRoundedIcon color="primary" />}>
            <Stack spacing={1.5}>
              {data.map((customer) => (
                <Box
                  key={customer.name}
                  sx={{
                    p: 2,
                    borderRadius: 5,
                    border: "1px solid rgba(15,79,191,0.08)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(245,249,255,0.9))"
                  }}
                >
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
                    <Box>
                      <Typography fontWeight={700} sx={{ mb: 0.4 }}>
                        {customer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customer.lane} with {customer.creditTerms} terms
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip label={`Quote: ${customer.quoteStage}`} variant="outlined" />
                      <Chip label={`${customer.openShipments} open shipments`} sx={{ bgcolor: "rgba(15,79,191,0.06)" }} />
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="Portal capabilities" subtitle="What the customer should be able to do" action={<TravelExploreRoundedIcon color="primary" />}>
            <Stack spacing={1.1}>
              {[
                "Sign in with MFA and see only their shipments, invoices, and approved documents.",
                "Track milestones, estimated delivery, and shipment history without asking operations for updates.",
                "Submit quote and booking requests while controlling email and alert preferences.",
                "Pay invoices online and message their freight coordinator in context."
              ].map((item) => (
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
          <SectionCard title="CRM flow" subtitle="Pipeline and commercial workflow">
            <Grid container spacing={1.5}>
              {[
                { title: "Lead to quote", text: "Build quotes with freight, customs, and local charges tied to preferred lanes and carriers." },
                { title: "Quote to job", text: "One-click conversion should preserve commercial assumptions and required documents." },
                { title: "Contacts", text: "Multiple contacts per company with roles, approvals, and communication preferences." },
                { title: "Credit control", text: "Credit terms and account health should inform whether bookings and releases can proceed." }
              ].map((item) => (
                <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 5,
                      border: "1px solid rgba(15,79,191,0.08)",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.84), rgba(245,249,255,0.84))"
                    }}
                  >
                    <Typography fontWeight={700} sx={{ mb: 0.6 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {item.text}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Customer communication" subtitle="Operational clarity without email sprawl" action={<ChatBubbleOutlineRoundedIcon color="primary" />}>
            <Stack spacing={1.5}>
              {[
                "Messages should attach directly to the shipment and split into internal and customer-visible notes.",
                "Approvals for quotes, document release, and billing events should appear in both portal and operator views.",
                "Every customer-facing update should be traceable back to the responsible owner and timestamp."
              ].map((item) => (
                <Box key={item}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
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
