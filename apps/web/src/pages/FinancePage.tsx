import { Alert, Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import MetricGrid from "../components/MetricGrid";
import { financeSummary } from "@shared/index";
import { useApiResource } from "../lib/useApiResource";

export default function FinancePage() {
  const { data, error } = useApiResource("/finance/summary", financeSummary);

  return (
    <>
      <PageHeader
        eyebrow="Finance and billing"
        title="AR, AP, and job profitability"
        description="The finance module covers invoice generation, multi-currency support, reconciliation, AP matching, accruals, margin control, and payment collection."
        status="Phase 1 plus Phase 2"
      />

      {error ? <Alert sx={{ mb: 2 }}>{error}</Alert> : null}
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Receivables
      </Typography>
      <MetricGrid items={data.receivables} />

      <Typography variant="h6" sx={{ mt: 3, mb: 1.5 }}>
        Payables
      </Typography>
      <MetricGrid items={data.payables} />

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Margin alerts">
            <List disablePadding>
              {data.marginAlerts.map((item) => (
                <ListItem key={item.jobNumber} disableGutters>
                  <ListItemText primary={item.jobNumber} secondary={item.message} />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Spec requirements represented">
            {[
              "Invoices from job cost sheets",
              "Itemized freight, customs, handling, THC, DOC and related charge lines",
              "Customer statements and aging reports",
              "Payment recording and reconciliation",
              "3-way AP matching and batch payment scheduling"
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
