import React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    showDot?: boolean;
    outline?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    showDot = false,
    outline = false,
    className = '',
    style
}) => {
    const badgeClasses = [
        styles.badge,
        styles[variant],
        styles[size],
        outline ? styles.outline : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={badgeClasses} style={style}>
            {showDot && <span className={styles.dot} />}
            {children}
        </span>
    );
};
