import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  IconButton,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import type { CreateShipmentInput, Shipment, ShipmentStage, UpdateShipmentInput } from "@shared/index";
import { shipments } from "@shared/index";
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
        description="Unique jobs, multimodal handling, address-book relationships, incoterms, milestones, split shipments, cloned jobs, and document linkage all belong here."
        actions={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RefreshOutlinedIcon />} onClick={() => void loadShipments()}>
              Refresh
            </Button>
            <Button variant="contained" onClick={openCreateDialog}>New job</Button>
          </Stack>
        }
        status="MVP scope"
      />

      {error ? <Alert sx={{ mb: 2 }}>{error}</Alert> : null}
      <Grid container spacing={2}>
        <Grid size={12}>
          <SectionCard title="Shipment register" subtitle="Representative jobs from the seeded operational dataset">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Incoterm</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Margin</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((shipment) => (
                  <TableRow key={shipment.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{shipment.jobNumber}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {shipment.origin} to {shipment.destination}
                      </Typography>
                    </TableCell>
                    <TableCell>{shipment.customer}</TableCell>
                    <TableCell>{shipment.mode}</TableCell>
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
                  <TableCell>{shipment.incoterm}</TableCell>
                  <TableCell>{shipment.owner}</TableCell>
                  <TableCell>{shipment.marginPercent}%</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openEditDialog(shipment)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => void handleDeleteShipment(shipment.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Spec-backed workflow features">
            <Stack spacing={1}>
              {[
                "Auto-generated configurable job numbers",
                "FCL, LCL, air, road, rail, and multimodal support",
                "Consignee, shipper, and notify-party management",
                "DG / IMDG and reefer compliance markers",
                "Milestones with timestamp and user attribution",
                "CSV / Excel bulk import and job clone support"
              ].map((item) => (
                <Typography key={item}>{item}</Typography>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Document and carrier linkage">
            <Stack spacing={1}>
              {[
                "Attach unlimited documents per shipment",
                "Generate AWB, HBL, MBL, invoice, packing list, release instructions",
                "Track vessel / flight schedules and container references",
                "Spot-rate comparison and carrier-lane rates belong in this module"
              ].map((item) => (
                <Typography key={item}>{item}</Typography>
              ))}
            </Stack>
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
      >
        <DialogTitle>{editingShipment ? `Edit ${editingShipment.jobNumber}` : "Create shipment"}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
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
                <TextField label="Incoterm" value={form.incoterm} onChange={(event) => setForm({ ...form, incoterm: event.target.value.toUpperCase() })} fullWidth />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Origin" value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Destination" value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} fullWidth />
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
        <DialogActions>
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
