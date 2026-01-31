'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { X, UserPlus, Loader2, AlertCircle, Copy, Check, Link as LinkIcon, Mail } from 'lucide-react';
import styles from '@/styles/invitemembermodal.module.scss';
import { useMutation } from '@tanstack/react-query';
import { teamService } from '@/services/team-service';
import { useAlert } from '@/context/alert-context';
import { useTeam } from '@/context/team-context';
import {
    CreateInvitationPayload,
    TeamRole,
    TEAM_ROLES,
    TeamPermissionAction,
    DEFAULT_ROLE_PERMISSIONS,
    PERMISSION_GROUPS
} from '@/types/team';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface FormState {
    email: string;
    role: TeamRole;
    message: string;
    customPermissions: boolean;
    permissions: TeamPermissionAction[];
}

export function InviteMemberModal({ isOpen, onClose, onSuccess }: InviteMemberModalProps) {
    const { showAlert } = useAlert();
    const { currentTeam } = useTeam();

    const [form, setForm] = useState<FormState>({
        email: '',
        role: 'member',
        message: '',
        customPermissions: false,
        permissions: DEFAULT_ROLE_PERMISSIONS['member']
    });

    const [errors, setErrors] = useState<{ email?: string }>({});
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Reset permissions when role changes (unless custom)
    useEffect(() => {
        if (!form.customPermissions) {
            setForm(prev => ({
                ...prev,
                permissions: DEFAULT_ROLE_PERMISSIONS[prev.role]
            }));
        }
    }, [form.role, form.customPermissions]);

    const mutation = useMutation({
        mutationFn: (data: CreateInvitationPayload) => teamService.createInvitation(data),
        onSuccess: (response) => {
            setInviteLink(response.inviteLink);
            showAlert('success', 'Invitation created successfully!');
            onSuccess?.();
        },
        onError: (error: any) => {
            showAlert('error', error?.response?.data?.message || 'Failed to create invitation');
        }
    });

    const validateEmail = (email: string): string | undefined => {
        const trimmed = email.trim();
        if (!trimmed) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return 'Please enter a valid email address';
        return undefined;
    };

    const handleClose = useCallback(() => {
        setForm({
            email: '',
            role: 'member',
            message: '',
            customPermissions: false,
            permissions: DEFAULT_ROLE_PERMISSIONS['member']
        });
        setErrors({});
        setInviteLink(null);
        setCopied(false);
        onClose();
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentTeam) {
            showAlert('error', 'No team selected');
            return;
        }

        const emailError = validateEmail(form.email);
        setErrors({ email: emailError });

        if (emailError) return;

        mutation.mutate({
            teamId: currentTeam.id,
            email: form.email.trim(),
            role: form.role,
            permissions: form.customPermissions ? form.permissions : undefined,
            message: form.message.trim() || undefined
        });
    };

    const handleCopyLink = async () => {
        if (!inviteLink) return;

        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            showAlert('success', 'Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showAlert('error', 'Failed to copy link');
        }
    };

    const togglePermission = (permission: TeamPermissionAction) => {
        setForm(prev => ({
            ...prev,
            customPermissions: true,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <UserPlus size={24} />
                    </div>
                    <div className={styles.titleContent}>
                        <h2>Invite Team Member</h2>
                        <p>Send an invitation to join {currentTeam?.name}</p>
                    </div>
                    <button className={styles.closeButton} onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                {inviteLink ? (
                    <div className={styles.successContent}>
                        <div className={styles.successIcon}>
                            <Check size={32} />
                        </div>
                        <h3>Invitation Created!</h3>
                        <p>Share this link with the person you want to invite:</p>

                        <div className={styles.linkBox}>
                            <LinkIcon size={16} />
                            <span className={styles.link}>{inviteLink}</span>
                            <button
                                className={styles.copyBtn}
                                onClick={handleCopyLink}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>

                        <p className={styles.expiryNote}>
                            This link will expire in 7 days.
                        </p>

                        <div className={styles.actions}>
                            <button
                                className={styles.btnPrimary}
                                onClick={handleClose}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={`${styles.inputGroup} ${errors.email ? styles.hasError : ''}`}>
                            <label>
                                <Mail size={14} />
                                Email Address <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="email"
                                className={styles.formInput}
                                placeholder="colleague@example.com"
                                value={form.email}
                                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                disabled={mutation.isPending}
                            />
                            {errors.email && (
                                <div className={styles.errorMessage}>
                                    <AlertCircle size={14} />
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Role</label>
                            <div className={styles.roleSelector}>
                                {TEAM_ROLES.filter(r => r.value !== 'owner').map(role => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        className={`${styles.roleOption} ${form.role === role.value ? styles.active : ''}`}
                                        onClick={() => setForm(prev => ({ ...prev, role: role.value }))}
                                        disabled={mutation.isPending}
                                    >
                                        <span
                                            className={styles.roleIndicator}
                                            style={{ backgroundColor: role.color }}
                                        />
                                        <div className={styles.roleInfo}>
                                            <span className={styles.roleName}>{role.label}</span>
                                            <span className={styles.roleDesc}>{role.description}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>
                                Personal Message <span className={styles.optional}>(optional)</span>
                            </label>
                            <textarea
                                className={styles.formTextarea}
                                placeholder="Add a personal note to the invitation..."
                                value={form.message}
                                onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                                disabled={mutation.isPending}
                                rows={2}
                            />
                        </div>

                        <details className={styles.permissionsAccordion}>
                            <summary>
                                Customize Permissions
                                {form.customPermissions && (
                                    <span className={styles.customBadge}>Custom</span>
                                )}
                            </summary>
                            <div className={styles.permissionGroups}>
                                {PERMISSION_GROUPS.map(group => (
                                    <div key={group.scope} className={styles.permissionGroup}>
                                        <h4>{group.label}</h4>
                                        <div className={styles.permissionList}>
                                            {group.permissions.map(perm => (
                                                <label key={perm.action} className={styles.permissionItem}>
                                                    <input
                                                        type="checkbox"
                                                        checked={form.permissions.includes(perm.action)}
                                                        onChange={() => togglePermission(perm.action)}
                                                        disabled={mutation.isPending}
                                                    />
                                                    <span className={styles.permLabel}>{perm.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.btnSecondary}
                                onClick={handleClose}
                                disabled={mutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.btnPrimary}
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 size={18} className={styles.spinner} />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
