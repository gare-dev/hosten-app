import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users,
    UserPlus,
    Search,
    Loader2,
    Crown,
    Filter
} from 'lucide-react';
import styles from '@/styles/teammembers.module.scss';
import TeamLayout from '@/components/Layout/TeamLayout';
import { teamService } from '@/services/team-service';
import { useTeam, RequirePermission } from '@/context/team-context';
import { useAlert } from '@/context/alert-context';
import { useConfirm } from '@/context/confirm-context';
import { MemberCard, InviteMemberModal } from '@/components/Team';
import { TeamMember, TeamRole } from '@/types/team';

export default function TeamMembersPage() {
    const router = useRouter();
    const { teamId } = router.query as { teamId: string };
    const queryClient = useQueryClient();
    const { selectTeam, currentTeam, currentTeamDetails, isLoadingTeam, can, refreshCurrentTeam } = useTeam();
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();

    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<TeamRole | 'all'>('all');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

    // Select team based on URL param
    useEffect(() => {
        if (teamId) {
            selectTeam(teamId);
        }
    }, [teamId, selectTeam]);

    const removeMemberMutation = useMutation({
        mutationFn: ({ memberId }: { memberId: string }) =>
            teamService.removeTeamMember(teamId, memberId),
        onSuccess: () => {
            showAlert('success', 'Member removed from team');
            refreshCurrentTeam();
        },
        onError: (error: any) => {
            showAlert('error', error?.response?.data?.message || 'Failed to remove member');
        },
        onSettled: () => {
            setUpdatingMemberId(null);
        }
    });

    const handleRemoveMember = async (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        if (!member) return;

        const confirmed = await confirm({
            title: 'Remove Member',
            message: `Are you sure you want to remove ${member.user.username} from the team?`,
            confirmText: 'Remove',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            setUpdatingMemberId(memberId);
            removeMemberMutation.mutate({ memberId });
        }
    };

    const members = currentTeamDetails?.members || [];

    // Filter members
    const filteredMembers = members.filter(member => {
        const matchesSearch =
            member.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'all' || member.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    if (isLoadingTeam) {
        return (
            <TeamLayout>
                <div className={styles.loading}>
                    <Loader2 size={32} className={styles.spinner} />
                    <span>Loading members...</span>
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
                            <Users size={24} />
                            Team Members
                        </h1>
                        <p>{members.length} member{members.length !== 1 ? 's' : ''} in {currentTeam?.name}</p>
                    </div>

                    <RequirePermission permission="team:invite_members">
                        <button
                            className={styles.inviteBtn}
                            onClick={() => setIsInviteModalOpen(true)}
                        >
                            <UserPlus size={18} />
                            Invite Member
                        </button>
                    </RequirePermission>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.roleFilter}>
                        <Filter size={16} />
                        <select
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value as TeamRole | 'all')}
                        >
                            <option value="all">All Roles</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>
                </div>

                {/* Members List */}
                <div className={styles.membersList}>
                    {filteredMembers.length === 0 ? (
                        <div className={styles.emptyState}>
                            {searchQuery || roleFilter !== 'all' ? (
                                <>
                                    <p>No members match your filters</p>
                                    <button onClick={() => { setSearchQuery(''); setRoleFilter('all'); }}>
                                        Clear Filters
                                    </button>
                                </>
                            ) : (
                                <p>No members in this team yet</p>
                            )}
                        </div>
                    ) : (
                        filteredMembers.map(member => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                onRemove={handleRemoveMember}
                                onManagePermissions={(m: TeamMember) => router.push(`/team/${teamId}/members/${m.id}/permissions`)}
                                isUpdating={updatingMemberId === member.id}
                            />
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
