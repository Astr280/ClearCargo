import { Alert, Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { warehouseTasks } from "@shared/index";
import { useApiResource } from "../lib/useApiResource";

export default function WarehousePage() {
  const { data, error } = useApiResource("/warehouse/tasks", warehouseTasks);

  return (
    <>
      <PageHeader
        eyebrow="Warehouse management"
        title="WMS and mobile operations"
        description="Warehouse zones, inbound receiving, bin put-away, barcode workflows, outbound picks, cross-docking, cold-chain control, and mobile execution are surfaced here."
        status="Phase 3"
      />

      {error ? <Alert sx={{ mb: 2 }}>{error}</Alert> : null}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard title="Current warehouse tasks">
            <List disablePadding>
              {data.map((task) => (
                <ListItem key={task.id} disableGutters>
                  <ListItemText primary={`${task.type} · ${task.location}`} secondary={`${task.assignedTo} · ${task.status}`} />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title="Mobile app requirements">
            {[
              "Driver app with GPS, POD photos, e-signatures, and exception reporting",
              "Warehouse tablet app for scan receipt, put-away, picks, and cycle counts",
              "Offline sync behavior for field and warehouse users",
              "Zebra / Dymo Bluetooth printing support"
            ].map((item) => (
              <Typography key={item} sx={{ mb: 1 }}>
                {item}
              </Typography>
            ))}
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
