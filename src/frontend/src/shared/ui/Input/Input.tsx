import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerClassName = '',
  className = '',
  id,
  required,
  type,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`${styles.container} ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.requiredAsterisk}>*</span>}
        </label>
      )}
      <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
        <input
          id={inputId}
          className={`${styles.input} ${className} ${leftIcon ? styles.hasLeftIcon : ''} ${(rightIcon || isPassword) ? styles.hasRightIcon : ''}`}
          type={actualType}
          {...props}
        />
        {isPassword && (
          <button 
            type="button" 
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
          </button>
        )}
        {rightIcon && !isPassword && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
