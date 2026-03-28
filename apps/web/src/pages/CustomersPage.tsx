import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import type { CreateQuoteInput, CustomerAccount, InvoiceRecord, QuoteRecord, QuoteStage, QuoteStatus } from "@shared/index";
import { customers, quotes } from "@shared/index";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import MetricGrid from "../components/MetricGrid";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { fetchJson, fetchText, requestJson } from "../lib/api";

const quoteStages: QuoteStage[] = ["Lead", "Quoted", "Won", "Lost"];

const initialQuoteForm: CreateQuoteInput = {
  customerName: "",
  contactName: "",
  lane: "",
  mode: "Ocean",
  origin: "",
  destination: "",
  incoterm: "FOB",
  owner: "",
  validUntil: "",
  estimatedWeightKg: 0,
  expectedMarginPercent: 15,
  notes: "",
  lineItems: [
    { code: "FRT", description: "Freight", amount: 0 },
    { code: "HDL", description: "Handling", amount: 0 },
    { code: "DOC", description: "Documentation", amount: 0 }
  ]
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}

function getQuoteValue(quote: QuoteRecord) {
  return quote.lineItems.reduce((sum, lineItem) => sum + lineItem.amount, 0);
}

function invoiceStatusColor(status: InvoiceRecord["status"]) {
  if (status === "Paid") {
    return "success";
  }

  if (status === "Partially Paid" || status === "Issued") {
    return "primary";
  }

  return "warning";
}

function quoteStageColor(stage: QuoteStage) {
  if (stage === "Won") {
    return "success";
  }

  if (stage === "Lost") {
    return "default";
  }

  return "primary";
}

function quoteStatusColor(status: QuoteStatus) {
  if (status === "Approved") {
    return "success";
  }

  if (status === "Expired") {
    return "warning";
  }

  if (status === "Sent") {
    return "primary";
  }

  return "default";
}

export default function CustomersPage() {
  const { session } = useAuth();
  const [accountRows, setAccountRows] = useState<CustomerAccount[]>(customers);
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRecord[]>([]);
  const [quoteRows, setQuoteRows] = useState<QuoteRecord[]>(quotes);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState<CreateQuoteInput>(initialQuoteForm);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [savingQuote, setSavingQuote] = useState(false);
  const [changingQuoteId, setChangingQuoteId] = useState<string | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [openingDocumentId, setOpeningDocumentId] = useState<string | null>(null);
  const isCustomerView = session?.user.role === "Customer";

  async function loadCustomerWorkspace() {
    try {
      const accountsPromise = fetchJson<CustomerAccount[]>("/customers");

      if (isCustomerView) {
        const [accounts, portalInvoices] = await Promise.all([
          accountsPromise,
          fetchJson<InvoiceRecord[]>("/finance/invoices")
        ]);

        setAccountRows(accounts);
        setInvoiceRows(portalInvoices);
        setQuoteRows([]);
      } else {
        const [accounts, pipelineQuotes] = await Promise.all([
          accountsPromise,
          fetchJson<QuoteRecord[]>("/crm/quotes")
        ]);

        setAccountRows(accounts);
        setQuoteRows(pipelineQuotes);
        setInvoiceRows([]);
      }

      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    void loadCustomerWorkspace();
  }, [isCustomerView]);

  const metrics = useMemo(() => {
    if (isCustomerView) {
      const outstanding = invoiceRows.reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);

      return [
        { label: "Your account", value: String(accountRows.length), trend: "Portal scoped to your customer profile" },
        {
          label: "Open shipments",
          value: String(accountRows.reduce((sum, customer) => sum + customer.openShipments, 0)),
          trend: "Jobs visible in your portal"
        },
        {
          label: "Open balance",
          value: formatCurrency(outstanding, "USD"),
          trend: `${invoiceRows.filter((invoice) => invoice.status !== "Paid").length} invoices awaiting payment`
        },
        {
          label: "Approved records",
          value: String(invoiceRows.length),
          trend: "Invoice and shipment files released to your portal"
        }
      ];
    }

    const quotedValue = quoteRows
      .filter((quote) => quote.stage === "Quoted" || quote.stage === "Won")
      .reduce((sum, quote) => sum + getQuoteValue(quote), 0);
    const expiringSoon = quoteRows.filter((quote) => {
      const remaining = new Date(quote.validUntil).getTime() - Date.now();
      return remaining >= 0 && remaining <= 1000 * 60 * 60 * 24 * 7 && quote.stage !== "Won" && quote.stage !== "Lost";
    }).length;

    return [
      { label: "Accounts", value: String(accountRows.length), trend: "Shipper and consignee relationships in CRM" },
      {
        label: "Open shipments",
        value: String(accountRows.reduce((sum, customer) => sum + customer.openShipments, 0)),
        trend: "Live operational demand tied back to accounts"
      },
      {
        label: "Quoted value",
        value: formatCurrency(quotedValue, "USD"),
        trend: `${quoteRows.filter((quote) => quote.stage === "Quoted").length} quotes currently in market`
      },
      {
        label: "Expiring soon",
        value: String(expiringSoon),
        trend: "Quotes expiring within the next 7 days"
      }
    ];
  }, [accountRows, invoiceRows, isCustomerView, quoteRows]);

  const pipelineSummary = useMemo(
    () =>
      quoteStages.map((stage) => ({
        stage,
        count: quoteRows.filter((quote) => quote.stage === stage).length,
        value: quoteRows
          .filter((quote) => quote.stage === stage)
          .reduce((sum, quote) => sum + getQuoteValue(quote), 0)
      })),
    [quoteRows]
  );

  const recentActivities = useMemo(
    () =>
      accountRows
        .flatMap((account) =>
          account.activities.map((activity) => ({
            ...activity,
            customerName: account.name
          }))
        )
        .sort((left, right) => right.happenedAt.localeCompare(left.happenedAt))
        .slice(0, 5),
    [accountRows]
  );

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
      setToastMessage(`${updated.invoiceNumber} marked as paid`);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPayingInvoiceId(null);
    }
  }

  async function handleOpenDocument(path: string, documentId: string) {
    setOpeningDocumentId(documentId);

    try {
      const html = await fetchText(path);
      const popup = window.open("", "_blank", "noopener,noreferrer");

      if (!popup) {
        throw new Error("Unable to open document window.");
      }

      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setOpeningDocumentId(null);
    }
  }

  async function handleQuoteStageChange(quoteId: string, stage: QuoteStage) {
    setChangingQuoteId(quoteId);

    try {
      const updated = await requestJson<QuoteRecord>(`/crm/quotes/${quoteId}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage })
      });

      setQuoteRows((current) => current.map((quote) => (quote.id === updated.id ? updated : quote)));
      setToastMessage(`${updated.quoteNumber} moved to ${updated.stage}`);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setChangingQuoteId(null);
    }
  }

  async function handleConvertQuote(quoteId: string) {
    setChangingQuoteId(quoteId);

    try {
      const createdShipment = await requestJson<{ id: string; jobNumber: string }>(`/crm/quotes/${quoteId}/convert`, {
        method: "POST"
      });
      const refreshedQuotes = await fetchJson<QuoteRecord[]>("/crm/quotes");

      setQuoteRows(refreshedQuotes);
      setToastMessage(`Created shipment ${createdShipment.jobNumber} from quote`);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setChangingQuoteId(null);
    }
  }

  async function handleCreateQuote() {
    setSavingQuote(true);

    try {
      const created = await requestJson<QuoteRecord>("/crm/quotes", {
        method: "POST",
        body: JSON.stringify({
          ...quoteForm,
          validUntil: new Date(`${quoteForm.validUntil}T00:00:00.000Z`).toISOString()
        })
      });

      setQuoteRows((current) => [created, ...current]);
      setQuoteDialogOpen(false);
      setQuoteForm(initialQuoteForm);
      setToastMessage(`Created quote ${created.quoteNumber}`);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingQuote(false);
    }
  }

  function updateLineItem(index: number, key: "code" | "description" | "amount", value: string | number) {
    setQuoteForm((current) => ({
      ...current,
      lineItems: current.lineItems.map((lineItem, lineIndex) =>
        lineIndex === index ? { ...lineItem, [key]: key === "amount" ? Number(value) : value } : lineItem
      )
    }));
  }

  return (
    <>
      <PageHeader
        eyebrow={isCustomerView ? "Customer portal" : "CRM and quotation"}
        title={
          isCustomerView ? "Your shipments, invoices, and account access" : "Accounts, quotes, and customer-facing workflow control"
        }
        description={
          isCustomerView
            ? "This portal is scoped to your own account so you can track open work, review billing, and settle invoices without emailing operations."
            : "The CRM workspace now covers customer contacts, preferred carriers, sales activity, quote validity, pipeline stages, and one-click quote conversion into shipment jobs."
        }
        actions={
          isCustomerView ? undefined : (
            <Button variant="contained" startIcon={<AddCircleOutlineRoundedIcon />} onClick={() => setQuoteDialogOpen(true)}>
              New quote
            </Button>
          )
        }
        status={isCustomerView ? "Customer self-service" : "CRM plus quote conversion"}
      />

      <MetricGrid items={metrics} />
      {error ? <Alert sx={{ mt: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: isCustomerView ? 7 : 8 }}>
          <SectionCard
            title={isCustomerView ? "Your account workspace" : "Customer portfolio"}
            subtitle={isCustomerView ? "Portal-scoped account context" : "Trade lanes, contacts, and preferred carrier profiles"}
            action={<GroupsRoundedIcon color="primary" />}
          >
            <Stack spacing={1.5}>
              {accountRows.map((account) => (
                <Box
                  key={account.name}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid rgba(15,79,191,0.1)",
                    backgroundColor: "rgba(248,251,255,0.9)"
                  }}
                >
                  <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between">
                    <Box>
                      <Typography fontWeight={700}>{account.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {account.lane} with {account.creditTerms} credit terms
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.25 }}>
                        <Chip size="small" label={`Quote: ${account.quoteStage}`} variant="outlined" />
                        <Chip size="small" label={`${account.openShipments} open shipments`} />
                      </Stack>
                    </Box>

                    <Stack spacing={1} sx={{ minWidth: { xs: "100%", lg: 320 } }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Key contacts
                      </Typography>
                      {account.contacts.map((contact) => (
                        <Box key={contact.email} sx={{ borderLeft: "3px solid rgba(15,79,191,0.18)", pl: 1.25 }}>
                          <Typography variant="body2" fontWeight={700}>
                            {contact.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {contact.role} | {contact.email}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>

                  {!isCustomerView ? (
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.75 }}>
                      {account.preferredCarriers.map((carrier) => (
                        <Chip key={carrier} size="small" label={carrier} sx={{ bgcolor: "rgba(15,79,191,0.06)" }} />
                      ))}
                    </Stack>
                  ) : null}
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: isCustomerView ? 5 : 4 }}>
          <SectionCard
            title={isCustomerView ? "Portal capabilities" : "Pipeline posture"}
            subtitle={isCustomerView ? "What is enabled in your customer-facing workspace" : "Commercial state across the active quote book"}
            action={isCustomerView ? <TravelExploreRoundedIcon color="primary" /> : <TimelineRoundedIcon color="primary" />}
          >
            <Stack spacing={1.2}>
              {isCustomerView
                ? [
                    "Track only your own shipment milestones and approved documents.",
                    "Review invoice due dates and settle outstanding balances directly in the portal.",
                    "Use the same workspace for account visibility without asking operations for exports."
                  ].map((item) => (
                    <Box key={item} sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(22,164,201,0.05)" }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))
                : pipelineSummary.map((item) => (
                    <Box key={item.stage} sx={{ p: 1.5, borderRadius: 3, border: "1px solid rgba(15,79,191,0.1)" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip label={item.stage} color={quoteStageColor(item.stage)} size="small" variant="outlined" />
                        <Typography fontWeight={700}>{item.count}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {formatCurrency(item.value, "USD")} in pipeline value
                      </Typography>
                    </Box>
                  ))}
            </Stack>
          </SectionCard>
        </Grid>

        {!isCustomerView ? (
          <>
            <Grid size={{ xs: 12, lg: 8 }}>
              <SectionCard title="Quote register" subtitle="Validity, stage management, and one-click conversion into shipment jobs" action={<Inventory2OutlinedIcon color="primary" />}>
                <Table sx={{ "& td, & th": { borderBottomColor: "rgba(15,79,191,0.08)" } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Quote</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Stage</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Valid until</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quoteRows.map((quote) => (
                      <TableRow key={quote.id} hover>
                        <TableCell>
                          <Stack spacing={0.35}>
                            <Typography fontWeight={700}>{quote.quoteNumber}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {quote.origin} to {quote.destination}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.35}>
                            <Typography fontWeight={700}>{quote.customerName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {quote.contactName}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={quote.stage}
                            disabled={changingQuoteId === quote.id}
                            onChange={(event) => void handleQuoteStageChange(quote.id, event.target.value as QuoteStage)}
                          >
                            {quoteStages.map((stage) => (
                              <MenuItem key={stage} value={stage}>
                                {stage}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={quote.status} color={quoteStatusColor(quote.status)} variant="outlined" />
                        </TableCell>
                        <TableCell>{new Date(quote.validUntil).toLocaleDateString("en-US")}</TableCell>
                        <TableCell>{formatCurrency(getQuoteValue(quote), "USD")}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<OpenInNewRoundedIcon />}
                              disabled={openingDocumentId === quote.id}
                              onClick={() => void handleOpenDocument(`/crm/quotes/${quote.id}/document`, quote.id)}
                            >
                              {openingDocumentId === quote.id ? "Opening..." : "Preview"}
                            </Button>
                            {quote.convertedShipmentId ? (
                              <IconButton component={Link} to={`/shipments/${quote.convertedShipmentId}`} sx={{ border: "1px solid rgba(15,79,191,0.08)" }}>
                                <LaunchRoundedIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              <Button
                                size="small"
                                variant="contained"
                                disabled={changingQuoteId === quote.id || quote.stage === "Lost"}
                                onClick={() => void handleConvertQuote(quote.id)}
                              >
                                {changingQuoteId === quote.id ? "Converting..." : "Convert to job"}
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <SectionCard title="Sales activity log" subtitle="Recent customer touches captured against accounts" action={<ChatBubbleOutlineRoundedIcon color="primary" />}>
                <Stack spacing={1.4}>
                  {recentActivities.map((activity) => (
                    <Box key={activity.id} sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(15,79,191,0.04)" }}>
                      <Typography fontWeight={700}>{activity.subject}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                        {activity.customerName} | {activity.type} | {activity.owner}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(activity.happenedAt).toLocaleString("en-US")}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </SectionCard>
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 12, md: 7 }}>
              <SectionCard title="Your invoices" subtitle="Customer-visible invoices and payment actions" action={<PaymentsRoundedIcon color="primary" />}>
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
                            <Chip size="small" label={invoice.status} color={invoiceStatusColor(invoice.status)} variant="outlined" />
                          </TableCell>
                          <TableCell>{new Date(invoice.issuedAt).toLocaleDateString("en-US")}</TableCell>
                          <TableCell>{new Date(invoice.dueDate).toLocaleDateString("en-US")}</TableCell>
                          <TableCell>{formatCurrency(outstanding, invoice.currency)}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="text"
                                startIcon={<OpenInNewRoundedIcon />}
                                disabled={openingDocumentId === invoice.id}
                                onClick={() => void handleOpenDocument(`/finance/invoices/${invoice.id}/document`, invoice.id)}
                              >
                                {openingDocumentId === invoice.id ? "Opening..." : "View doc"}
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                disabled={outstanding <= 0 || payingInvoiceId === invoice.id}
                                onClick={() => void handlePortalPayment(invoice)}
                              >
                                {payingInvoiceId === invoice.id ? "Processing..." : outstanding <= 0 ? "Paid" : "Pay now"}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <SectionCard title="Portal notes" subtitle="What this version of the portal is designed to do" action={<ChatBubbleOutlineRoundedIcon color="primary" />}>
                <Stack spacing={1.5}>
                  {[
                    "Only approved and customer-visible records should be exposed in the portal.",
                    "Every shipment, invoice, and note should remain linked back to the responsible account and owner.",
                    "Portal billing actions should reduce manual collections follow-up for routine invoices."
                  ].map((item) => (
                    <Typography key={item} variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </SectionCard>
            </Grid>
          </>
        )}
      </Grid>

      <Dialog open={quoteDialogOpen} onClose={() => setQuoteDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Create quote</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Customer"
                  value={quoteForm.customerName}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, customerName: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Contact"
                  value={quoteForm.contactName}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, contactName: event.target.value }))}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Lane"
                  value={quoteForm.lane}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, lane: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Origin"
                  value={quoteForm.origin}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, origin: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Destination"
                  value={quoteForm.destination}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, destination: event.target.value }))}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Mode"
                  value={quoteForm.mode}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, mode: event.target.value as CreateQuoteInput["mode"] }))}
                  fullWidth
                >
                  {["Ocean", "Air", "Road", "Rail", "Multimodal"].map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Incoterm"
                  value={quoteForm.incoterm}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, incoterm: event.target.value.toUpperCase() }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Owner"
                  value={quoteForm.owner}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, owner: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  type="date"
                  label="Valid until"
                  value={quoteForm.validUntil}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, validUntil: event.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  label="Estimated weight (kg)"
                  value={quoteForm.estimatedWeightKg}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, estimatedWeightKg: Number(event.target.value) }))}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  label="Expected margin %"
                  value={quoteForm.expectedMarginPercent}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, expectedMarginPercent: Number(event.target.value) }))}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Stack spacing={1.25}>
              <Typography fontWeight={700}>Quote line items</Typography>
              {quoteForm.lineItems.map((lineItem, index) => (
                <Grid key={`${lineItem.code}-${index}`} container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                      label="Code"
                      value={lineItem.code}
                      onChange={(event) => updateLineItem(index, "code", event.target.value.toUpperCase())}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <TextField
                      label="Description"
                      value={lineItem.description}
                      onChange={(event) => updateLineItem(index, "description", event.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      type="number"
                      label="Amount"
                      value={lineItem.amount}
                      onChange={(event) => updateLineItem(index, "amount", event.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              ))}
            </Stack>

            <TextField
              label="Notes"
              multiline
              minRows={3}
              value={quoteForm.notes}
              onChange={(event) => setQuoteForm((current) => ({ ...current, notes: event.target.value }))}
              fullWidth
            />

            <Typography variant="body2" color="text.secondary">
              Total quote value: {formatCurrency(quoteForm.lineItems.reduce((sum, lineItem) => sum + Number(lineItem.amount || 0), 0), "USD")}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setQuoteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={savingQuote} onClick={() => void handleCreateQuote()}>
            {savingQuote ? "Saving..." : "Create quote"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toastMessage)} autoHideDuration={2600} message={toastMessage} onClose={() => setToastMessage("")} />
    </>
  );
}
