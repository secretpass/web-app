import { useMemo, useState } from "react";
import { SingleEnvironmentDashboard } from "./environment";
import { EnvironmentsSidebar } from "./sidebar";

export function SecretsTabDashboard() {
  return (
    <section className="h-full flex">
      <EnvironmentsSidebar />
    </section>
  );
}
