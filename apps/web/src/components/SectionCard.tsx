import { Box, Card, CardContent, CardHeader } from "@mui/material";
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
        borderRadius: 7,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,251,255,0.94) 100%)"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "0 auto auto 0",
          width: 120,
          height: 120,
          background: "radial-gradient(circle, rgba(22,164,201,0.14), transparent 70%)",
          pointerEvents: "none"
        }}
      />
      <CardHeader
        title={title}
        subheader={subtitle}
        action={action}
        sx={{
          pb: 0,
          "& .MuiCardHeader-title": {
            fontSize: "1.1rem",
            fontWeight: 700
          }
        }}
      />
      <CardContent sx={{ pt: 2 }}>{children}</CardContent>
    </Card>
  );
}
