import { Box, Chip, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  status?: string;
}

export default function PageHeader({ eyebrow, title, description, actions, status }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="overline" sx={{ color: "primary.main" }}>
            {eyebrow}
          </Typography>
          <Typography variant="h3" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
            {description}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          {status ? <Chip label={status} color="primary" variant="outlined" /> : null}
          {actions}
        </Stack>
      </Stack>
    </Box>
  );
}
