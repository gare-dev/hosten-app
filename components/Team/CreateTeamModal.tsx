'use client';

import React, { useState, useCallback } from 'react';
import { X, Users, Loader2, AlertCircle } from 'lucide-react';
import styles from '@/styles/createteammodal.module.scss';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/services/team-service';
import { useAlert } from '@/context/alert-context';
import { useTeam } from '@/context/team-context';
import { CreateTeamPayload } from '@/types/team';

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormState {
    name: string;
    description: string;
}

interface FormErrors {
    name?: string;
}

export function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
    const queryClient = useQueryClient();
    const { showAlert } = useAlert();
    const { selectTeam } = useTeam();

    const [form, setForm] = useState<FormState>({
        name: '',
        description: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<{ name: boolean }>({ name: false });

    const validateName = (value: string): string | undefined => {
        const trimmed = value.trim();
        if (!trimmed) return 'Team name is required';
        if (trimmed.length < 2) return 'Name must be at least 2 characters';
        if (trimmed.length > 50) return 'Name must be less than 50 characters';
        return undefined;
    };

    const mutation = useMutation({
        mutationFn: (data: CreateTeamPayload) => teamService.createTeam(data),
        onSuccess: (team) => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            showAlert('success', `Team "${team.name}" created successfully!`);
            selectTeam(team.id);
            handleClose();
        },
        onError: (error: any) => {
            showAlert('error', error?.response?.data?.message || 'Failed to create team');
        }
    });

    const handleClose = useCallback(() => {
        setForm({ name: '', description: '' });
        setErrors({});
        setTouched({ name: false });
        onClose();
    }, [onClose]);

    const handleChange = (field: keyof FormState) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = e.target.value;
        setForm(prev => ({ ...prev, [field]: value }));

        if (field === 'name' && touched.name) {
            setErrors(prev => ({ ...prev, name: validateName(value) }));
        }
    };

    const handleBlur = (field: keyof FormState) => () => {
        setTouched(prev => ({ ...prev, [field]: true }));
        if (field === 'name') {
            setErrors(prev => ({ ...prev, name: validateName(form.name) }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const nameError = validateName(form.name);
        setErrors({ name: nameError });
        setTouched({ name: true });

        if (nameError) return;

        mutation.mutate({
            name: form.name.trim(),
            description: form.description.trim() || undefined
        });
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Users size={24} />
                    </div>
                    <div className={styles.titleContent}>
                        <h2>Create New Team</h2>
                        <p>Set up a new team to collaborate with others</p>
                    </div>
                    <button className={styles.closeButton} onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={`${styles.inputGroup} ${errors.name && touched.name ? styles.hasError : ''}`}>
                        <label>
                            Team Name <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="e.g., Engineering Team"
                            value={form.name}
                            onChange={handleChange('name')}
                            onBlur={handleBlur('name')}
                            disabled={mutation.isPending}
                        />
                        {errors.name && touched.name && (
                            <div className={styles.errorMessage}>
                                <AlertCircle size={14} />
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label>
                            Description <span className={styles.optional}>(optional)</span>
                        </label>
                        <textarea
                            className={styles.formTextarea}
                            placeholder="What does this team work on?"
                            value={form.description}
                            onChange={handleChange('description')}
                            disabled={mutation.isPending}
                            rows={3}
                        />
                    </div>

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
                                'Create Team'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
