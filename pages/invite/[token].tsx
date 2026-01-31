import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    Users,
    Check,
    X,
    Loader2,
    AlertCircle,
    LogIn,
    UserPlus
} from 'lucide-react';
import styles from '@/styles/invitejoin.module.scss';
import { teamService } from '@/services/team-service';
import { useAlert } from '@/context/alert-context';
import { useTeam } from '@/context/team-context';
import { RoleBadge } from '@/components/Team';
import { ThemeToggle } from '@/context/theme-context';

export default function InviteJoinPage() {
    const router = useRouter();
    const { token } = router.query as { token: string };
    const { showAlert } = useAlert();
    const { selectTeam, refreshTeams } = useTeam();
    const [isAccepting, setIsAccepting] = useState(false);

    // Fetch invitation details
    const { data: invitation, isLoading, error } = useQuery({
        queryKey: ['invitation', token],
        queryFn: () => teamService.getInvitationByToken(token),
        enabled: !!token,
        retry: false
    });

    const acceptMutation = useMutation({
        mutationFn: () => teamService.acceptInvitation(token),
        onSuccess: async (result) => {
            showAlert('success', `You've joined ${result.team.name}!`);
            await refreshTeams();
            selectTeam(result.team.id);
            router.push(`/team/${result.team.id}`);
        },
        onError: (error: any) => {
            if (error?.response?.status === 401) {
                // Not authenticated - redirect to login
                showAlert('info', 'Please log in to accept this invitation');
                router.push(`/login?redirect=/invite/${token}`);
            } else {
                showAlert('error', error?.response?.data?.message || 'Failed to accept invitation');
            }
            setIsAccepting(false);
        }
    });

    const handleAccept = () => {
        setIsAccepting(true);
        acceptMutation.mutate();
    };

    const handleDecline = () => {
        router.push('/teams');
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.loading}>
                        <Loader2 size={32} className={styles.spinner} />
                        <span>Loading invitation...</span>
                    </div>
                </div>
                <ThemeToggle className={styles.themeToggle} />
            </div>
        );
    }

    // Error state
    if (error || !invitation) {
        const errorMessage = (error as any)?.response?.data?.message || 'Invalid or expired invitation';

        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.errorState}>
                        <div className={styles.errorIcon}>
                            <AlertCircle size={32} />
                        </div>
                        <h2>Invitation Not Found</h2>
                        <p>{errorMessage}</p>
                        <button onClick={() => router.push('/teams')}>
                            Go to Teams
                        </button>
                    </div>
                </div>
                <ThemeToggle className={styles.themeToggle} />
            </div>
        );
    }

    // Expired invitation
    if (invitation.status === 'expired' || new Date(invitation.expiresAt) < new Date()) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.errorState}>
                        <div className={styles.errorIcon}>
                            <AlertCircle size={32} />
                        </div>
                        <h2>Invitation Expired</h2>
                        <p>This invitation has expired. Please ask the team administrator to send a new invitation.</p>
                        <button onClick={() => router.push('/teams')}>
                            Go to Teams
                        </button>
                    </div>
                </div>
                <ThemeToggle className={styles.themeToggle} />
            </div>
        );
    }

    // Already accepted
    if (invitation.status === 'accepted') {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.successState}>
                        <div className={styles.successIcon}>
                            <Check size={32} />
                        </div>
                        <h2>Already Joined</h2>
                        <p>You've already accepted this invitation and joined the team.</p>
                        <button onClick={() => router.push(`/team/${invitation.teamId}`)}>
                            Go to Team
                        </button>
                    </div>
                </div>
                <ThemeToggle className={styles.themeToggle} />
            </div>
        );
    }

    // Revoked invitation
    if (invitation.status === 'revoked') {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.errorState}>
                        <div className={styles.errorIcon}>
                            <X size={32} />
                        </div>
                        <h2>Invitation Revoked</h2>
                        <p>This invitation has been revoked by the team administrator.</p>
                        <button onClick={() => router.push('/teams')}>
                            Go to Teams
                        </button>
                    </div>
                </div>
                <ThemeToggle className={styles.themeToggle} />
            </div>
        );
    }

    // Valid pending invitation
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Users size={28} />
                    </div>
                    <h1>You're Invited!</h1>
                    <p>You've been invited to join a team on Hosten</p>
                </div>

                <div className={styles.teamInfo}>
                    <div className={styles.teamAvatar}>
                        {invitation.team?.avatarUrl ? (
                            <img src={invitation.team.avatarUrl} alt={invitation.team.name} />
                        ) : (
                            <Users size={32} />
                        )}
                    </div>
                    <div className={styles.teamDetails}>
                        <h2>{invitation.team?.name || 'Team'}</h2>
                        {invitation.team?.description && (
                            <p>{invitation.team.description}</p>
                        )}
                    </div>
                </div>

                <div className={styles.inviteDetails}>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Invited as:</span>
                        <RoleBadge role={invitation.role} />
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Invited by:</span>
                        <span>{invitation.invitedBy.username}</span>
                    </div>
                    {invitation.message && (
                        <div className={styles.message}>
                            <p>"{invitation.message}"</p>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.declineBtn}
                        onClick={handleDecline}
                        disabled={isAccepting}
                    >
                        <X size={18} />
                        Decline
                    </button>
                    <button
                        className={styles.acceptBtn}
                        onClick={handleAccept}
                        disabled={isAccepting}
                    >
                        {isAccepting ? (
                            <>
                                <Loader2 size={18} className={styles.spinner} />
                                Joining...
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Accept & Join Team
                            </>
                        )}
                    </button>
                </div>
            </div>
            <ThemeToggle className={styles.themeToggle} />
        </div>
    );
}
