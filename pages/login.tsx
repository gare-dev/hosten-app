import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Lock, ArrowRight, User, Eye, EyeOff, Shield, AlertCircle, Loader2 } from 'lucide-react';
import styles from '@/styles/login.module.scss';
import { useAlert } from '@/context/alert-context';
import { useMutation } from '@tanstack/react-query';
import userLogin from '@/services/user-login';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface FormState {
    username: string;
    password: string;
}

interface FormErrors {
    username?: string;
    password?: string;
}

interface FieldTouched {
    username: boolean;
    password: boolean;
}

const VALIDATION_RULES = {
    username: {
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_.-]+$/,
    },
    password: {
        minLength: 6,
        maxLength: 128,
    },
} as const;

function validateUsername(value: string): string | undefined {
    const trimmed = value.trim();

    if (!trimmed) {
        return 'Username is required';
    }

    if (trimmed.length < VALIDATION_RULES.username.minLength) {
        return `Username must be at least ${VALIDATION_RULES.username.minLength} characters`;
    }

    if (trimmed.length > VALIDATION_RULES.username.maxLength) {
        return `Username must be less than ${VALIDATION_RULES.username.maxLength} characters`;
    }

    if (!VALIDATION_RULES.username.pattern.test(trimmed)) {
        return 'Username can only contain letters, numbers, dots, hyphens and underscores';
    }

    return undefined;
}

function validatePassword(value: string): string | undefined {
    if (!value) {
        return 'Password is required';
    }

    if (value.length < VALIDATION_RULES.password.minLength) {
        return `Password must be at least ${VALIDATION_RULES.password.minLength} characters`;
    }

    if (value.length > VALIDATION_RULES.password.maxLength) {
        return 'Password is too long';
    }

    return undefined;
}

function validateForm(form: FormState): FormErrors {
    return {
        username: validateUsername(form.username),
        password: validatePassword(form.password),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Message Mapping (avoid exposing technical details)
// ─────────────────────────────────────────────────────────────────────────────

function mapApiError(error: unknown): string {
    if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.response?.data?.error?.details?.[0]?.message;

        switch (status) {
            case 401:
                return 'Invalid username or password. Please try again.';
            case 403:
                return 'Access denied. Please contact your administrator.';
            case 404:
                return 'Account not found. Please check your credentials.';
            case 429:
                return 'Too many attempts. Please wait a moment and try again.';
            case 500:
            case 502:
            case 503:
                return 'Service temporarily unavailable. Please try again later.';
            default:
                if (message && !message.toLowerCase().includes('error') && message.length < 100) {
                    return message;
                }
                return 'Unable to sign in. Please check your credentials and try again.';
        }
    }

    return 'An unexpected error occurred. Please try again.';
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hook: Form State Management
// ─────────────────────────────────────────────────────────────────────────────

function useLoginForm() {
    const [form, setForm] = useState<FormState>({
        username: '',
        password: '',
    });

    const [touched, setTouched] = useState<FieldTouched>({
        username: false,
        password: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [generalError, setGeneralError] = useState<string | undefined>();

    const errors = useMemo(() => validateForm(form), [form]);

    const isValid = useMemo(() => {
        return !errors.username && !errors.password && form.username && form.password;
    }, [errors, form]);

    const updateField = useCallback((field: keyof FormState, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (generalError) {
            setGeneralError(undefined);
        }
    }, [generalError]);

    const touchField = useCallback((field: keyof FormState) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    const touchAllFields = useCallback(() => {
        setTouched({ username: true, password: true });
    }, []);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    return {
        form,
        errors,
        touched,
        showPassword,
        generalError,
        isValid,
        updateField,
        touchField,
        touchAllFields,
        togglePasswordVisibility,
        setGeneralError,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component: Input Field
// ─────────────────────────────────────────────────────────────────────────────

interface InputFieldProps {
    id: string;
    label: string;
    type: 'text' | 'password';
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
}

function InputField({
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
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component: Login Page
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const {
        form,
        errors,
        touched,
        showPassword,
        generalError,
        updateField,
        touchField,
        touchAllFields,
        togglePasswordVisibility,
        setGeneralError,
    } = useLoginForm();

    const { showAlert } = useAlert();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const redirectTo = typeof router.query.redirect === 'string'
        ? router.query.redirect
        : '/servers';

    const { mutate: login, isPending } = useMutation({
        mutationFn: userLogin,
        onSuccess: () => {
            showAlert('success', 'Welcome back! Redirecting...');
            console.log("Redirecting to:", redirectTo);
            router.push(redirectTo);
        },
        onError: (error) => {
            const errorMessage = mapApiError(error);
            setGeneralError(errorMessage);
            const firstInput = formRef.current?.querySelector('input');
            firstInput?.focus();
        },
    });

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        touchAllFields();

        const validationErrors = validateForm(form);
        if (validationErrors.username || validationErrors.password) {
            return;
        }

        setGeneralError(undefined);

        login({
            username: form.username.trim(),
            password: form.password,
        });
    }, [form, login, touchAllFields, setGeneralError]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isPending) {
            submitButtonRef.current?.click();
        }
    }, [isPending]);

    useEffect(() => {
        const firstInput = formRef.current?.querySelector('input');
        firstInput?.focus();
    }, []);

    return (
        <div className={styles.container}>
            <Head>
                <title>Sign In | Hosten</title>
                <meta name="description" content="Sign in to Hosten to manage your servers and infrastructure." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className={styles.loginWrapper}>
                {/* Visual Side Panel */}
                <div className={styles.visualSide}>
                    <div className={styles.visualContent}>
                        <Link href="/" className={styles.backLink}>
                            ← Back to Home
                        </Link>

                        <div className={styles.brandSection}>
                            <h2>Welcome back</h2>
                            <p>
                                Access your control panel to manage servers,
                                monitor resources, and keep your infrastructure running smoothly.
                            </p>
                        </div>

                        <div className={styles.securityBadge}>
                            <Shield size={16} />
                            <span>Secure, encrypted connection</span>
                        </div>
                    </div>

                    <div className={styles.visualDecoration} aria-hidden="true">
                        <div className={styles.decorCircle1} />
                        <div className={styles.decorCircle2} />
                        <div className={styles.decorGrid} />
                    </div>
                </div>

                {/* Form Side */}
                <div className={styles.formSide}>
                    <header className={styles.header}>
                        <div className={styles.logoMobile}>
                            <Link href="/">Hosten</Link>
                        </div>
                        <h1>Sign in to your account</h1>
                        <p>Enter your credentials to access the dashboard</p>
                    </header>

                    <form ref={formRef} onSubmit={handleSubmit} noValidate>
                        {generalError && (
                            <div className={styles.generalError} role="alert">
                                <AlertCircle size={18} />
                                <span>{generalError}</span>
                            </div>
                        )}

                        <InputField
                            id="username"
                            label="Username"
                            type="text"
                            value={form.username}
                            placeholder="Enter your username"
                            icon={<User size={18} />}
                            error={errors.username}
                            touched={touched.username}
                            disabled={isPending}
                            autoComplete="username"
                            onChange={(v) => updateField('username', v)}
                            onBlur={() => touchField('username')}
                            onKeyDown={handleKeyDown}
                        />

                        <InputField
                            id="password"
                            label="Password"
                            type="password"
                            value={form.password}
                            placeholder="Enter your password"
                            icon={<Lock size={18} />}
                            error={errors.password}
                            touched={touched.password}
                            disabled={isPending}
                            autoComplete="current-password"
                            showPasswordToggle
                            showPassword={showPassword}
                            onTogglePassword={togglePasswordVisibility}
                            onChange={(v) => updateField('password', v)}
                            onBlur={() => touchField('password')}
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            ref={submitButtonRef}
                            type="submit"
                            className={styles.submitButton}
                            disabled={isPending}
                            aria-busy={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 size={20} className={styles.spinner} />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <footer className={styles.formFooter}>
                        <p className={styles.registerPrompt}>
                            Don't have an account?{' '}
                            <Link href="/register">Create one</Link>
                        </p>

                        <div className={styles.securityNote}>
                            <Shield size={14} />
                            <span>Protected by enterprise-grade security</span>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
