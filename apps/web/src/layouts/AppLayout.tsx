import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SettingsEthernetOutlinedIcon from "@mui/icons-material/SettingsEthernetOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";

const drawerWidth = 280;

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
    <Box sx={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg, #f4f8fc 0%, #e7eff8 100%)" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(22, 89, 199, 0.12)",
            background: "linear-gradient(180deg, #0d2347 0%, #12386e 100%)",
            color: "#fff"
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box component="img" src="/cargoclear-mark.svg" alt="CargoClear" sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: "#fff" }} />
            <Box>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Enterprise freight OS
              </Typography>
              <Typography variant="h5">CargoClear</Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)", mb: 2 }}>
            Freight forwarding, customs, finance, warehousing, CRM, and customer visibility in one system.
          </Typography>

          <List sx={{ display: "grid", gap: 1 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                selected={location.pathname === item.to}
                sx={{
                  borderRadius: 3,
                  color: "#fff",
                  "&.Mui-selected": {
                    background: "linear-gradient(135deg, rgba(73,183,211,0.28), rgba(22,89,199,0.4))"
                  }
                }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: "rgba(255,255,255,0.78)",
            color: "#17315c",
            borderBottom: "1px solid rgba(22,89,199,0.08)",
            backdropFilter: "blur(16px)"
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <TextField
              placeholder="Global search: jobs, customers, HS codes, documents"
              size="small"
              sx={{ width: 420, maxWidth: "100%", bgcolor: "#fff", borderRadius: 999 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
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

        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
