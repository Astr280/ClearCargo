import { Alert, Button, Chip, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { shipments } from "@shared/index";
import { useApiResource } from "../lib/useApiResource";

export default function ShipmentsPage() {
  const { data, error } = useApiResource("/shipments", shipments);

  return (
    <>
      <PageHeader
        eyebrow="Shipment management"
        title="Operational shipment workspace"
        description="Unique jobs, multimodal handling, address-book relationships, incoterms, milestones, split shipments, cloned jobs, and document linkage all belong here."
        actions={<Button variant="contained">New job</Button>}
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
                      <Chip size="small" label={shipment.stage} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{shipment.incoterm}</TableCell>
                    <TableCell>{shipment.owner}</TableCell>
                    <TableCell>{shipment.marginPercent}%</TableCell>
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
    </>
  );
}
