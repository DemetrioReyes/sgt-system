import { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', loading, className, children, ...rest }, ref) => {
    const classes = [
      styles.button,
      styles[variant],
      styles[size],
      loading && styles.loading,
      className
    ].filter(Boolean).join(' ');

    return (
      <button ref={ref} className={classes} disabled={loading || rest.disabled} {...rest}>
        {loading ? <span className={styles.spinner} /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
