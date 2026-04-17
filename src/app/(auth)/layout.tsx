import styles from './layout.module.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authLayout}>
      <div className={styles.authCard}>
        {children}
      </div>
    </div>
  );
}
