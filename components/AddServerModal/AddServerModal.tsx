'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    Server,
    X,
    AlertCircle,
    Loader2,
    Plus,
    CheckCircle2,
    AlertTriangle,
    Key,
    Shield,
    Copy,
    Check,
    ExternalLink,
    Fingerprint
} from 'lucide-react';
import styles from '@/styles/addservermodal.module.scss';
import { CreateServerPayload, CreateServerResponse, ENVIRONMENT_OPTIONS, ServerEnvironment } from '@/types/create-server';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serverService } from '@/services/server-service';
import { useAlert } from '@/context/alert-context';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AddServerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormState {
    name: string;
    environment: ServerEnvironment | '';
    host: string;
    description: string;
}

interface FormErrors {
    name?: string;
    environment?: string;
    host?: string;
}

interface FieldTouched {
    name: boolean;
    environment: boolean;
    host: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

const VALIDATION_RULES = {
    name: {
        minLength: 3,
        maxLength: 64,
        pattern: /^[a-zA-Z0-9_.-]+$/,
    },
    host: {
        minLength: 1,
        maxLength: 255,
        // Accepts IP addresses, hostnames, and domains
        pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-_.]*[a-zA-Z0-9])?$/,
    },
} as const;

function validateName(value: string): string | undefined {
    const trimmed = value.trim();

    if (!trimmed) {
        return 'Server name is required';
    }

    if (trimmed.length < VALIDATION_RULES.name.minLength) {
        return `Name must be at least ${VALIDATION_RULES.name.minLength} characters`;
    }

    if (trimmed.length > VALIDATION_RULES.name.maxLength) {
        return `Name must be less than ${VALIDATION_RULES.name.maxLength} characters`;
    }

    if (!VALIDATION_RULES.name.pattern.test(trimmed)) {
        return 'Name can only contain letters, numbers, dots, hyphens and underscores';
    }

    return undefined;
}

function validateEnvironment(value: string): string | undefined {
    if (!value) {
        return 'Environment is required';
    }

    const validEnvs = ENVIRONMENT_OPTIONS.map(e => e.value);
    if (!validEnvs.includes(value as ServerEnvironment)) {
        return 'Please select a valid environment';
    }

    return undefined;
}

function validateHost(value: string): string | undefined {
    const trimmed = value.trim();

    if (!trimmed) {
        return 'Host is required';
    }

    if (trimmed.length > VALIDATION_RULES.host.maxLength) {
        return `Host must be less than ${VALIDATION_RULES.host.maxLength} characters`;
    }

    // Basic validation - allow IPs and hostnames
    if (!VALIDATION_RULES.host.pattern.test(trimmed) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) {
        return 'Please enter a valid hostname or IP address';
    }

    return undefined;
}

function validateForm(form: FormState): FormErrors {
    return {
        name: validateName(form.name),
        environment: validateEnvironment(form.environment),
        host: validateHost(form.host),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hook: Form State
// ─────────────────────────────────────────────────────────────────────────────

function useAddServerForm() {
    const [form, setForm] = useState<FormState>({
        name: '',
        environment: '',
        host: '',
        description: '',
    });

    const [touched, setTouched] = useState<FieldTouched>({
        name: false,
        environment: false,
        host: false,
    });

    const errors = useMemo(() => validateForm(form), [form]);

    const isValid = useMemo(() => {
        return !errors.name && !errors.environment && !errors.host &&
            form.name && form.environment && form.host;
    }, [errors, form]);

    const updateField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const touchField = useCallback((field: keyof FieldTouched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    const touchAllFields = useCallback(() => {
        setTouched({ name: true, environment: true, host: true });
    }, []);

    const resetForm = useCallback(() => {
        setForm({ name: '', environment: '', host: '', description: '' });
        setTouched({ name: false, environment: false, host: false });
    }, []);

    return {
        form,
        errors,
        touched,
        isValid,
        updateField,
        touchField,
        touchAllFields,
        resetForm,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component: Add Server Modal
// ─────────────────────────────────────────────────────────────────────────────

export function AddServerModal({ isOpen, onClose }: AddServerModalProps) {
    const {
        form,
        errors,
        touched,
        isValid,
        updateField,
        touchField,
        touchAllFields,
        resetForm,
    } = useAddServerForm();

    const { showAlert } = useAlert();
    const queryClient = useQueryClient();
    const formRef = useRef<HTMLFormElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    // Success state
    const [credentials, setCredentials] = useState<CreateServerResponse | null>(null);
    const [acknowledged, setAcknowledged] = useState(false);
    const [copiedField, setCopiedField] = useState<'clientId' | 'clientSecret' | null>(null);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Delay reset to allow close animation
            const timer = setTimeout(() => {
                resetForm();
                setCredentials(null);
                setAcknowledged(false);
                setCopiedField(null);
            }, 200);
            return () => clearTimeout(timer);
        } else {
            // Focus first input when modal opens
            setTimeout(() => firstInputRef.current?.focus(), 100);
        }
    }, [isOpen, resetForm]);

    // Mutation for creating server
    const { mutate: createServer, isPending } = useMutation({
        mutationFn: serverService.createServer,
        onSuccess: (data: CreateServerResponse) => {
            setCredentials(data);
            queryClient.invalidateQueries({ queryKey: ['servers'] });
        },
        onError: (error: Error) => {
            showAlert('error', error.message || 'Failed to create server. Please try again.');
        },
    });

    // Handle form submission
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        touchAllFields();

        const validationErrors = validateForm(form);
        if (validationErrors.name || validationErrors.environment || validationErrors.host) {
            return;
        }

        const payload: CreateServerPayload = {
            name: form.name.trim(),
            environment: form.environment as ServerEnvironment,
            host: form.host.trim(),
            description: form.description.trim() || undefined,
        };

        createServer(payload);
    }, [form, createServer, touchAllFields]);

    // Handle copy to clipboard
    const handleCopy = useCallback(async (field: 'clientId' | 'clientSecret', value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            showAlert('success', `${field === 'clientId' ? 'Client ID' : 'Client Secret'} copied to clipboard`);

            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            showAlert('error', 'Failed to copy to clipboard');
        }
    }, [showAlert]);

    // Handle close with confirmation
    const handleClose = useCallback(() => {
        if (credentials && !acknowledged) {
            // Prevent closing without acknowledgment
            showAlert('warning', 'Please confirm you have saved the credentials before closing');
            return;
        }
        onClose();
    }, [credentials, acknowledged, onClose, showAlert]);

    // Handle backdrop click
    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            if (!credentials) {
                onClose();
            } else {
                handleClose();
            }
        }
    }, [credentials, onClose, handleClose]);

    // Handle keyboard escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                if (!credentials) {
                    onClose();
                } else {
                    handleClose();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, credentials, onClose, handleClose]);

    if (!isOpen) return null;

    // ─────────────────────────────────────────────────────────────────────────
    // Success View (after server creation)
    // ─────────────────────────────────────────────────────────────────────────

    if (credentials) {
        return (
            <div className={styles.overlay} onClick={handleOverlayClick}>
                <div
                    className={styles.modal}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="success-title"
                >
                    <div className={styles.successView}>
                        <div className={styles.successHeader}>
                            <div className={styles.successIcon}>
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 id="success-title">Server Created Successfully</h3>
                            <p>Your server has been registered. Save these credentials securely.</p>
                        </div>

                        {/* Security Warning */}
                        <div className={styles.securityWarning}>
                            <AlertTriangle size={24} className={styles.warningIcon} />
                            <div className={styles.warningContent}>
                                <h4>Important Security Notice</h4>
                                <p>
                                    The <strong>Client Secret</strong> will only be shown once and cannot be retrieved later.
                                    Store it in a secure location immediately. You will need both credentials to configure your server agent.
                                </p>
                            </div>
                        </div>

                        {/* Credentials */}
                        <div className={styles.credentialsSection}>
                            {/* Client ID */}
                            <div className={styles.credentialBox}>
                                <div className={styles.credentialLabel}>
                                    <Fingerprint size={16} />
                                    <span>Client ID</span>
                                </div>
                                <div className={styles.credentialValue}>
                                    <code>{credentials.clientId}</code>
                                    <button
                                        type="button"
                                        className={`${styles.copyBtn} ${copiedField === 'clientId' ? styles.copied : ''}`}
                                        onClick={() => handleCopy('clientId', credentials.clientId)}
                                    >
                                        {copiedField === 'clientId' ? (
                                            <>
                                                <Check size={14} />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Client Secret */}
                            <div className={`${styles.credentialBox} ${styles.secret}`}>
                                <div className={styles.credentialLabel}>
                                    <Key size={16} />
                                    <span>Client Secret (save this now!)</span>
                                </div>
                                <div className={styles.credentialValue}>
                                    <code>{credentials.clientSecret}</code>
                                    <button
                                        type="button"
                                        className={`${styles.copyBtn} ${copiedField === 'clientSecret' ? styles.copied : ''}`}
                                        onClick={() => handleCopy('clientSecret', credentials.clientSecret)}
                                    >
                                        {copiedField === 'clientSecret' ? (
                                            <>
                                                <Check size={14} />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Acknowledgment Checkbox */}
                        <div
                            className={`${styles.acknowledgment} ${acknowledged ? styles.checked : ''}`}
                            onClick={() => setAcknowledged(!acknowledged)}
                        >
                            <input
                                type="checkbox"
                                id="acknowledge-credentials"
                                className={styles.checkbox}
                                checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                            />
                            <label htmlFor="acknowledge-credentials">
                                I confirm that I have securely saved the <strong>Client ID</strong> and <strong>Client Secret</strong>.
                                I understand the secret will not be shown again.
                            </label>
                        </div>

                        {/* Documentation Link */}
                        <a href="/docs/server-agent" className={styles.docLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} />
                            Learn how to configure the server agent
                        </a>

                        {/* Actions */}
                        <div className={styles.successActions}>
                            <button
                                type="button"
                                className={styles.btnDone}
                                onClick={onClose}
                                disabled={!acknowledged}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Form View
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Plus size={24} />
                    </div>
                    <div className={styles.titleContent}>
                        <h2 id="modal-title">Add New Server</h2>
                        <p>Register a server to monitor and manage.</p>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                        disabled={isPending}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
                    {/* Server Name */}
                    <div className={`${styles.inputGroup} ${touched.name && errors.name ? styles.hasError : ''}`}>
                        <label htmlFor="server-name">
                            Server Name
                            <span className={styles.required}>*</span>
                        </label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <Server size={18} />
                            </span>
                            <input
                                ref={firstInputRef}
                                id="server-name"
                                type="text"
                                className={styles.formInput}
                                value={form.name}
                                placeholder="e.g., production-api-01"
                                disabled={isPending}
                                autoComplete="off"
                                aria-invalid={touched.name && !!errors.name}
                                aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
                                onChange={(e) => updateField('name', e.target.value)}
                                onBlur={() => touchField('name')}
                            />
                        </div>
                        {touched.name && errors.name && (
                            <span id="name-error" className={styles.errorMessage} role="alert">
                                <AlertCircle size={14} />
                                {errors.name}
                            </span>
                        )}
                    </div>

                    {/* Environment */}
                    <div className={`${styles.inputGroup} ${touched.environment && errors.environment ? styles.hasError : ''}`}>
                        <label htmlFor="server-environment">
                            Environment
                            <span className={styles.required}>*</span>
                        </label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <Shield size={18} />
                            </span>
                            <select
                                id="server-environment"
                                className={styles.formSelect}
                                value={form.environment}
                                disabled={isPending}
                                aria-invalid={touched.environment && !!errors.environment}
                                aria-describedby={touched.environment && errors.environment ? 'environment-error' : undefined}
                                onChange={(e) => updateField('environment', e.target.value as ServerEnvironment | '')}
                                onBlur={() => touchField('environment')}
                            >
                                <option value="">Select environment...</option>
                                {ENVIRONMENT_OPTIONS.map((env) => (
                                    <option key={env.value} value={env.value}>
                                        {env.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {touched.environment && errors.environment && (
                            <span id="environment-error" className={styles.errorMessage} role="alert">
                                <AlertCircle size={14} />
                                {errors.environment}
                            </span>
                        )}
                    </div>

                    {/* Host */}
                    <div className={`${styles.inputGroup} ${touched.host && errors.host ? styles.hasError : ''}`}>
                        <label htmlFor="server-host">
                            Host
                            <span className={styles.required}>*</span>
                        </label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <Server size={18} />
                            </span>
                            <input
                                id="server-host"
                                type="text"
                                className={styles.formInput}
                                value={form.host}
                                placeholder="e.g., 192.168.1.100 or api.example.com"
                                disabled={isPending}
                                autoComplete="off"
                                aria-invalid={touched.host && !!errors.host}
                                aria-describedby={touched.host && errors.host ? 'host-error' : undefined}
                                onChange={(e) => updateField('host', e.target.value)}
                                onBlur={() => touchField('host')}
                            />
                        </div>
                        {touched.host && errors.host && (
                            <span id="host-error" className={styles.errorMessage} role="alert">
                                <AlertCircle size={14} />
                                {errors.host}
                            </span>
                        )}
                    </div>

                    {/* Description (Optional) */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="server-description">
                            Description
                            <span className={styles.optional}>(optional)</span>
                        </label>
                        <div className={styles.inputWrapper}>
                            <textarea
                                id="server-description"
                                className={styles.formTextarea}
                                value={form.description}
                                placeholder="Add notes about this server's purpose or configuration..."
                                disabled={isPending}
                                style={{ paddingLeft: '1rem' }}
                                onChange={(e) => updateField('description', e.target.value)}
                            />
                        </div>
                    </div>
                </form>

                {/* Actions */}
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnCancel}`}
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnSubmit}`}
                        disabled={isPending || !isValid}
                        onClick={handleSubmit}
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={18} className={styles.spinner} />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Add Server
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddServerModal;
