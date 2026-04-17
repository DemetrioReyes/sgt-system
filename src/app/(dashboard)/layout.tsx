import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboardLayout}>
      <div data-print-hide><Sidebar /></div>
      <div className={styles.mainWrapper}>
        <div data-print-hide><TopBar /></div>
        <main className={styles.main}>
          {children}
        </main>
      </div>
      <div data-print-hide><BottomNav /></div>
    </div>
  );
}
