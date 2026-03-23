import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function AccessDeniedPage() {
  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center"
      }}
    >
      <Stack spacing={1.5} alignItems="center" sx={{ textAlign: "center", maxWidth: 520 }}>
        <LockPersonRoundedIcon sx={{ fontSize: 54, color: "primary.main" }} />
        <Typography variant="h3">Access denied</Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
          Your current role or tenant configuration does not allow this module. This is intentional and mirrors the spec’s
          RBAC and feature-flag behavior.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Return to dashboard
        </Button>
      </Stack>
    </Box>
  );
}
