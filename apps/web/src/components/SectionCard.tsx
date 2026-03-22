import { Card, CardContent, CardHeader } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function SectionCard({ title, subtitle, action, children }: PropsWithChildren<SectionCardProps>) {
  return (
    <Card sx={{ borderRadius: 5, height: "100%" }}>
      <CardHeader title={title} subheader={subtitle} action={action} />
      <CardContent>{children}</CardContent>
    </Card>
  );
}
