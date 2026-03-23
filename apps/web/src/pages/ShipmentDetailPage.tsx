import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import NoteAltRoundedIcon from "@mui/icons-material/NoteAltRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import type {
  CreateShipmentDocumentInput,
  ShipmentDetail,
  ShipmentDocument,
  ShipmentDocumentType
} from "@shared/index";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MetricGrid from "../components/MetricGrid";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { fetchJson, requestJson } from "../lib/api";

const documentTypes: ShipmentDocumentType[] = [
  "Commercial Invoice",
  "Packing List",
  "Air Waybill",
  "House Bill",
  "Customs Entry",
  "Delivery Order"
];

const initialDocumentForm: CreateShipmentDocumentInput = {
  type: "Commercial Invoice",
  fileName: "",
  source: "Generated",
  uploadedBy: "Astr280"
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<ShipmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documentForm, setDocumentForm] = useState<CreateShipmentDocumentInput>(initialDocumentForm);

  async function loadDetail() {
    if (!id) {
      setError("Shipment not found.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const result = await fetchJson<ShipmentDetail>(`/shipments/${id}/detail`);
      setData(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDetail();
  }, [id]);

  const metricItems = useMemo(() => {
    if (!data) {
      return [];
    }

    const revenue = data.costLines.reduce((sum, line) => sum + line.sellAmount, 0);
    const cost = data.costLines.reduce((sum, line) => sum + line.costAmount, 0);
    const documentCount = data.documents.length;
    const approvedCount = data.documents.filter((document) => document.status === "Approved" || document.status === "Signed").length;

    return [
      { label: "Revenue plan", value: `$${revenue.toLocaleString()}`, trend: "Projected sell total on the job" },
      { label: "Direct cost", value: `$${cost.toLocaleString()}`, trend: "Carrier, handling, and customs cost base" },
      { label: "Documents", value: String(documentCount), trend: `${approvedCount} customer-ready or signed` },
      { label: "Gross profit", value: `${data.shipment.marginPercent}%`, trend: `Operator owner: ${data.shipment.owner}` }
    ];
  }, [data]);

  async function handleAddDocument() {
    if (!id) {
      return;
    }

    setSaving(true);

    try {
      const document = await requestJson<ShipmentDocument>(`/shipments/${id}/documents`, {
        method: "POST",
        body: JSON.stringify(documentForm)
      });

      setData((current) =>
        current
          ? {
              ...current,
              documents: [document, ...current.documents]
            }
          : current
      );
      setDialogOpen(false);
      setDocumentForm(initialDocumentForm);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return <Typography color="text.secondary">Loading shipment workspace...</Typography>;
  }

  if (error && !data) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data) {
    return <Alert severity="warning">Shipment not found.</Alert>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Shipment detail"
        title={`${data.shipment.jobNumber} operational workbook`}
        description={`${data.shipment.customer} moving ${data.shipment.mode.toLowerCase()} freight from ${data.shipment.origin} to ${data.shipment.destination} with ${data.shipment.incoterm} commercial terms.`}
        status={data.shipment.stage}
        actions={
          <Stack direction="row" spacing={1}>
            <Button component={Link} to="/shipments" startIcon={<ArrowBackRoundedIcon />} variant="outlined">
              Back to register
            </Button>
            <Button startIcon={<UploadFileRoundedIcon />} variant="contained" onClick={() => setDialogOpen(true)}>
              Add document
            </Button>
          </Stack>
        }
      />

      {error ? <Alert sx={{ mb: 2 }}>{error}</Alert> : null}

      <MetricGrid items={metricItems} />

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard
            title="Execution timeline"
            subtitle="Milestones, attribution, and current movement status"
            action={<TimelineRoundedIcon color="primary" />}
          >
            <Stack spacing={1.5}>
              {data.milestones.map((milestone) => (
                <Box
                  key={milestone.label}
                  sx={{
                    p: 2,
                    borderRadius: 5,
                    border: "1px solid rgba(15,79,191,0.08)",
                    background:
                      milestone.status === "Current"
                        ? "linear-gradient(135deg, rgba(22,164,201,0.12), rgba(15,79,191,0.08))"
                        : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,249,255,0.92))"
                  }}
                >
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography fontWeight={700}>{milestone.label}</Typography>
                        <Chip size="small" label={milestone.status} color={milestone.status === "Current" ? "primary" : "default"} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Updated by {milestone.owner}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatTimestamp(milestone.timestamp)}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Job signals" subtitle="Flags and operational context" action={<NoteAltRoundedIcon color="primary" />}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
              {data.flags.map((flag) => (
                <Chip key={flag} label={flag} sx={{ bgcolor: "rgba(15,79,191,0.06)" }} />
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1.5}>
              {[
                { label: "Customer", value: data.shipment.customer },
                { label: "Owner", value: data.shipment.owner },
                { label: "Weight", value: `${data.shipment.weightKg.toLocaleString()} kg` },
                { label: "Container ref", value: data.shipment.containerRef ?? "Pending allocation" }
              ].map((item) => (
                <Stack key={item.label} direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {item.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Document packet" subtitle="Generated and uploaded job documents" action={<DescriptionRoundedIcon color="primary" />}>
            <Table sx={{ "& td, & th": { borderBottomColor: "rgba(15,79,191,0.08)" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>File</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.documents.map((document) => (
                  <TableRow key={document.id} hover>
                    <TableCell>{document.type}</TableCell>
                    <TableCell>{document.fileName}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={document.status}
                        color={
                          document.status === "Approved" || document.status === "Signed"
                            ? "success"
                            : document.status === "Ready"
                              ? "primary"
                              : "warning"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{document.source}</TableCell>
                    <TableCell>{formatTimestamp(document.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Notes" subtitle="Internal and customer-facing commentary">
            <Stack spacing={2}>
              <Box>
                <Typography variant="overline" color="primary.main">
                  Internal notes
                </Typography>
                <Stack spacing={1}>
                  {data.internalNotes.map((note) => (
                    <Box key={note} sx={{ p: 1.5, borderRadius: 4, bgcolor: "rgba(15,79,191,0.04)" }}>
                      <Typography variant="body2">{note}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
              <Box>
                <Typography variant="overline" color="secondary.main">
                  External notes
                </Typography>
                <Stack spacing={1}>
                  {data.externalNotes.map((note) => (
                    <Box key={note} sx={{ p: 1.5, borderRadius: 4, bgcolor: "rgba(22,164,201,0.05)" }}>
                      <Typography variant="body2">{note}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={12}>
          <SectionCard title="Commercial breakdown" subtitle="Initial charge model tied to the shipment">
            <Table sx={{ "& td, & th": { borderBottomColor: "rgba(15,79,191,0.08)" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Sell</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Currency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.costLines.map((line) => (
                  <TableRow key={line.code}>
                    <TableCell>{line.code}</TableCell>
                    <TableCell>{line.description}</TableCell>
                    <TableCell>${line.sellAmount.toLocaleString()}</TableCell>
                    <TableCell>${line.costAmount.toLocaleString()}</TableCell>
                    <TableCell>{line.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 6 } }}
      >
        <DialogTitle>Add shipment document</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="document-type-label">Document type</InputLabel>
              <Select
                labelId="document-type-label"
                label="Document type"
                value={documentForm.type}
                onChange={(event) =>
                  setDocumentForm((current) => ({
                    ...current,
                    type: event.target.value as ShipmentDocumentType
                  }))
                }
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="File name"
              value={documentForm.fileName}
              onChange={(event) => setDocumentForm((current) => ({ ...current, fileName: event.target.value }))}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="document-source-label">Source</InputLabel>
                  <Select
                    labelId="document-source-label"
                    label="Source"
                    value={documentForm.source}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        source: event.target.value as CreateShipmentDocumentInput["source"]
                      }))
                    }
                  >
                    <MenuItem value="Generated">Generated</MenuItem>
                    <MenuItem value="Uploaded">Uploaded</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Uploaded by"
                  value={documentForm.uploadedBy}
                  onChange={(event) => setDocumentForm((current) => ({ ...current, uploadedBy: event.target.value }))}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleAddDocument()} disabled={saving || !documentForm.fileName.trim()}>
            {saving ? "Saving..." : "Add document"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
