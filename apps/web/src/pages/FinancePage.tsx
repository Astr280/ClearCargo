import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import {
  Alert,
  Box,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { financeSummary } from "@shared/index";
import MetricGrid from "../components/MetricGrid";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { useApiResource } from "../lib/useApiResource";

export default function FinancePage() {
  const { data, error } = useApiResource("/finance/summary", financeSummary);

  const marginRows = data.marginAlerts.map((item) => ({
    jobNumber: item.jobNumber,
    issue: item.message,
    action: "Review sell versus cost and notify job owner"
  }));

  return (
    <>
      <PageHeader
        eyebrow="Finance and billing"
        title="AR, AP, and job profitability"
        description="Invoice generation, vendor cost control, multi-currency charging, reconciliation, and gross-profit protection all roll up into a freight-specific finance workspace."
        status="Phase 1 plus Phase 2"
      />

      {error ? <Alert sx={{ mb: 2 }}>{error}</Alert> : null}

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Receivables
      </Typography>
      <MetricGrid items={data.receivables} />

      <Typography variant="h6" sx={{ mt: 3, mb: 1.5 }}>
        Payables
      </Typography>
      <MetricGrid items={data.payables} />

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Margin watchlist" subtitle="Jobs below target gross profit" action={<TrendingUpRoundedIcon color="primary" />}>
            <Table sx={{ "& td, & th": { borderBottomColor: "rgba(15,79,191,0.08)" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Job</TableCell>
                  <TableCell>Issue</TableCell>
                  <TableCell>Suggested action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marginRows.map((item) => (
                  <TableRow key={item.jobNumber} hover>
                    <TableCell>{item.jobNumber}</TableCell>
                    <TableCell>{item.issue}</TableCell>
                    <TableCell>{item.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="AR and AP controls" subtitle="Core finance expectations from the spec" action={<AccountBalanceWalletRoundedIcon color="primary" />}>
            <Stack spacing={1.1}>
              {[
                "Invoices generated from job cost sheets with itemized freight and local charge lines.",
                "Vendor invoices matched against estimates and purchase intent before payment release.",
                "Statements, aging, payment capture, and reconciliation attached to the customer account."
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
          <SectionCard title="Charge architecture" subtitle="How the billing engine should think" action={<ReceiptLongRoundedIcon color="primary" />}>
            <Grid container spacing={1.5}>
              {[
                { title: "Sell side", text: "Freight, customs, handling, destination, THC, documentation, and surcharges by currency and tax posture." },
                { title: "Cost side", text: "Carrier invoices, truckers, brokers, terminals, and accruals against live shipment execution." },
                { title: "FX", text: "Live or manual exchange rates applied to invoices, vendor bills, and gross-profit analysis." },
                { title: "Alerts", text: "Margin thresholds should trigger notifications when a job drops below target GP percentage." }
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
          <SectionCard title="Roadmap to real finance" subtitle="What will need live integrations">
            <Stack spacing={1.5}>
              {[
                "Stripe or another payment rail for customer invoice settlement.",
                "Exchange-rate provider for live currency conversion and revaluation.",
                "Accounting sync for QuickBooks, Xero, SAP, or Oracle depending on tenant tier.",
                "Background jobs for invoice generation, reminders, statements, and AP batching."
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
