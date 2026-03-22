import { Alert, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { customers } from "@shared/index";
import { useApiResource } from "../lib/useApiResource";

export default function CustomersPage() {
  const { data, error } = useApiResource("/customers", customers);

  return (
    <>
      <PageHeader
        eyebrow="CRM and customer portal"
        title="Customers, quotes, and self-service visibility"
        description="This area combines customer master data, quote pipeline, trade lanes, credit terms, portal access, messaging, and shipment history."
        status="CRM + Portal"
      />

      {error ? <Alert sx={{ mb: 2 }}>{error}</Alert> : null}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Customer account overview">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Trade lane</TableCell>
                  <TableCell>Credit terms</TableCell>
                  <TableCell>Quote stage</TableCell>
                  <TableCell>Open shipments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((customer) => (
                  <TableRow key={customer.name}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.lane}</TableCell>
                    <TableCell>{customer.creditTerms}</TableCell>
                    <TableCell>{customer.quoteStage}</TableCell>
                    <TableCell>{customer.openShipments}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="Portal capabilities">
            {[
              "MFA-secured customer login",
              "Shipment tracking with milestones and ETA",
              "Approved document downloads",
              "Invoice view and online payments",
              "Booking and quote request forms",
              "Coordinator messaging tied to jobs"
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
