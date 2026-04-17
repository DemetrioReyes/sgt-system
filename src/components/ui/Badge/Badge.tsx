import { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = 'default', className, children, ...rest }: Props) {
  const classes = [styles.badge, styles[variant], className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
