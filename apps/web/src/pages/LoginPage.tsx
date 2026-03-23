import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login, demoAccounts } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@cargoclear.demo");
  const [password, setPassword] = useState("CargoClear!2026");
  const [mfaCode, setMfaCode] = useState("");
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    setError(null);

    try {
      const result = await login(email, password, requiresMfa ? mfaCode : undefined);

      if (result.session) {
        navigate("/", { replace: true });
        return;
      }

      if (result.mfaRequired) {
        setRequiresMfa(true);
        return;
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4
      }}
    >
      <Grid container spacing={3} sx={{ maxWidth: 1180 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ pr: { lg: 3 } }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
              <Box component="img" src="/cargoclear-mark.svg" alt="CargoClear" sx={{ width: 74, height: 74 }} />
              <Box>
                <Typography variant="overline" color="primary.main">
                  CargoClear identity gateway
                </Typography>
                <Typography variant="h3">Freight access with role and tenant controls</Typography>
              </Box>
            </Stack>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
              This sign-in flow is the local foundation for the spec’s MFA, RBAC, and multi-tenant architecture. It already
              switches the workspace by tenant and unlocks modules by role.
            </Typography>

            <Stack spacing={1.5}>
              {[
                "Role-based module access for freight, customs, finance, warehouse, management, admin, and customer users.",
                "Tenant-aware branding and feature flags for white-label deployments.",
                "API session protection on all operational routes after login."
              ].map((item) => (
                <Box key={item} sx={{ p: 1.75, borderRadius: 4, bgcolor: "rgba(15,79,191,0.05)" }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ borderRadius: 8 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <LockOpenRoundedIcon color="primary" />
                <Typography variant="h5">Sign in</Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Use the seeded demo accounts below. Password is <strong>CargoClear!2026</strong> and MFA code is
                <strong> 123456</strong>.
              </Typography>

              {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
              {requiresMfa ? <Alert severity="info" sx={{ mb: 2 }}>MFA verification is required to finish sign-in.</Alert> : null}

              <Stack spacing={2}>
                <TextField label="Email" value={email} onChange={(event) => setEmail(event.target.value)} fullWidth />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  fullWidth
                />
                {requiresMfa ? (
                  <TextField
                    label="MFA Code"
                    value={mfaCode}
                    onChange={(event) => setMfaCode(event.target.value)}
                    fullWidth
                  />
                ) : null}
                <Button variant="contained" onClick={() => void handleSubmit()} disabled={saving}>
                  {saving ? "Signing in..." : requiresMfa ? "Verify and enter" : "Continue"}
                </Button>
              </Stack>

              <Box sx={{ mt: 4 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <VerifiedUserRoundedIcon color="primary" />
                  <Typography variant="h6">Demo accounts</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  {demoAccounts.map((account) => (
                    <Grid key={account.email} size={{ xs: 12, md: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 5,
                          border: "1px solid rgba(15,79,191,0.08)",
                          background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,249,255,0.92))",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          setEmail(account.email);
                          setPassword("CargoClear!2026");
                          setMfaCode("123456");
                          setRequiresMfa(false);
                        }}
                      >
                        <Typography fontWeight={700}>{account.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {account.email}
                        </Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          <Chip size="small" label={account.role} variant="outlined" />
                          <Chip size="small" label={account.tenantName} sx={{ bgcolor: "rgba(15,79,191,0.06)" }} />
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
