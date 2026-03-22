import { Alert, Grid, List, ListItem, ListItemText } from "@mui/material";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import MetricGrid from "../components/MetricGrid";
import { platformOverview } from "@shared/index";
import { useApiResource } from "../lib/useApiResource";

export default function PlatformPage() {
  const { data, error } = useApiResource("/platform/overview", platformOverview);

  return (
    <>
      <PageHeader
        eyebrow="Platform architecture"
        title="Scale, integrations, and tenancy"
        description="This module captures the recommended stack, external integrations, multi-tenant isolation, white-labeling, and operational governance expected by the spec."
        status="Enterprise scale plan"
      />

      <MetricGrid items={data.architecture} />
      {error ? <Alert sx={{ mt: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Integration map">
            <List disablePadding>
              {data.integrations.map((integration) => (
                <ListItem key={integration.name} disableGutters>
                  <ListItemText primary={integration.name} secondary={`${integration.phase} · ${integration.method}`} />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Multi-tenancy controls">
            <List disablePadding>
              {data.tenancy.map((item) => (
                <ListItem key={item} disableGutters>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
