import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Settings,
    Save,
    Trash2,
    AlertTriangle,
    Loader2,
    AlertCircle,
    Upload,
    Users
} from 'lucide-react';
import styles from '@/styles/teamsettings.module.scss';
import TeamLayout from '@/components/Layout/TeamLayout';
import { teamService } from '@/services/team-service';
import { useTeam } from '@/context/team-context';
import { useAlert } from '@/context/alert-context';
import { useConfirm } from '@/context/confirm-context';

export default function TeamSettingsPage() {
    const router = useRouter();
    const { teamId } = router.query as { teamId: string };
    const queryClient = useQueryClient();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();
    const { refreshTeams, selectTeam, isOwner, isAdmin } = useTeam();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch team data
    const { data: team, isLoading, error } = useQuery({
        queryKey: ['team', teamId],
        queryFn: () => teamService.getTeam(teamId),
        enabled: !!teamId
    });

    // Update form when team data loads
    useEffect(() => {
        if (team?.team) {
            setName(team.team.name);
            setDescription(team.team.description || '');
            setAvatarUrl(team.team.avatarUrl || '');
        }
    }, [team]);

    // Track changes
    useEffect(() => {
        if (team?.team) {
            const changed =
                name !== team.team.name ||
                description !== (team.team.description || '') ||
                avatarUrl !== (team.team.avatarUrl || '');
            setHasChanges(changed);
        }
    }, [name, description, avatarUrl, team]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: () => teamService.updateTeam(teamId, { name, description, avatarUrl }),
        onSuccess: () => {
            showAlert('success', 'Team settings updated successfully');
            queryClient.invalidateQueries({ queryKey: ['team', teamId] });
            refreshTeams();
            setHasChanges(false);
        },
        onError: () => {
            showAlert('error', 'Failed to update team settings');
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: () => teamService.deleteTeam(teamId),
        onSuccess: () => {
            showAlert('success', 'Team deleted successfully');
            refreshTeams();
            selectTeam(null);
            router.push('/teams');
        },
        onError: () => {
            showAlert('error', 'Failed to delete team');
        }
    });

    const handleSave = () => {
        if (!name.trim()) {
            showAlert('error', 'Team name is required');
            return;
        }
        updateMutation.mutate();
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Team',
            message: `Are you sure you want to delete "${team?.team?.name}"? This action cannot be undone and will remove all team data, including server associations and member access.`,
            confirmText: 'Delete Team',
            cancelText: 'Cancel',
            variant: 'danger'
        });

        if (confirmed) {
            deleteMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <TeamLayout>
                <div className={styles.loading}>
                    <Loader2 size={24} className={styles.spinner} />
                    <span>Loading settings...</span>
                </div>
            </TeamLayout>
        );
    }

    if (error || !team?.team) {
        return (
            <TeamLayout>
                <div className={styles.error}>
                    <AlertCircle size={48} />
                    <p>Failed to load team settings</p>
                </div>
            </TeamLayout>
        );
    }

    const canEdit = isOwner() || isAdmin();

    return (
        <TeamLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>
                        <Settings size={24} />
                        Team Settings
                    </h1>
                </div>

                <div className={styles.content}>
                    {/* General Settings */}
                    <section className={styles.section}>
                        <h2>General</h2>
                        <p className={styles.sectionDesc}>
                            Basic information about your team
                        </p>

                        <div className={styles.formGroup}>
                            <label htmlFor="teamName">Team Name</label>
                            <input
                                id="teamName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter team name"
                                disabled={!canEdit}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What does this team do?"
                                rows={3}
                                disabled={!canEdit}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="avatarUrl">Avatar URL</label>
                            <div className={styles.avatarInput}>
                                <div className={styles.avatarPreview}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Team avatar" />
                                    ) : (
                                        <Users size={24} />
                                    )}
                                </div>
                                <input
                                    id="avatarUrl"
                                    type="url"
                                    value={avatarUrl}
                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                    placeholder="https://example.com/avatar.png"
                                    disabled={!canEdit}
                                />
                            </div>
                            <span className={styles.hint}>
                                Enter a URL for your team's avatar image
                            </span>
                        </div>

                        {canEdit && hasChanges && (
                            <button
                                className={styles.saveBtn}
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 size={18} className={styles.spinner} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        )}
                    </section>

                    {/* Danger Zone */}
                    {isOwner() && (
                        <section className={`${styles.section} ${styles.dangerZone}`}>
                            <h2>
                                <AlertTriangle size={20} />
                                Danger Zone
                            </h2>
                            <p className={styles.sectionDesc}>
                                Irreversible and destructive actions
                            </p>

                            <div className={styles.dangerAction}>
                                <div>
                                    <h3>Delete this team</h3>
                                    <p>
                                        Once you delete a team, there is no going back.
                                        All servers will be unlinked and members will lose access.
                                    </p>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? (
                                        <>
                                            <Loader2 size={18} className={styles.spinner} />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={18} />
                                            Delete Team
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </TeamLayout>
    );
}
