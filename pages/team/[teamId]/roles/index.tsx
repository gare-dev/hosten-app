import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Shield,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Check,
    Info
} from 'lucide-react';
import styles from '@/styles/teamroles.module.scss';
import TeamLayout from '@/components/Layout/TeamLayout';
import { teamService } from '@/services/team-service';
import { useTeam } from '@/context/team-context';
import { useAlert } from '@/context/alert-context';
import {
    TeamRole,
    TeamPermissionAction,
    TEAM_ROLES,
    PERMISSION_GROUPS,
    DEFAULT_ROLE_PERMISSIONS
} from '@/types/team';
import { RoleBadge } from '@/components/Team';

export default function TeamRolesPage() {
    const router = useRouter();
    const { teamId } = router.query as { teamId: string };
    const queryClient = useQueryClient();
    const { showAlert } = useAlert();
    const { isOwner, isAdmin } = useTeam();

    const [expandedRole, setExpandedRole] = useState<TeamRole | null>(null);

    // Fetch team members
    const { data: members, isLoading } = useQuery({
        queryKey: ['teamMembers', teamId],
        queryFn: () => teamService.getTeamMembers(teamId),
        enabled: !!teamId
    });

    // Update member role mutation
    const updateRoleMutation = useMutation({
        mutationFn: ({ memberId, role }: { memberId: string; role: TeamRole }) =>
            teamService.updateMemberRole(teamId, memberId, role),
        onSuccess: () => {
            showAlert('success', 'Member role updated successfully');
            queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] });
        },
        onError: () => {
            showAlert('error', 'Failed to update member role');
        }
    });

    const toggleRole = (role: TeamRole) => {
        setExpandedRole(expandedRole === role ? null : role);
    };

    const getMembersWithRole = (role: TeamRole) => {
        return members?.filter(m => m.role === role) || [];
    };

    const canEdit = isOwner() || isAdmin();

    if (isLoading) {
        return (
            <TeamLayout>
                <div className={styles.loading}>
                    <Loader2 size={24} className={styles.spinner} />
                    <span>Loading roles...</span>
                </div>
            </TeamLayout>
        );
    }

    return (
        <TeamLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1>
                            <Shield size={24} />
                            Team Roles
                        </h1>
                        <p className={styles.subtitle}>
                            Manage role assignments and view permissions
                        </p>
                    </div>
                </div>

                <div className={styles.infoCard}>
                    <Info size={20} />
                    <p>
                        Roles define what members can do within the team. Each role has a predefined set of permissions.
                        Team owners can change member roles at any time.
                    </p>
                </div>

                <div className={styles.rolesGrid}>
                    {TEAM_ROLES.map((role) => {
                        const roleMembers = getMembersWithRole(role.value);
                        const permissions = DEFAULT_ROLE_PERMISSIONS[role.value];
                        const isExpanded = expandedRole === role.value;

                        return (
                            <div
                                key={role.value}
                                className={`${styles.roleCard} ${isExpanded ? styles.expanded : ''}`}
                            >
                                <div
                                    className={styles.roleHeader}
                                    onClick={() => toggleRole(role.value)}
                                >
                                    <div className={styles.roleInfo}>
                                        <RoleBadge role={role.value} />
                                        <span className={styles.memberCount}>
                                            {roleMembers.length} member{roleMembers.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <button className={styles.expandBtn}>
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                </div>

                                <p className={styles.roleDescription}>{role.description}</p>

                                {isExpanded && (
                                    <div className={styles.roleDetails}>
                                        {/* Permissions Section */}
                                        <div className={styles.permissionsSection}>
                                            <h4>Permissions</h4>
                                            <div className={styles.permissionGroups}>
                                                {PERMISSION_GROUPS.map((group) => {
                                                    const groupPermissions = group.permissions.filter(
                                                        p => permissions.includes(p.action)
                                                    );

                                                    if (groupPermissions.length === 0) return null;

                                                    return (
                                                        <div key={group.scope} className={styles.permissionGroup}>
                                                            <span className={`${styles.scopeLabel} ${styles[group.scope]}`}>
                                                                {group.label}
                                                            </span>
                                                            <ul>
                                                                {groupPermissions.map((perm) => (
                                                                    <li key={perm.action}>
                                                                        <Check size={14} />
                                                                        {perm.label}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Members Section */}
                                        {roleMembers.length > 0 && (
                                            <div className={styles.membersSection}>
                                                <h4>Members with this role</h4>
                                                <div className={styles.membersList}>
                                                    {roleMembers.map((member) => (
                                                        <div key={member.id} className={styles.memberItem}>
                                                            <div className={styles.memberAvatar}>
                                                                {member.user.avatarUrl ? (
                                                                    <img src={member.user.avatarUrl} alt="" />
                                                                ) : (
                                                                    member.user.username.charAt(0).toUpperCase()
                                                                )}
                                                            </div>
                                                            <div className={styles.memberInfo}>
                                                                <span>{member.user.username}</span>
                                                                <small>{member.user.email}</small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Role Comparison */}
                <div className={styles.comparisonSection}>
                    <h2>Role Comparison</h2>
                    <div className={styles.comparisonTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Permission</th>
                                    {TEAM_ROLES.map((role) => (
                                        <th key={role.value}>
                                            <RoleBadge role={role.value} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERMISSION_GROUPS.map((group) => (
                                    <>
                                        <tr key={group.scope} className={styles.groupRow}>
                                            <td colSpan={5}>
                                                <span className={`${styles.scopeLabel} ${styles[group.scope]}`}>
                                                    {group.label}
                                                </span>
                                            </td>
                                        </tr>
                                        {group.permissions.map((perm) => (
                                            <tr key={perm.action}>
                                                <td>{perm.label}</td>
                                                {TEAM_ROLES.map((role) => (
                                                    <td key={role.value} className={styles.checkCell}>
                                                        {DEFAULT_ROLE_PERMISSIONS[role.value].includes(
                                                            perm.action
                                                        ) ? (
                                                            <Check size={16} className={styles.checkIcon} />
                                                        ) : (
                                                            <span className={styles.dash}>—</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </TeamLayout>
    );
}
