import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    UserPlus,
    Mail,
    Clock,
    Copy,
    Check,
    Trash2,
    RefreshCw,
    Loader2,
    Link as LinkIcon,
    AlertCircle
} from 'lucide-react';
import styles from '@/styles/teaminvitations.module.scss';
import TeamLayout from '@/components/Layout/TeamLayout';
import { teamService } from '@/services/team-service';
import { useTeam, RequirePermission } from '@/context/team-context';
import { useAlert } from '@/context/alert-context';
import { useConfirm } from '@/context/confirm-context';
import { InviteMemberModal, RoleBadge } from '@/components/Team';
import { TeamInvitation, InvitationStatus } from '@/types/team';

export default function TeamInvitationsPage() {
    const router = useRouter();
    const { teamId, new: openNew } = router.query as { teamId: string; new?: string };
    const queryClient = useQueryClient();
    const { selectTeam, currentTeam, currentTeamDetails, isLoadingTeam, refreshCurrentTeam } = useTeam();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<InvitationStatus | 'all'>('all');

    // Open modal if ?new=true
    useEffect(() => {
        if (openNew === 'true') {
            setIsInviteModalOpen(true);
            // Clean URL
            router.replace(`/team/${teamId}/invitations`, undefined, { shallow: true });
        }
    }, [openNew, teamId, router]);

    // Select team based on URL param
    useEffect(() => {
        if (teamId) {
            selectTeam(teamId);
        }
    }, [teamId, selectTeam]);

    const revokeMutation = useMutation({
        mutationFn: (invitationId: string) =>
            teamService.revokeInvitation(teamId, invitationId),
        onSuccess: () => {
            showAlert('success', 'Invitation revoked');
            refreshCurrentTeam();
        },
        onError: (error: any) => {
            showAlert('error', error?.response?.data?.message || 'Failed to revoke invitation');
        }
    });

    const resendMutation = useMutation({
        mutationFn: (invitationId: string) =>
            teamService.resendInvitation(teamId, invitationId),
        onSuccess: () => {
            showAlert('success', 'Invitation resent');
            refreshCurrentTeam();
        },
        onError: (error: any) => {
            showAlert('error', error?.response?.data?.message || 'Failed to resend invitation');
        }
    });

    const handleCopyLink = async (invitation: TeamInvitation) => {
        const link = `${window.location.origin}/invite/${invitation.token}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopiedId(invitation.id);
            showAlert('success', 'Link copied to clipboard!');
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            showAlert('error', 'Failed to copy link');
        }
    };

    const handleRevoke = async (invitation: TeamInvitation) => {
        const confirmed = await confirm({
            title: 'Revoke Invitation',
            message: `Are you sure you want to revoke the invitation for ${invitation.email}?`,
            confirmText: 'Revoke',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            revokeMutation.mutate(invitation.id);
        }
    };

    const invitations = currentTeamDetails?.invitations || [];

    // Filter invitations
    const filteredInvitations = invitations.filter(inv =>
        statusFilter === 'all' || inv.status === statusFilter
    );

    const getStatusBadge = (status: InvitationStatus) => {
        const statusConfig: Record<InvitationStatus, { label: string; className: string }> = {
            pending: { label: 'Pending', className: styles.pending },
            accepted: { label: 'Accepted', className: styles.accepted },
            expired: { label: 'Expired', className: styles.expired },
            revoked: { label: 'Revoked', className: styles.revoked }
        };

        const config = statusConfig[status];
        return <span className={`${styles.statusBadge} ${config.className}`}>{config.label}</span>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };

    if (isLoadingTeam) {
        return (
            <TeamLayout>
                <div className={styles.loading}>
                    <Loader2 size={32} className={styles.spinner} />
                    <span>Loading invitations...</span>
                </div>
            </TeamLayout>
        );
    }

    return (
        <TeamLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h1>
                            <UserPlus size={24} />
                            Invitations
                        </h1>
                        <p>Manage pending invitations for {currentTeam?.name}</p>
                    </div>

                    <button
                        className={styles.inviteBtn}
                        onClick={() => setIsInviteModalOpen(true)}
                    >
                        <UserPlus size={18} />
                        New Invitation
                    </button>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    <div className={styles.statusTabs}>
                        {(['all', 'pending', 'accepted', 'expired', 'revoked'] as const).map(status => (
                            <button
                                key={status}
                                className={`${styles.statusTab} ${statusFilter === status ? styles.active : ''}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                                {status === 'pending' && invitations.filter(i => i.status === 'pending').length > 0 && (
                                    <span className={styles.count}>
                                        {invitations.filter(i => i.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Invitations List */}
                <div className={styles.invitationsList}>
                    {filteredInvitations.length === 0 ? (
                        <div className={styles.emptyState}>
                            <UserPlus size={48} />
                            <h3>No invitations {statusFilter !== 'all' ? `with status "${statusFilter}"` : ''}</h3>
                            <p>
                                {statusFilter === 'all'
                                    ? 'Send invitations to grow your team.'
                                    : 'Try changing the filter to see more invitations.'}
                            </p>
                            {statusFilter === 'all' && (
                                <button onClick={() => setIsInviteModalOpen(true)}>
                                    <UserPlus size={18} />
                                    Send First Invitation
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredInvitations.map(invitation => (
                            <div key={invitation.id} className={styles.invitationCard}>
                                <div className={styles.cardMain}>
                                    <div className={styles.inviteeInfo}>
                                        <div className={styles.emailRow}>
                                            <Mail size={16} />
                                            <span className={styles.email}>{invitation.email}</span>
                                            {getStatusBadge(invitation.status)}
                                        </div>
                                        <div className={styles.meta}>
                                            <span>
                                                <RoleBadge role={invitation.role} size="sm" />
                                            </span>
                                            <span className={styles.separator}>•</span>
                                            <span>Invited by {invitation.invitedBy.username}</span>
                                        </div>
                                    </div>

                                    <div className={styles.dateInfo}>
                                        <div className={styles.dateRow}>
                                            <Clock size={14} />
                                            <span>Created: {formatDate(invitation.createdAt)}</span>
                                        </div>
                                        {invitation.status === 'pending' && (
                                            <div className={`${styles.dateRow} ${isExpired(invitation.expiresAt) ? styles.expired : ''}`}>
                                                <AlertCircle size={14} />
                                                <span>
                                                    {isExpired(invitation.expiresAt)
                                                        ? 'Expired'
                                                        : `Expires: ${formatDate(invitation.expiresAt)}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {invitation.status === 'pending' && (
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.copyBtn}
                                            onClick={() => handleCopyLink(invitation)}
                                            title="Copy invite link"
                                        >
                                            {copiedId === invitation.id ? (
                                                <Check size={16} />
                                            ) : (
                                                <LinkIcon size={16} />
                                            )}
                                            {copiedId === invitation.id ? 'Copied!' : 'Copy Link'}
                                        </button>
                                        <button
                                            className={styles.resendBtn}
                                            onClick={() => resendMutation.mutate(invitation.id)}
                                            disabled={resendMutation.isPending}
                                            title="Resend invitation"
                                        >
                                            <RefreshCw size={16} />
                                            Resend
                                        </button>
                                        <button
                                            className={styles.revokeBtn}
                                            onClick={() => handleRevoke(invitation)}
                                            disabled={revokeMutation.isPending}
                                            title="Revoke invitation"
                                        >
                                            <Trash2 size={16} />
                                            Revoke
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={() => refreshCurrentTeam()}
            />
        </TeamLayout>
    );
}
