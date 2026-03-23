import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
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
import type { CreateShipmentInput, Shipment, ShipmentStage, UpdateShipmentInput } from "@shared/index";
import { shipments } from "@shared/index";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { fetchJson, requestJson } from "../lib/api";

const shipmentStages: ShipmentStage[] = ["Booking", "Confirmed", "In Transit", "Customs", "Delivered", "Closed"];

const initialForm: CreateShipmentInput = {
  customer: "",
  mode: "Ocean",
  origin: "",
  destination: "",
  incoterm: "FOB",
  owner: "",
  weightKg: 0,
  marginPercent: 15
};

export default function ShipmentsPage() {
  const [data, setData] = useState<Shipment[]>(shipments);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateShipmentInput>(initialForm);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  async function loadShipments() {
    try {
      const result = await fetchJson<Shipment[]>("/shipments");
      setData(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    void loadShipments();
  }, []);

  const stageCounts = useMemo(
    () =>
      shipmentStages.map((stage) => ({
        stage,
        count: data.filter((shipment) => shipment.stage === stage).length
      })),
    [data]
  );

  const modeCounts = useMemo(
    () =>
      ["Ocean", "Air", "Road", "Rail", "Multimodal"].map((mode) => ({
        mode,
        count: data.filter((shipment) => shipment.mode === mode).length
      })),
    [data]
  );

  async function handleCreateShipment() {
    setSaving(true);

    try {
      const created = await requestJson<Shipment>("/shipments", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setData((current) => [created, ...current]);
      setDialogOpen(false);
      setForm(initialForm);
      setToastMessage(`Created shipment ${created.jobNumber}`);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateShipment() {
    if (!editingShipment) {
      return;
    }

    setSaving(true);

    try {
      const payload: UpdateShipmentInput = {
        ...form,
        stage: editingShipment.stage,
        containerRef: editingShipment.containerRef
      };

      const updated = await requestJson<Shipment>(`/shipments/${editingShipment.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      setData((current) => current.map((shipment) => (shipment.id === updated.id ? updated : shipment)));
      setDialogOpen(false);
      setEditingShipment(null);
      setForm(initialForm);
      setToastMessage(`Saved ${updated.jobNumber}`);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStageChange(id: string, stage: ShipmentStage) {
    try {
      const updated = await requestJson<Shipment>(`/shipments/${id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage })
      });

      setData((current) => current.map((shipment) => (shipment.id === id ? updated : shipment)));
      setToastMessage(`Updated ${updated.jobNumber} to ${updated.stage}`);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDeleteShipment(id: string) {
    try {
      const deleted = await requestJson<Shipment>(`/shipments/${id}`, {
        method: "DELETE"
      });

      setData((current) => current.filter((shipment) => shipment.id !== deleted.id));
      setToastMessage(`Deleted ${deleted.jobNumber}`);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function openCreateDialog() {
    setEditingShipment(null);
    setForm(initialForm);
    setDialogOpen(true);
  }

  function openEditDialog(shipment: Shipment) {
    setEditingShipment(shipment);
    setForm({
      customer: shipment.customer,
      mode: shipment.mode,
      origin: shipment.origin,
      destination: shipment.destination,
      incoterm: shipment.incoterm,
      owner: shipment.owner,
      weightKg: shipment.weightKg,
      marginPercent: shipment.marginPercent
    });
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        eyebrow="Shipment management"
        title="Operational shipment workspace"
        description="Create, review, and move multimodal jobs through booking, execution, customs, delivery, and closure with the shipment register and detail workbook working together."
        actions={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RefreshOutlinedIcon />} variant="outlined" onClick={() => void loadShipments()}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddCircleOutlineRoundedIcon />} onClick={openCreateDialog}>
              New job
            </Button>
          </Stack>
        }
        status="Persistent shipment core"
      />

      {error ? <Alert sx={{ mb: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Live shipment count" subtitle="Operational records with API persistence">
            <Typography variant="h3" sx={{ mb: 1 }}>
              {data.length}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Jobs now support create, edit, stage updates, detail drill-down, document linkage, refresh, and delete.
            </Typography>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Stage coverage" subtitle="Pipeline visibility by execution phase">
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {stageCounts.map((item) => (
                <Chip key={item.stage} label={`${item.stage} - ${item.count}`} sx={{ bgcolor: "rgba(15,79,191,0.06)" }} />
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Mode mix" subtitle="Multimodal operational spread">
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {modeCounts.map((item) => (
                <Chip key={item.mode} label={`${item.mode} - ${item.count}`} variant="outlined" />
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={12}>
          <SectionCard title="Shipment register" subtitle="Actionable table for execution teams">
            <Table sx={{ "& td, & th": { borderBottomColor: "rgba(15,79,191,0.08)" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Job</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Commercial</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Margin</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((shipment) => (
                  <TableRow
                    key={shipment.id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(15,79,191,0.02)"
                      }
                    }}
                  >
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography component={Link} to={`/shipments/${shipment.id}`} fontWeight={700} sx={{ color: "primary.main" }}>
                          {shipment.jobNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {shipment.origin} to {shipment.destination}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{shipment.customer}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={shipment.mode} />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          value={shipment.stage}
                          onChange={(event) => void handleStageChange(shipment.id, event.target.value as ShipmentStage)}
                        >
                          {shipmentStages.map((stage) => (
                            <MenuItem key={stage} value={stage}>
                              {stage}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography fontWeight={700}>{shipment.incoterm}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {shipment.weightKg.toLocaleString()} kg
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{shipment.owner}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${shipment.marginPercent}%`}
                        color={shipment.marginPercent >= 15 ? "success" : shipment.marginPercent >= 10 ? "warning" : "error"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton
                          component={Link}
                          to={`/shipments/${shipment.id}`}
                          sx={{ border: "1px solid rgba(15,79,191,0.08)" }}
                        >
                          <LaunchRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => openEditDialog(shipment)}
                          sx={{ border: "1px solid rgba(15,79,191,0.08)" }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => void handleDeleteShipment(shipment.id)}
                          sx={{ border: "1px solid rgba(209,78,72,0.12)" }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Operator checklist" subtitle="What this module already supports">
            <Stack spacing={1.1}>
              {[
                "Auto-generated configurable job numbers",
                "Multimodal freight records with operational ownership",
                "Stage transitions from booking through closure",
                "Persistent shipment CRUD through the API",
                "Detail pages with milestones, notes, and linked documents"
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

        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Module readiness" subtitle="Operational and commercial context">
            <Grid container spacing={1.5}>
              {[
                { title: "Document packet", text: "AWB, HBL, MBL, invoice, packing list, customs summary, and delivery instructions." },
                { title: "Carrier linkage", text: "Schedule lookups, booking references, lane-level coordination, and shipment-level milestones." },
                { title: "Commercial control", text: "Margin tracking, incoterms, owner attribution, customer records, and cost lines." },
                { title: "Next build target", text: "Document template generation, approvals, and customer portal visibility controls." }
              ].map((item) => (
                <Grid key={item.title} size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 5,
                      border: "1px solid rgba(15,79,191,0.08)",
                      background: "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(245,249,255,0.78))"
                    }}
                  >
                    <Typography fontWeight={700} sx={{ mb: 0.75 }}>
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

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingShipment(null);
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 6
          }
        }}
      >
        <DialogTitle>{editingShipment ? `Edit ${editingShipment.jobNumber}` : "Create shipment"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.2} sx={{ mt: 1 }}>
            <TextField label="Customer" value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="mode-label">Mode</InputLabel>
                  <Select
                    labelId="mode-label"
                    label="Mode"
                    value={form.mode}
                    onChange={(event) => setForm({ ...form, mode: event.target.value as CreateShipmentInput["mode"] })}
                  >
                    {["Ocean", "Air", "Road", "Rail", "Multimodal"].map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {mode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Incoterm"
                  value={form.incoterm}
                  onChange={(event) => setForm({ ...form, incoterm: event.target.value.toUpperCase() })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Origin" value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Destination"
                  value={form.destination}
                  onChange={(event) => setForm({ ...form, destination: event.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Owner" value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Weight Kg"
                  type="number"
                  value={form.weightKg}
                  onChange={(event) => setForm({ ...form, weightKg: Number(event.target.value) })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Margin %"
                  type="number"
                  value={form.marginPercent}
                  onChange={(event) => setForm({ ...form, marginPercent: Number(event.target.value) })}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setEditingShipment(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void (editingShipment ? handleUpdateShipment() : handleCreateShipment())}
            disabled={saving}
          >
            {saving ? "Saving..." : editingShipment ? "Save changes" : "Create shipment"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={2500}
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
    </>
  );
}
