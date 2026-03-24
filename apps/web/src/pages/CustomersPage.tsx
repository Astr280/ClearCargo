import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import { Alert, Box, Button, Chip, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import type { CustomerAccount, InvoiceRecord } from "@shared/index";
import { customers, invoices } from "@shared/index";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
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

export default function CustomersPage() {
  const { session } = useAuth();
  const [data, setData] = useState<CustomerAccount[]>(customers);
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const isCustomerView = session?.user.role === "Customer";

  async function loadCustomerWorkspace() {
    try {
      const [customerResult, invoiceResult] = await Promise.all([
        fetchJson<CustomerAccount[]>("/customers"),
        fetchJson<InvoiceRecord[]>("/finance/invoices")
      ]);

      setData(customerResult);
      setInvoiceRows(invoiceResult);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    void loadCustomerWorkspace();
  }, []);

  const metrics = useMemo(() => {
    const outstanding = invoiceRows.reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);

    if (isCustomerView) {
      return [
        { label: "Your account", value: String(data.length), trend: "Portal scoped to your customer profile" },
        { label: "Open shipments", value: String(data.reduce((sum, customer) => sum + customer.openShipments, 0)), trend: "Jobs visible in your portal" },
        { label: "Open balance", value: formatCurrency(outstanding, "USD"), trend: `${invoiceRows.filter((invoice) => invoice.status !== "Paid").length} invoices awaiting payment` },
        { label: "Trade lanes", value: String(new Set(data.map((customer) => customer.lane)).size), trend: "Lane footprint for your account" }
      ];
    }

    return [
      { label: "Accounts", value: String(data.length), trend: "Active customers across current seed portfolio" },
      { label: "Open shipments", value: String(data.reduce((sum, customer) => sum + customer.openShipments, 0)), trend: "Combined execution load" },
      { label: "Quoted lanes", value: String(new Set(data.map((customer) => customer.lane)).size), trend: "Trade-lane diversity across customers" },
      { label: "Won pipeline", value: String(data.filter((customer) => customer.quoteStage === "Won").length), trend: "Accounts already converted from quote to live work" }
    ];
  }, [data, invoiceRows, isCustomerView]);

  async function handlePortalPayment(invoice: InvoiceRecord) {
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
        eyebrow={isCustomerView ? "Customer portal" : "CRM and customer portal"}
        title={isCustomerView ? "Your shipments, invoices, and portal access" : "Customers, quotes, and self-service visibility"}
        description={
          isCustomerView
            ? "This portal is now scoped to your own account, with shipment visibility, approved documents, and invoice payment access."
            : "Customer master data, commercial pipeline, account health, portal access, shipment visibility, and coordinator communication all belong in one joined-up workspace."
        }
        status={isCustomerView ? "Customer self-service" : "CRM plus portal scope"}
      />

      <MetricGrid items={metrics} />
      {error ? <Alert sx={{ mt: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard
            title={isCustomerView ? "Your account workspace" : "Customer portfolio"}
            subtitle={isCustomerView ? "Portal-scoped account, lane, and shipment context" : "Accounts, trade lanes, and commercial state"}
            action={<GroupsRoundedIcon color="primary" />}
          >
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
                "Sign in with MFA and see only their own shipments, invoices, and approved documents.",
                "Track milestones, estimated delivery, and shipment history without asking operations for updates.",
                "Control invoice settlement through the portal-facing payment action.",
                "Message their freight coordinator in context with shipment and billing events."
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

        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard
            title={isCustomerView ? "Your invoices" : "Portal invoice visibility"}
            subtitle={isCustomerView ? "Customer-visible invoices and payment actions" : "What customers can see and settle online"}
            action={<PaymentsRoundedIcon color="primary" />}
          >
            <Table sx={{ "& td, & th": { borderBottomColor: "rgba(15,79,191,0.08)" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
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
                            {invoice.customerName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={invoice.status} color={statusColor(invoice.status)} variant="outlined" />
                      </TableCell>
                      <TableCell>{new Date(invoice.issuedAt).toLocaleDateString("en-US")}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString("en-US")}</TableCell>
                      <TableCell>{formatCurrency(outstanding, invoice.currency)}</TableCell>
                      <TableCell align="right">
                        {isCustomerView ? (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={outstanding <= 0 || payingInvoiceId === invoice.id}
                            onClick={() => void handlePortalPayment(invoice)}
                          >
                            {payingInvoiceId === invoice.id ? "Processing..." : outstanding <= 0 ? "Paid" : "Pay now"}
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Portal self-service
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title={isCustomerView ? "Portal notes" : "Customer communication"} subtitle="Operational clarity without email sprawl" action={<ChatBubbleOutlineRoundedIcon color="primary" />}>
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
