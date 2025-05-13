import DashboardNavBar from '@/app/dashboard/layout/DashboardNavBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DashboardNavBar />
      {children}
    </div>
  );
}
