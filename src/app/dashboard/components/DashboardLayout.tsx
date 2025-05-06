import DashboardNavBar from "./DashboardNavBar";

export default function DashboardLayout({
  children,
  companyName,
}: {
  children: React.ReactNode;
  companyName?: string | null;
}) {
  return (
    <div>
      <DashboardNavBar companyName={companyName} />
      {children}
    </div>
  );
}
