import React from 'react';
import styles from './PasswordStrengthIndicator.module.scss';

export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
    score: number;
    level: PasswordStrengthLevel;
    label: string;
}

export interface PasswordStrengthIndicatorProps {
    strength: PasswordStrengthResult;
    show: boolean;
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
    if (!password) {
        return { score: 0, level: 'weak', label: '' };
    }

    let score = 0;

    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // Normalize score to 1-4 range
    const normalizedScore = Math.min(Math.ceil(score / 2), 4);

    const levels: { level: PasswordStrengthLevel; label: string }[] = [
        { level: 'weak', label: 'Weak password' },
        { level: 'fair', label: 'Fair password' },
        { level: 'good', label: 'Good password' },
        { level: 'strong', label: 'Strong password' },
    ];

    const result = levels[Math.max(0, normalizedScore - 1)];

    return {
        score: normalizedScore,
        level: result.level,
        label: result.label,
    };
}

export function PasswordStrengthIndicator({ strength, show }: PasswordStrengthIndicatorProps) {
    if (!show || strength.score === 0) {
        return null;
    }

    return (
        <div className={styles.passwordStrength}>
            <div className={styles.strengthBar}>
                {[1, 2, 3, 4].map((segment) => (
                    <div
                        key={segment}
                        className={`${styles.strengthSegment} ${segment <= strength.score ? `${styles.active} ${styles[strength.level]}` : ''
                            }`}
                    />
                ))}
            </div>
            <span className={`${styles.strengthLabel} ${styles[strength.level]}`}>
                {strength.label}
            </span>
        </div>
    );
}

export default PasswordStrengthIndicator;
