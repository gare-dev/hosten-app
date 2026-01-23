import React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import styles from './InputField.module.scss';

export interface InputFieldProps {
    id: string;
    label: string;
    type: 'text' | 'email' | 'password';
    value: string;
    placeholder: string;
    icon: React.ReactNode;
    error?: string;
    touched: boolean;
    disabled?: boolean;
    autoComplete?: string;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    onChange: (value: string) => void;
    onBlur: () => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    children?: React.ReactNode;
}

export function InputField({
    id,
    label,
    type,
    value,
    placeholder,
    icon,
    error,
    touched,
    disabled,
    autoComplete,
    showPasswordToggle,
    showPassword,
    onTogglePassword,
    onChange,
    onBlur,
    onKeyDown,
    children,
}: InputFieldProps) {
    const showError = touched && error;
    const inputType = showPasswordToggle && showPassword ? 'text' : type;

    return (
        <div className={`${styles.inputGroup} ${showError ? styles.hasError : ''}`}>
            <label htmlFor={id}>{label}</label>
            <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>{icon}</span>
                <input
                    id={id}
                    type={inputType}
                    value={value}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    aria-invalid={showError ? 'true' : 'false'}
                    aria-describedby={showError ? `${id}-error` : undefined}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={onTogglePassword}
                        disabled={disabled}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {showError && (
                <span id={`${id}-error`} className={styles.errorMessage} role="alert">
                    <AlertCircle size={14} />
                    {error}
                </span>
            )}
            {children}
        </div>
    );
}

export default InputField;
