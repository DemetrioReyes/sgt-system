import { TextareaHTMLAttributes, forwardRef } from 'react';
import styles from './Textarea.module.css';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, className, id, ...rest }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`${styles.textarea} ${error ? styles.textareaError : ''} ${className || ''}`}
          aria-invalid={!!error}
          rows={4}
          {...rest}
        />
        {error && (
          <p className={styles.error} role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
