import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    Lock,
    ArrowRight,
    Mail,
    Shield,
    AlertCircle,
    Loader2,
    User,
    CheckCircle2,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import styles from '@/styles/register.module.scss';
import { useAlert } from '@/context/alert-context';
import userRegister from '@/services/register-service';
import type { RegisterFormData, RegisterPayload } from '@/types/register-type';
import { InputField } from '@/components/InputField';
import {
    PasswordStrengthIndicator,
    calculatePasswordStrength,
    type PasswordStrengthResult,
} from '@/components/PasswordStrengthIndicator';

// ─────────────────────────────────────────────────────────────────────────────
// Validation Rules & Constants
// ─────────────────────────────────────────────────────────────────────────────

const VALIDATION_RULES = {
    name: {
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ÿ0-9\s'-]+$/,
    },
    email: {
        maxLength: 254,
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: {
        minLength: 8,
        maxLength: 128,
    },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Validation Functions
// ─────────────────────────────────────────────────────────────────────────────

function validateName(value: string): string | undefined {
    const trimmed = value.trim();

    if (!trimmed) {
        return 'Username is required';
    }

    if (trimmed.length < VALIDATION_RULES.name.minLength) {
        return `Username must be at least ${VALIDATION_RULES.name.minLength} characters`;
    }

    if (trimmed.length > VALIDATION_RULES.name.maxLength) {
        return `Username must be less than ${VALIDATION_RULES.name.maxLength} characters`;
    }

    if (!VALIDATION_RULES.name.pattern.test(trimmed)) {
        return 'Please enter a valid username';
    }

    return undefined;
}

function validateEmail(value: string): string | undefined {
    const trimmed = value.trim().toLowerCase();

    if (!trimmed) {
        return 'Email address is required';
    }

    if (trimmed.length > VALIDATION_RULES.email.maxLength) {
        return 'Email address is too long';
    }

    if (!VALIDATION_RULES.email.pattern.test(trimmed)) {
        return 'Please enter a valid email address';
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

function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
    if (!confirmPassword) {
        return 'Please confirm your password';
    }

    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }

    return undefined;
}

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

interface FieldTouched {
    username: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
}

function validateForm(form: RegisterFormData): FormErrors {
    return {
        username: validateName(form.username),
        email: validateEmail(form.email),
        password: validatePassword(form.password),
        confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Message Mapping
// ─────────────────────────────────────────────────────────────────────────────

function mapApiError(error: unknown): string {
    if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.response?.data?.error?.details?.[0]?.message;

        switch (status) {
            case 400:
                if (message?.toLowerCase().includes('email')) {
                    return 'This email address is already registered.';
                }
                return 'Please check your information and try again.';
            case 409:
                return 'An account with this email already exists.';
            case 422:
                return 'Please verify your information and try again.';
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
                return 'Unable to create account. Please try again.';
        }
    }

    return 'An unexpected error occurred. Please try again.';
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hook: Form State Management
// ─────────────────────────────────────────────────────────────────────────────

function useRegisterForm() {
    const [form, setForm] = useState<RegisterFormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [touched, setTouched] = useState<FieldTouched>({
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [generalError, setGeneralError] = useState<string | undefined>();

    const errors = useMemo(() => validateForm(form), [form]);

    const passwordStrength = useMemo<PasswordStrengthResult>(
        () => calculatePasswordStrength(form.password),
        [form.password]
    );

    const isValid = useMemo(() => {
        return (
            !errors.username &&
            !errors.email &&
            !errors.password &&
            !errors.confirmPassword &&
            form.username &&
            form.email &&
            form.password &&
            form.confirmPassword
        );
    }, [errors, form]);

    const updateField = useCallback(
        (field: keyof RegisterFormData, value: string) => {
            setForm((prev) => ({ ...prev, [field]: value }));
            if (generalError) {
                setGeneralError(undefined);
            }
        },
        [generalError]
    );

    const touchField = useCallback((field: keyof RegisterFormData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }, []);

    const touchAllFields = useCallback(() => {
        setTouched({
            username: true,
            email: true,
            password: true,
            confirmPassword: true,
        });
    }, []);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword((prev) => !prev);
    }, []);

    const resetForm = useCallback(() => {
        setForm({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        });
        setTouched({
            username: false,
            email: false,
            password: false,
            confirmPassword: false,
        });
        setGeneralError(undefined);
    }, []);

    return {
        form,
        errors,
        touched,
        showPassword,
        showConfirmPassword,
        generalError,
        passwordStrength,
        isValid,
        updateField,
        touchField,
        touchAllFields,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility,
        setGeneralError,
        resetForm,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component: Register Page
// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
    const {
        form,
        errors,
        touched,
        showPassword,
        showConfirmPassword,
        generalError,
        passwordStrength,
        updateField,
        touchField,
        touchAllFields,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility,
        setGeneralError,
        resetForm,
    } = useRegisterForm();

    const { showAlert } = useAlert();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const { mutate: register, isPending } = useMutation({
        mutationFn: userRegister,
        onSuccess: () => {
            setIsSuccess(true);
            showAlert('success', 'Account created successfully!');
            resetForm();
            setTimeout(() => {
                router.push('/servers');
            }, 2000);
        },
        onError: (error) => {
            const errorMessage = mapApiError(error);
            setGeneralError(errorMessage);
            const firstInput = formRef.current?.querySelector('input');
            firstInput?.focus();
        },
    });

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            touchAllFields();

            const validationErrors = validateForm(form);
            if (
                validationErrors.username ||
                validationErrors.email ||
                validationErrors.password ||
                validationErrors.confirmPassword
            ) {
                return;
            }

            setGeneralError(undefined);
            setIsSuccess(false);

            const payload: RegisterPayload = {
                username: form.username.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
            };

            register(payload);
        },
        [form, register, touchAllFields, setGeneralError]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !isPending) {
                submitButtonRef.current?.click();
            }
        },
        [isPending]
    );

    useEffect(() => {
        const firstInput = formRef.current?.querySelector('input');
        firstInput?.focus();
    }, []);

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Account | Hosten</title>
                <meta
                    name="description"
                    content="Create your Hosten account to manage your servers and infrastructure securely."
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className={styles.registerWrapper}>
                {/* Visual Side Panel */}
                <div className={styles.visualSide}>
                    <div className={styles.visualContent}>
                        <Link href="/" className={styles.backLink}>
                            ← Back to Home
                        </Link>

                        <div className={styles.brandSection}>
                            <h2>Join Hosten</h2>
                            <p>
                                Create your account to access powerful server management tools.
                                Your infrastructure, your control.
                            </p>
                        </div>

                        <div className={styles.securityBadge}>
                            <Shield size={16} />
                            <span>Secure account creation</span>
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
                        <h1>Create your account</h1>
                        <p>Enter your details to get started</p>
                    </header>

                    <form ref={formRef} onSubmit={handleSubmit} noValidate>
                        {generalError && (
                            <div className={styles.generalError} role="alert">
                                <AlertCircle size={18} />
                                <span>{generalError}</span>
                            </div>
                        )}

                        {isSuccess && (
                            <div className={styles.successMessage} role="status">
                                <CheckCircle2 size={18} />
                                <span>Account created successfully! Redirecting to login...</span>
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
                            disabled={isPending || isSuccess}
                            autoComplete="name"
                            onChange={(v) => updateField('username', v)}
                            onBlur={() => touchField('username')}
                            onKeyDown={handleKeyDown}
                        />

                        <InputField
                            id="email"
                            label="Email address"
                            type="email"
                            value={form.email}
                            placeholder="Enter your email address"
                            icon={<Mail size={18} />}
                            error={errors.email}
                            touched={touched.email}
                            disabled={isPending || isSuccess}
                            autoComplete="email"
                            onChange={(v) => updateField('email', v)}
                            onBlur={() => touchField('email')}
                            onKeyDown={handleKeyDown}
                        />

                        <InputField
                            id="password"
                            label="Password"
                            type="password"
                            value={form.password}
                            placeholder="Create a password"
                            icon={<Lock size={18} />}
                            error={errors.password}
                            touched={touched.password}
                            disabled={isPending || isSuccess}
                            autoComplete="new-password"
                            showPasswordToggle
                            showPassword={showPassword}
                            onTogglePassword={togglePasswordVisibility}
                            onChange={(v) => updateField('password', v)}
                            onBlur={() => touchField('password')}
                            onKeyDown={handleKeyDown}
                        >
                            <PasswordStrengthIndicator
                                strength={passwordStrength}
                                show={form.password.length > 0 && !errors.password}
                            />
                        </InputField>

                        <InputField
                            id="confirmPassword"
                            label="Confirm password"
                            type="password"
                            value={form.confirmPassword}
                            placeholder="Confirm your password"
                            icon={<Lock size={18} />}
                            error={errors.confirmPassword}
                            touched={touched.confirmPassword}
                            disabled={isPending || isSuccess}
                            autoComplete="new-password"
                            showPasswordToggle
                            showPassword={showConfirmPassword}
                            onTogglePassword={toggleConfirmPasswordVisibility}
                            onChange={(v) => updateField('confirmPassword', v)}
                            onBlur={() => touchField('confirmPassword')}
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            ref={submitButtonRef}
                            type="submit"
                            className={styles.submitButton}
                            disabled={isPending || isSuccess}
                            aria-busy={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 size={20} className={styles.spinner} />
                                    Creating account...
                                </>
                            ) : isSuccess ? (
                                <>
                                    <CheckCircle2 size={20} />
                                    Account created
                                </>
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <footer className={styles.formFooter}>
                        <p className={styles.loginPrompt}>
                            Already have an account?{' '}
                            <Link href="/login">Sign in</Link>
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
