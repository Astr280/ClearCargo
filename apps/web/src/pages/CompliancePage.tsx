import { Alert, Chip, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { complianceQueue } from "@shared/index";
import { useApiResource } from "../lib/useApiResource";

export default function CompliancePage() {
  const { data, error } = useApiResource("/compliance/queue", complianceQueue);

  return (
    <>
      <PageHeader
        eyebrow="Customs and compliance"
        title="Regulatory execution workspace"
        description="Import and export declarations, HS tariff lookup, duty calculations, AES / ISF / 7501 workflows, sanctions screening, and auditable customs actions live here."
        status="High-regulation module"
      />

      {error ? <Alert sx={{ mb: 2 }}>{error}</Alert> : null}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Compliance queue">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Jurisdiction</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.jurisdiction}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.priority}
                        color={item.priority === "High" ? "error" : item.priority === "Medium" ? "warning" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="Required capabilities">
            {[
              "Country-of-origin management and certificate generation",
              "Continuous and single-entry bond handling",
              "Post-entry amendments and broker POA storage",
              "OFAC, EU, UN, BIS screening with retained logs",
              "Audit trail on all customs actions"
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
