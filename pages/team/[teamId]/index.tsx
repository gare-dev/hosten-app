import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import {
    Users,
    Server,
    UserPlus,
    Settings,
    Activity,
    ChevronRight,
    Loader2,
    Crown
} from 'lucide-react';
import styles from '@/styles/teamoverview.module.scss';
import TeamLayout from '@/components/Layout/TeamLayout';
import { teamService } from '@/services/team-service';
import { useTeam } from '@/context/team-context';
import { RoleBadge } from '@/components/Team';

export default function TeamOverviewPage() {
    const router = useRouter();
    const { teamId } = router.query as { teamId: string };
    const { selectTeam, currentTeam, currentTeamDetails, isLoadingTeam, can } = useTeam();

    // Select team based on URL param
    useEffect(() => {
        if (teamId) {
            selectTeam(teamId);
        }
    }, [teamId, selectTeam]);

    if (isLoadingTeam) {
        return (
            <TeamLayout>
                <div className={styles.loading}>
                    <Loader2 size={32} className={styles.spinner} />
                    <span>Loading team...</span>
                </div>
            </TeamLayout>
        );
    }

    if (!currentTeam) {
        return (
            <TeamLayout>
                <div className={styles.notFound}>
                    <h2>Team not found</h2>
                    <p>The team you're looking for doesn't exist or you don't have access.</p>
                    <button onClick={() => router.push('/teams')}>
                        Back to Teams
                    </button>
                </div>
            </TeamLayout>
        );
    }

    const members = currentTeamDetails?.members || [];
    const invitations = currentTeamDetails?.invitations?.filter(i => i.status === 'pending') || [];

    return (
        <TeamLayout>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.teamInfo}>
                        <div className={styles.teamAvatar}>
                            {currentTeam.avatarUrl ? (
                                <img src={currentTeam.avatarUrl} alt={currentTeam.name} />
                            ) : (
                                <Users size={32} />
                            )}
                        </div>
                        <div>
                            <h1>{currentTeam.name}</h1>
                            {currentTeam.description && (
                                <p>{currentTeam.description}</p>
                            )}
                        </div>
                    </div>

                    {can('team:edit') && (
                        <button
                            className={styles.settingsBtn}
                            onClick={() => router.push(`/team/${teamId}/settings`)}
                        >
                            <Settings size={18} />
                            Settings
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div
                        className={styles.statCard}
                        onClick={() => router.push(`/team/${teamId}/members`)}
                    >
                        <div className={styles.statIcon}>
                            <Users size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{members.length}</span>
                            <span className={styles.statLabel}>Members</span>
                        </div>
                        <ChevronRight size={18} className={styles.statArrow} />
                    </div>

                    <div
                        className={styles.statCard}
                        onClick={() => router.push(`/team/${teamId}/servers`)}
                    >
                        <div className={styles.statIcon}>
                            <Server size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{currentTeam.serverCount || 0}</span>
                            <span className={styles.statLabel}>Servers</span>
                        </div>
                        <ChevronRight size={18} className={styles.statArrow} />
                    </div>

                    {can('team:invite_members') && (
                        <div
                            className={styles.statCard}
                            onClick={() => router.push(`/team/${teamId}/invitations`)}
                        >
                            <div className={`${styles.statIcon} ${styles.pending}`}>
                                <UserPlus size={24} />
                            </div>
                            <div className={styles.statInfo}>
                                <span className={styles.statValue}>{invitations.length}</span>
                                <span className={styles.statLabel}>Pending Invites</span>
                            </div>
                            <ChevronRight size={18} className={styles.statArrow} />
                        </div>
                    )}
                </div>

                {/* Recent Members */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>
                            <Users size={20} />
                            Team Members
                        </h2>
                        <button
                            className={styles.viewAllBtn}
                            onClick={() => router.push(`/team/${teamId}/members`)}
                        >
                            View All <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className={styles.membersList}>
                        {members.slice(0, 5).map(member => (
                            <div key={member.id} className={styles.memberItem}>
                                <div className={styles.memberAvatar}>
                                    {member.user.avatarUrl ? (
                                        <img src={member.user.avatarUrl} alt={member.user.username} />
                                    ) : (
                                        <span>
                                            {member.user.username.slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                    {member.role === 'owner' && (
                                        <div className={styles.ownerBadge}>
                                            <Crown size={10} />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.memberInfo}>
                                    <span className={styles.memberName}>{member.user.username}</span>
                                    <span className={styles.memberEmail}>{member.user.email}</span>
                                </div>
                                <RoleBadge role={member.role} size="sm" />
                            </div>
                        ))}

                        {members.length === 0 && (
                            <div className={styles.emptyList}>
                                <p>No members yet</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Quick Actions */}
                {can('team:invite_members') && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>
                                <Activity size={20} />
                                Quick Actions
                            </h2>
                        </div>

                        <div className={styles.actionsGrid}>
                            <button
                                className={styles.actionCard}
                                onClick={() => router.push(`/team/${teamId}/invitations?new=true`)}
                            >
                                <UserPlus size={24} />
                                <span>Invite Member</span>
                            </button>
                            <button
                                className={styles.actionCard}
                                onClick={() => router.push('/servers')}
                            >
                                <Server size={24} />
                                <span>Manage Servers</span>
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </TeamLayout>
    );
}
