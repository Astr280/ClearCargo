import { Card, CardContent, CardHeader, Divider } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function SectionCard({ title, subtitle, action, children }: PropsWithChildren<SectionCardProps>) {
  return (
    <Card
      sx={{
        borderRadius: "16px",
        height: "100%",
        overflow: "hidden",
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.96) 100%)"
      }}
    >
      <CardHeader
        title={title}
        subheader={subtitle}
        action={action}
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          "& .MuiCardHeader-title": {
            fontSize: "1.02rem",
            fontWeight: 700
          },
          "& .MuiCardHeader-subheader": {
            mt: 0.4,
            lineHeight: 1.5
          }
        }}
      />
      <Divider />
      <CardContent sx={{ px: 3, py: 2.5 }}>{children}</CardContent>
    </Card>
  );
}
