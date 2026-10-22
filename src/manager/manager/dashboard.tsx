import { IconShieldHalfFilled } from "@tabler/icons-react";
import { Activity, useState } from "react";
import { DashboardLayout } from "../components/layout";
import {
  type ActiveVIew,
  SecretManagerChips,
  SecretManagerTabs,
} from "../components/manager-header";
import { AdministrationTabDashboard } from "./admin/dashboard";
import { SecretsTabDashboard } from "./environments/dashboard";

export function SecretManagerDashboard() {
  const [active_view, setActiveView] = useState<ActiveVIew>("secrets");
  return (
    <DashboardLayout
      title="Secret Manager"
      Icon={IconShieldHalfFilled}
      tabs={
        <SecretManagerTabs
          active_view={active_view}
          setActiveView={setActiveView}
        />
      }
      chips={<SecretManagerChips />}
    >
      <Activity mode={active_view === "secrets" ? "visible" : "hidden"}>
        <SecretsTabDashboard />
      </Activity>
      <Activity mode={active_view === "administration" ? "visible" : "hidden"}>
        <AdministrationTabDashboard />
      </Activity>
    </DashboardLayout>
  );
}
