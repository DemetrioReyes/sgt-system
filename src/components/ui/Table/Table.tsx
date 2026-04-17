import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import styles from './Table.module.css';

export function Table({ className, children, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className={styles.wrapper}>
      <table className={`${styles.table} ${className || ''}`} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`${styles.thead} ${className || ''}`} {...rest}>
      {children}
    </thead>
  );
}

export function Tbody({ className, children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`${styles.tbody} ${className || ''}`} {...rest}>
      {children}
    </tbody>
  );
}

export function Tr({ className, children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`${styles.tr} ${className || ''}`} {...rest}>
      {children}
    </tr>
  );
}

export function Th({ className, children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`${styles.th} ${className || ''}`} {...rest}>
      {children}
    </th>
  );
}

export function Td({ className, children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`${styles.td} ${className || ''}`} {...rest}>
      {children}
    </td>
  );
}
