import { SecretManagerDashboard } from "./manager/dashboard";

export function SecretManagerLayout() {
  return (
    <div className="content py-4 transition-all duration-700">
      <SecretManagerDashboard />
    </div>
  );
}
