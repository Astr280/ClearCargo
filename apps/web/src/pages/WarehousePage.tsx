import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import { Alert, Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { warehouseTasks } from "@shared/index";
import MetricGrid from "../components/MetricGrid";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { useApiResource } from "../lib/useApiResource";

export default function WarehousePage() {
  const { data, error } = useApiResource("/warehouse/tasks", warehouseTasks);

  const metrics = [
    { label: "Open tasks", value: String(data.length), trend: "Inbound, put-away, and pick execution" },
    { label: "Ready now", value: String(data.filter((task) => task.status === "Ready").length), trend: "Tasks available for immediate execution" },
    { label: "In progress", value: String(data.filter((task) => task.status === "In progress").length), trend: "Work already on the floor" },
    { label: "Tablet workflows", value: "4", trend: "Receive, put-away, pick, and count" }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Warehouse management"
        title="WMS and field operations"
        description="Warehouse zones, bin control, barcode execution, cold-chain handling, and mobile task orchestration are organized into one practical operations surface."
        status="Phase 3 build track"
      />

      <MetricGrid items={metrics} />
      {error ? <Alert sx={{ mt: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title="Current warehouse tasks" subtitle="Execution queue on the floor" action={<WarehouseRoundedIcon color="primary" />}>
            <Stack spacing={1.4}>
              {data.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    p: 2,
                    borderRadius: 5,
                    border: "1px solid rgba(15,79,191,0.08)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(245,249,255,0.9))"
                  }}
                >
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.25}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography fontWeight={700}>{task.type}</Typography>
                        <Chip size="small" label={task.status} color={task.status === "Ready" ? "success" : "primary"} variant="outlined" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {task.location}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {task.assignedTo}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Mobile app requirements" subtitle="What the field and warehouse apps need" action={<QrCodeScannerRoundedIcon color="primary" />}>
            <Stack spacing={1.1}>
              {[
                "Barcode and QR scan flows for receiving, cargo identification, and exception capture.",
                "Offline-first task execution with background sync when connectivity returns.",
                "Photo proof, signatures, and issue reporting for drivers and final-mile teams.",
                "Bluetooth printing support for Zebra and Dymo labels on tablet workflows."
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
          <SectionCard title="Warehouse capability map" subtitle="Core WMS functions from the spec">
            <Grid container spacing={1.5}>
              {[
                "Zones, aisles, bays, and bin-level location control",
                "Inbound receipt against packing list with exceptions",
                "Outbound pick, pack, dispatch, and cross-dock workflows",
                "Inventory aging, cycle counting, and cold-zone controls"
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

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Shipment linkage" subtitle="Why WMS cannot be isolated" action={<RouteRoundedIcon color="primary" />}>
            <Stack spacing={1.5}>
              {[
                "Inbound and outbound warehouse events should feed shipment milestones automatically.",
                "Receipt references, damages, and exceptions need to be visible to freight coordinators.",
                "Cold-chain tasks should surface temperature-zone context back on the shipment job."
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
