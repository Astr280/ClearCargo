import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SettingsEthernetOutlinedIcon from "@mui/icons-material/SettingsEthernetOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import {
  AppBar,
  Avatar,
  Box,
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
  Typography
} from "@mui/material";
import type { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 292;

const navItems = [
  { label: "Control Tower", to: "/", icon: <DashboardOutlinedIcon /> },
  { label: "Shipments", to: "/shipments", icon: <Inventory2OutlinedIcon /> },
  { label: "Customs", to: "/compliance", icon: <GavelOutlinedIcon /> },
  { label: "Finance", to: "/finance", icon: <PaymentsOutlinedIcon /> },
  { label: "Warehouse", to: "/warehouse", icon: <WarehouseOutlinedIcon /> },
  { label: "Customers", to: "/customers", icon: <GroupsOutlinedIcon /> },
  { label: "Platform", to: "/platform", icon: <SettingsEthernetOutlinedIcon /> }
];

export default function AppLayout({ children }: PropsWithChildren) {
  const location = useLocation();

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
            background:
              "radial-gradient(circle at top left, rgba(25,170,199,0.26), transparent 24%), linear-gradient(180deg, #081933 0%, #0f2851 55%, #14386c 100%)",
            color: "#fff"
          }
        }}
      >
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              component="img"
              src="/cargoclear-mark.svg"
              alt="CargoClear"
              sx={{ width: 58, height: 58, borderRadius: 4, bgcolor: "#fff", p: 0.5 }}
            />
            <Box>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Enterprise freight OS
              </Typography>
              <Typography variant="h5">CargoClear</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: 5,
              background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <FlashOnOutlinedIcon sx={{ fontSize: 18, color: "#77d3e6" }} />
              <Typography variant="subtitle2">Launch pulse</Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.74)", lineHeight: 1.7 }}>
              Freight forwarding, customs, finance, warehousing, CRM, and customer visibility in one integrated workspace.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} useFlexGap flexWrap="wrap">
              <Chip size="small" label="Shipment CRUD" sx={{ bgcolor: "rgba(119,211,230,0.16)", color: "#fff" }} />
              <Chip size="small" label="Persistent jobs" sx={{ bgcolor: "rgba(119,211,230,0.16)", color: "#fff" }} />
            </Stack>
          </Box>

          <List sx={{ display: "grid", gap: 1 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                selected={location.pathname === item.to}
                sx={{
                  borderRadius: 4,
                  color: "#fff",
                  px: 1.25,
                  py: 0.75,
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)"
                  },
                  "&.Mui-selected": {
                    background: "linear-gradient(135deg, rgba(73,183,211,0.26), rgba(22,89,199,0.4))"
                  }
                }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>

          <Box
            sx={{
              mt: "auto",
              p: 2,
              borderRadius: 5,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.64)" }}>
              Deployment state
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              Phase 1 foundation
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.75, lineHeight: 1.7 }}>
              UI shell, API modules, shared models, shipment create/edit/delete, and persistent seeded data are live.
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: "rgba(255,255,255,0.72)",
            color: "#17315c",
            borderBottom: "1px solid rgba(22,89,199,0.08)",
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
                bgcolor: "rgba(255,255,255,0.82)",
                borderRadius: 999,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999
                }
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
              <Chip label="99.9% SLA target" variant="outlined" />
              <Chip label="RBAC active" variant="outlined" />
            </Stack>
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  Astr280
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  System Admin
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#1659c7" }}>A</Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 3.5 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
