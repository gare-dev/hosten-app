'use client';

import React, { useState } from 'react';
import {
    MoreVertical,
    Mail,
    Shield,
    UserMinus,
    Crown,
    Loader2
} from 'lucide-react';
import styles from '@/styles/membercard.module.scss';
import { TeamMember, TeamRole } from '@/types/team';
import { RoleBadge } from './RoleBadge';
import { useTeam } from '@/context/team-context';

interface MemberCardProps {
    member: TeamMember;
    onUpdateRole?: (memberId: string, role: TeamRole) => void;
    onRemove?: (memberId: string) => void;
    onManagePermissions?: (member: TeamMember) => void;
    isUpdating?: boolean;
}

export function MemberCard({
    member,
    onUpdateRole,
    onRemove,
    onManagePermissions,
    isUpdating
}: MemberCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const { can, isOwner, currentUserRole } = useTeam();

    const canManage = can('team:manage_members');
    const canManageRoles = can('team:manage_roles');
    const isOwnerMember = member.role === 'owner';

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={styles.card}>
            <div className={styles.avatar}>
                {member.user.avatarUrl ? (
                    <img src={member.user.avatarUrl} alt={member.user.username} />
                ) : (
                    <span>{getInitials(member.user.username)}</span>
                )}
                {isOwnerMember && (
                    <div className={styles.ownerBadge}>
                        <Crown size={10} />
                    </div>
                )}
            </div>

            <div className={styles.info}>
                <div className={styles.nameRow}>
                    <span className={styles.name}>{member.user.username}</span>
                    <RoleBadge role={member.role} size="sm" />
                </div>
                <span className={styles.email}>{member.user.email}</span>
            </div>

            {canManage && !isOwnerMember && (
                <div className={styles.actions}>
                    {isUpdating ? (
                        <div className={styles.loading}>
                            <Loader2 size={18} className={styles.spinner} />
                        </div>
                    ) : (
                        <button
                            className={styles.menuBtn}
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <MoreVertical size={18} />
                        </button>
                    )}

                    {showMenu && (
                        <>
                            <div
                                className={styles.menuBackdrop}
                                onClick={() => setShowMenu(false)}
                            />
                            <div className={styles.menu}>
                                {canManageRoles && (
                                    <button
                                        onClick={() => {
                                            onManagePermissions?.(member);
                                            setShowMenu(false);
                                        }}
                                    >
                                        <Shield size={16} />
                                        Manage Permissions
                                    </button>
                                )}
                                <button
                                    className={styles.danger}
                                    onClick={() => {
                                        onRemove?.(member.id);
                                        setShowMenu(false);
                                    }}
                                >
                                    <UserMinus size={16} />
                                    Remove from Team
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
