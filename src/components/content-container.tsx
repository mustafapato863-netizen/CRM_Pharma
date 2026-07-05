import type { ReactNode } from "react";
import { Container } from "@mui/material";

export function ContentContainer({ children }: { children: ReactNode }) {
  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{ px: { xs: 1.75, sm: 2.5, lg: 3 }, py: { xs: 2, lg: 2.5 } }}
    >
      {children}
    </Container>
  );
}
