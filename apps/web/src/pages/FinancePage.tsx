import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import {
  Alert,
  Box,
  Button,
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
import type { FinanceSummary, InvoiceRecord } from "@shared/index";
import { financeSummary, invoices } from "@shared/index";
import { useEffect, useMemo, useState } from "react";
import MetricGrid from "../components/MetricGrid";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { fetchJson, requestJson } from "../lib/api";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}

function statusColor(status: InvoiceRecord["status"]) {
  if (status === "Paid") {
    return "success";
  }

  if (status === "Partially Paid" || status === "Issued") {
    return "primary";
  }

  return "warning";
}

export default function FinancePage() {
  const [summary, setSummary] = useState<FinanceSummary>(financeSummary);
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRecord[]>(invoices);
  const [error, setError] = useState<string | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  async function loadFinance() {
    try {
      const [summaryResult, invoiceResult] = await Promise.all([
        fetchJson<FinanceSummary>("/finance/summary"),
        fetchJson<InvoiceRecord[]>("/finance/invoices")
      ]);

      setSummary(summaryResult);
      setInvoiceRows(invoiceResult);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    void loadFinance();
  }, []);

  const marginRows = summary.marginAlerts.map((item) => ({
    jobNumber: item.jobNumber,
    issue: item.message,
    action: "Review sell versus cost and notify job owner"
  }));

  const outstandingTotal = useMemo(
    () => invoiceRows.reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0),
    [invoiceRows]
  );

  async function handleRecordPayment(invoice: InvoiceRecord) {
    const outstanding = invoice.totalAmount - invoice.paidAmount;

    if (outstanding <= 0) {
      return;
    }

    setPayingInvoiceId(invoice.id);

    try {
      const updated = await requestJson<InvoiceRecord>(`/finance/invoices/${invoice.id}/payments`, {
        method: "POST",
        body: JSON.stringify({ amount: outstanding })
      });

      setInvoiceRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      await loadFinance();
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPayingInvoiceId(null);
    }
  }

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
      <MetricGrid items={summary.receivables} />

      <Typography variant="h6" sx={{ mt: 3, mb: 1.5 }}>
        Payables
      </Typography>
      <MetricGrid items={summary.payables} />

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Invoice register" subtitle={`Outstanding balance ${formatCurrency(outstandingTotal, "USD")}`} action={<ReceiptLongRoundedIcon color="primary" />}>
            <Table sx={{ "& td, & th": { borderBottomColor: "rgba(15,79,191,0.08)" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Issued</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell>Outstanding</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceRows.map((invoice) => {
                  const outstanding = invoice.totalAmount - invoice.paidAmount;

                  return (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        <Stack spacing={0.3}>
                          <Typography fontWeight={700}>{invoice.invoiceNumber}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Shipment {invoice.shipmentId}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>
                        <Chip size="small" label={invoice.status} color={statusColor(invoice.status)} variant="outlined" />
                      </TableCell>
                      <TableCell>{new Date(invoice.issuedAt).toLocaleDateString("en-US")}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString("en-US")}</TableCell>
                      <TableCell>{formatCurrency(outstanding, invoice.currency)}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={outstanding <= 0 || payingInvoiceId === invoice.id}
                          onClick={() => void handleRecordPayment(invoice)}
                        >
                          {payingInvoiceId === invoice.id ? "Recording..." : outstanding <= 0 ? "Settled" : "Record payment"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
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

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Charge architecture" subtitle="How the billing engine should think">
            <Grid container spacing={1.5}>
              {[
                { title: "Sell side", text: "Freight, customs, handling, destination, THC, documentation, and surcharges by currency and tax posture." },
                { title: "Cost side", text: "Carrier invoices, truckers, brokers, terminals, and accruals against live shipment execution." },
                { title: "FX", text: "Live or manual exchange rates applied to invoices, vendor bills, and gross-profit analysis." },
                { title: "Collections", text: "Customer balances and payment status should stay visible from both finance and portal views." }
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
      </Grid>
    </>
  );
}
