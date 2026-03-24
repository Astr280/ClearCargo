import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SettingsEthernetOutlinedIcon from "@mui/icons-material/SettingsEthernetOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Drawer,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Typography,
  alpha
} from "@mui/material";
import type { ModuleKey } from "@shared/index";
import type { PropsWithChildren, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { canAccessModule } from "../auth/access";

const drawerWidth = 292;

const navItems: Array<{ label: string; to: string; icon: ReactNode; moduleKey: ModuleKey }> = [
  { label: "Control Tower", to: "/", icon: <DashboardOutlinedIcon />, moduleKey: "dashboard" },
  { label: "Shipments", to: "/shipments", icon: <Inventory2OutlinedIcon />, moduleKey: "shipments" },
  { label: "Customs", to: "/compliance", icon: <GavelOutlinedIcon />, moduleKey: "compliance" },
  { label: "Finance", to: "/finance", icon: <PaymentsOutlinedIcon />, moduleKey: "finance" },
  { label: "Warehouse", to: "/warehouse", icon: <WarehouseOutlinedIcon />, moduleKey: "warehouse" },
  { label: "Customers", to: "/customers", icon: <GroupsOutlinedIcon />, moduleKey: "customers" },
  { label: "Platform", to: "/platform", icon: <SettingsEthernetOutlinedIcon />, moduleKey: "platform" }
];

export default function AppLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const { session, logout } = useAuth();

  if (!session) {
    return children;
  }

  const visibleNavItems = navItems.filter((item) => canAccessModule(session.user.role, session.tenant, item.moduleKey));
  const branding = session.tenant.branding;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: `linear-gradient(180deg, ${branding.accentColor} 0%, ${alpha(branding.primaryColor, 0.92)} 68%, ${alpha(branding.secondaryColor, 0.78)} 100%)`,
            color: "#fff"
          }
        }}
      >
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            {branding.logoMode === "mark" ? (
              <Box
                component="img"
                src="/cargoclear-mark.svg"
                alt={branding.companyName}
                sx={{ width: 56, height: 56, borderRadius: "12px", bgcolor: "#fff", p: 0.5 }}
              />
            ) : (
              <Avatar sx={{ width: 56, height: 56, bgcolor: "#fff", color: branding.primaryColor, fontWeight: 700 }}>
                {branding.initials}
              </Avatar>
            )}
            <Box>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)" }}>
                {session.tenant.domain}
              </Typography>
              <Typography variant="h5">{branding.companyName}</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              mb: 2.5,
              p: 2.25,
              borderRadius: "16px",
              background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
              border: "1px solid rgba(255,255,255,0.10)"
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <FlashOnOutlinedIcon sx={{ fontSize: 18, color: "#dcefff" }} />
              <Typography variant="subtitle2">Access profile</Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.75 }}>
              Signed in as {session.user.role}. Module access and branding are controlled by tenant configuration and role policy.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} useFlexGap flexWrap="wrap">
              <Chip size="small" label={session.user.role} sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff" }} />
              <Chip
                size="small"
                label={`${session.tenant.enabledModules.length} modules enabled`}
                sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff" }}
              />
            </Stack>
          </Box>

          <List sx={{ display: "grid", gap: 0.75 }}>
            {visibleNavItems.map((item) => {
              const selected = item.to === "/shipments" ? location.pathname.startsWith("/shipments") : location.pathname === item.to;

              return (
                <ListItemButton
                  key={item.to}
                  component={Link}
                  to={item.to}
                  selected={selected}
                  sx={{
                    borderRadius: "12px",
                    color: "#fff",
                    px: 1.5,
                    py: 1,
                    "&:hover": {
                      background: "rgba(255,255,255,0.08)"
                    },
                    "&.Mui-selected": {
                      background: "rgba(255,255,255,0.16)"
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
          </List>

          <Box
            sx={{
              mt: "auto",
              p: 2.25,
              borderRadius: "16px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.64)" }}>
              Tenant status
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              White-label ready
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.76)", mt: 0.75, lineHeight: 1.7 }}>
              Branding, feature flags, and role access now change by tenant without altering the core product shell.
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: "rgba(255,255,255,0.84)",
            color: branding.accentColor,
            borderBottom: `1px solid ${alpha(branding.primaryColor, 0.08)}`,
            backdropFilter: "blur(18px)"
          }}
        >
          <Toolbar sx={{ gap: 2, minHeight: 80 }}>
            <TextField
              placeholder="Global search: jobs, customers, HS codes, documents"
              size="small"
              sx={{
                width: 420,
                maxWidth: "100%",
                bgcolor: "rgba(255,255,255,0.92)"
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
              <Chip label="MFA verified" variant="outlined" />
              <Chip label="RBAC active" variant="outlined" />
              <Chip label={session.tenant.name} variant="outlined" />
            </Stack>
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" fontWeight={700}>
                  {session.user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {session.user.role}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: branding.primaryColor }}>{session.user.name.charAt(0)}</Avatar>
              <Button variant="outlined" startIcon={<LogoutRoundedIcon />} onClick={() => void logout()}>
                Sign out
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 3.5 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
