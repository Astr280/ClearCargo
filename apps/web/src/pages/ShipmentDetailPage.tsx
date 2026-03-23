import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import NoteAltRoundedIcon from "@mui/icons-material/NoteAltRounded";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
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
  CreateShipmentDocumentVersionInput,
  ShipmentDetail,
  ShipmentDocument,
  ShipmentDocumentType
} from "@shared/index";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { canManageShipmentDocuments } from "../auth/access";
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

const initialVersionForm: CreateShipmentDocumentVersionInput = {
  fileName: "",
  notes: ""
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function statusColor(status: ShipmentDocument["status"]) {
  if (status === "Approved" || status === "Signed") {
    return "success";
  }

  if (status === "Ready") {
    return "primary";
  }

  return "warning";
}

export default function ShipmentDetailPage() {
  const { session } = useAuth();
  const { id } = useParams();
  const [data, setData] = useState<ShipmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documentForm, setDocumentForm] = useState<CreateShipmentDocumentInput>(initialDocumentForm);
  const [versionForm, setVersionForm] = useState<CreateShipmentDocumentVersionInput>(initialVersionForm);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const canEditDocuments = session ? canManageShipmentDocuments(session.user.role) : false;
  const isCustomerView = session?.user.role === "Customer";

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
      setSelectedDocumentId((current) => current ?? result.documents[0]?.id ?? null);
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

  const selectedDocument = useMemo(
    () => data?.documents.find((document) => document.id === selectedDocumentId) ?? data?.documents[0] ?? null,
    [data, selectedDocumentId]
  );

  const metricItems = useMemo(() => {
    if (!data) {
      return [];
    }

    const revenue = data.costLines.reduce((sum, line) => sum + line.sellAmount, 0);
    const cost = data.costLines.reduce((sum, line) => sum + line.costAmount, 0);
    const documentCount = data.documents.length;
    const approvedCount = data.documents.filter((document) => document.status === "Approved" || document.status === "Signed").length;
    const visibleCount = data.documents.filter((document) => document.visibleToCustomer).length;

    return [
      { label: "Revenue plan", value: data.costLines.length ? `$${revenue.toLocaleString()}` : "Hidden", trend: "Projected sell total on the job" },
      { label: "Direct cost", value: data.costLines.length ? `$${cost.toLocaleString()}` : "Hidden", trend: "Carrier, handling, and customs cost base" },
      { label: "Documents", value: String(documentCount), trend: `${approvedCount} approved or signed` },
      {
        label: isCustomerView ? "Portal packet" : "Customer visible",
        value: String(visibleCount),
        trend: isCustomerView ? "Approved documents available to you" : "Documents exposed to the customer portal"
      }
    ];
  }, [data, isCustomerView]);

  function replaceDocument(updated: ShipmentDocument) {
    setData((current) =>
      current
        ? {
            ...current,
            documents: current.documents
              .map((document) => (document.id === updated.id ? updated : document))
              .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
          }
        : current
    );
    setSelectedDocumentId(updated.id);
  }

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
      setSelectedDocumentId(document.id);
      setDocumentDialogOpen(false);
      setDocumentForm(initialDocumentForm);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateDocument(documentId: string, payload: { status?: ShipmentDocument["status"]; visibleToCustomer?: boolean }) {
    if (!id) {
      return;
    }

    try {
      const updated = await requestJson<ShipmentDocument>(`/shipments/${id}/documents/${documentId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });

      replaceDocument(updated);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleAddVersion() {
    if (!id || !selectedDocument) {
      return;
    }

    setSaving(true);

    try {
      const updated = await requestJson<ShipmentDocument>(`/shipments/${id}/documents/${selectedDocument.id}/versions`, {
        method: "POST",
        body: JSON.stringify(versionForm)
      });

      replaceDocument(updated);
      setVersionDialogOpen(false);
      setVersionForm(initialVersionForm);
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
        eyebrow={isCustomerView ? "Customer shipment view" : "Shipment detail"}
        title={`${data.shipment.jobNumber} operational workbook`}
        description={`${data.shipment.customer} moving ${data.shipment.mode.toLowerCase()} freight from ${data.shipment.origin} to ${data.shipment.destination} with ${data.shipment.incoterm} commercial terms.`}
        status={data.shipment.stage}
        actions={
          <Stack direction="row" spacing={1}>
            <Button component={Link} to="/shipments" startIcon={<ArrowBackRoundedIcon />} variant="outlined">
              Back to register
            </Button>
            {canEditDocuments ? (
              <Button startIcon={<UploadFileRoundedIcon />} variant="contained" onClick={() => setDocumentDialogOpen(true)}>
                Add document
              </Button>
            ) : null}
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
          <SectionCard
            title={isCustomerView ? "Portal document packet" : "Document packet"}
            subtitle={isCustomerView ? "Approved documents available to the customer portal" : "Generated and uploaded job documents"}
            action={<DescriptionRoundedIcon color="primary" />}
          >
            <Table sx={{ "& td, & th": { borderBottomColor: "rgba(15,79,191,0.08)" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>File</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Portal</TableCell>
                  <TableCell>Updated</TableCell>
                  {!isCustomerView ? <TableCell align="right">Actions</TableCell> : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.documents.map((document) => (
                  <TableRow
                    key={document.id}
                    hover
                    selected={selectedDocument?.id === document.id}
                    onClick={() => setSelectedDocumentId(document.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{document.type}</TableCell>
                    <TableCell>{document.fileName}</TableCell>
                    <TableCell>
                      <Chip size="small" label={document.status} color={statusColor(document.status)} variant="outlined" />
                    </TableCell>
                    <TableCell>v{document.currentVersion}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={document.visibleToCustomer ? "Visible" : "Internal"}
                        color={document.visibleToCustomer ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatTimestamp(document.updatedAt)}</TableCell>
                    {!isCustomerView ? (
                      <TableCell align="right">
                        {canEditDocuments ? (
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            {document.status !== "Approved" ? (
                              <Button size="small" variant="outlined" onClick={() => void handleUpdateDocument(document.id, { status: "Approved" })}>
                                Approve
                              </Button>
                            ) : null}
                            {document.status === "Approved" ? (
                              <Button size="small" variant="outlined" onClick={() => void handleUpdateDocument(document.id, { status: "Signed" })}>
                                Sign off
                              </Button>
                            ) : null}
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => void handleUpdateDocument(document.id, { visibleToCustomer: !document.visibleToCustomer })}
                            >
                              {document.visibleToCustomer ? "Hide" : "Share"}
                            </Button>
                          </Stack>
                        ) : null}
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard
            title={selectedDocument ? `${selectedDocument.type} history` : "Version history"}
            subtitle="Current versioning and release posture"
            action={<HistoryRoundedIcon color="primary" />}
          >
            {selectedDocument ? (
              <Stack spacing={1.4}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip label={`Current v${selectedDocument.currentVersion}`} variant="outlined" />
                  <Chip label={selectedDocument.source} variant="outlined" />
                  <Chip
                    icon={<VisibilityRoundedIcon />}
                    label={selectedDocument.visibleToCustomer ? "Customer visible" : "Internal only"}
                    color={selectedDocument.visibleToCustomer ? "success" : "default"}
                    variant="outlined"
                  />
                </Stack>
                {canEditDocuments && !isCustomerView ? (
                  <Button startIcon={<PublishRoundedIcon />} variant="contained" onClick={() => setVersionDialogOpen(true)}>
                    Upload new version
                  </Button>
                ) : null}
                {selectedDocument.versions.map((version) => (
                  <Box
                    key={version.version}
                    sx={{
                      p: 1.75,
                      borderRadius: 4,
                      border: "1px solid rgba(15,79,191,0.08)",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(245,249,255,0.88))"
                    }}
                  >
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Chip size="small" label={`v${version.version}`} sx={{ bgcolor: "rgba(15,79,191,0.06)" }} />
                          <Typography fontWeight={700}>{version.fileName}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {version.uploadedBy}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatTimestamp(version.updatedAt)}
                      </Typography>
                    </Stack>
                    {version.notes ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.7 }}>
                        {version.notes}
                      </Typography>
                    ) : null}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">Select a document to inspect its version history.</Typography>
            )}
          </SectionCard>
        </Grid>

        {!isCustomerView ? (
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
        ) : (
          <Grid size={{ xs: 12, lg: 5 }}>
            <SectionCard title="Portal notes" subtitle="Updates visible to the customer">
              <Stack spacing={1}>
                {data.externalNotes.map((note) => (
                  <Box key={note} sx={{ p: 1.5, borderRadius: 4, bgcolor: "rgba(22,164,201,0.05)" }}>
                    <Typography variant="body2">{note}</Typography>
                  </Box>
                ))}
              </Stack>
            </SectionCard>
          </Grid>
        )}

        {!isCustomerView && data.costLines.length ? (
          <Grid size={{ xs: 12, lg: 7 }}>
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
        ) : null}

        {!isCustomerView ? (
          <Grid size={{ xs: 12, md: 12 }}>
            <SectionCard title="Document control checklist" subtitle="What this workflow now supports" action={<TaskAltRoundedIcon color="primary" />}>
              <Grid container spacing={1.5}>
                {[
                  "Approval state on every shipment document from draft to signed release.",
                  "Customer-visibility control so only approved documents reach the portal.",
                  "Version history per file with uploader, timestamp, and change notes.",
                  "New version upload resets a document to internal review until re-approved."
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
        ) : null}
      </Grid>

      <Dialog
        open={documentDialogOpen}
        onClose={() => setDocumentDialogOpen(false)}
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
          <Button onClick={() => setDocumentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleAddDocument()} disabled={saving || !documentForm.fileName.trim()}>
            {saving ? "Saving..." : "Add document"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={versionDialogOpen}
        onClose={() => setVersionDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 6 } }}
      >
        <DialogTitle>Upload new document version</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.2} sx={{ mt: 1 }}>
            <TextField
              label="New file name"
              value={versionForm.fileName}
              onChange={(event) => setVersionForm((current) => ({ ...current, fileName: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Change notes"
              value={versionForm.notes}
              onChange={(event) => setVersionForm((current) => ({ ...current, notes: event.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setVersionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleAddVersion()} disabled={saving || !versionForm.fileName.trim()}>
            {saving ? "Saving..." : "Upload version"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
