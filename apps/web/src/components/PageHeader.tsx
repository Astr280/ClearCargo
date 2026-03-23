import EastRoundedIcon from "@mui/icons-material/EastRounded";
import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  status?: string;
  eyebrowTone?: string;
}

export default function PageHeader({ eyebrow, title, description, actions, status, eyebrowTone }: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 3,
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 8,
        border: "1px solid rgba(15,79,191,0.08)",
        background:
          "radial-gradient(circle at top left, rgba(22,164,201,0.16), transparent 26%), linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(241,247,255,0.92) 100%)",
        boxShadow: "0 28px 60px rgba(16, 42, 86, 0.08)"
      }}
    >
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={3}>
        <Box sx={{ maxWidth: 820 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="overline" sx={{ color: eyebrowTone ?? "primary.main" }}>
              {eyebrow}
            </Typography>
            <EastRoundedIcon sx={{ fontSize: 18, color: "secondary.main" }} />
          </Stack>
          <Typography variant="h3" sx={{ mb: 1.25, maxWidth: 820 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.7 }}>
            {description}
          </Typography>
        </Box>
        <Stack spacing={1.25} alignItems={{ xs: "stretch", lg: "flex-end" }}>
          {status ? (
            <Chip
              label={status}
              color="primary"
              variant="outlined"
              sx={{
                bgcolor: "rgba(255,255,255,0.72)",
                borderColor: "rgba(15,79,191,0.18)"
              }}
            />
          ) : null}
          {actions}
        </Stack>
      </Stack>
      <Divider sx={{ my: 2.5, borderColor: "rgba(15,79,191,0.08)" }} />
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} useFlexGap flexWrap="wrap">
        {[
          "3-click workflows",
          "Persistent shipment data",
          "API-connected modules",
          "White-label ready"
        ].map((item) => (
          <Chip
            key={item}
            label={item}
            variant="filled"
            sx={{
              bgcolor: "rgba(15,79,191,0.06)",
              color: "text.primary",
              fontWeight: 700
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
