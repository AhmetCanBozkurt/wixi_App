import React from 'react';
import styles from './Switch.module.css';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  containerClassName?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  description,
  containerClassName = '',
  id,
  className = '',
  ...props
}) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.container} ${containerClassName}`}>
      <label className={styles.switchWrapper} htmlFor={switchId}>
        <div className={styles.switchBase}>
          <input
            id={switchId}
            type="checkbox"
            className={`${styles.hiddenInput} ${className}`}
            {...props}
          />
          <span className={styles.slider}></span>
        </div>
        <div className={styles.info}>
          {label && <span className={styles.label}>{label}</span>}
          {description && <span className={styles.description}>{description}</span>}
        </div>
      </label>
    </div>
  );
};
