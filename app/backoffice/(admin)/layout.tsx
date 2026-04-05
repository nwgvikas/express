import { getBackofficeAdmin } from "@/helper/backoffice-auth";
import { AdminShell } from "./admin-shell";

export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { admin } = await getBackofficeAdmin();

  return (
    <AdminShell userEmail={admin.email} userName={admin.name}>
      {children}
    </AdminShell>
  );
}
