'use client';

import React from 'react';
import { TeamPermissionAction, PERMISSION_GROUPS } from '@/types/team';
import styles from '@/styles/permissionbadge.module.scss';

interface PermissionBadgeProps {
    permission: TeamPermissionAction;
    size?: 'sm' | 'md';
}

export function PermissionBadge({ permission, size = 'md' }: PermissionBadgeProps) {
    // Find permission label from groups
    let label: string = permission;
    const scope = permission.split(':')[0];

    for (const group of PERMISSION_GROUPS) {
        const found = group.permissions.find(p => p.action === permission);
        if (found) {
            label = found.label;
            break;
        }
    }

    return (
        <span className={`${styles.badge} ${styles[size]} ${styles[scope]}`}>
            {label}
        </span>
    );
}

interface PermissionListProps {
    permissions: TeamPermissionAction[];
    maxVisible?: number;
    size?: 'sm' | 'md';
}

export function PermissionList({ permissions, maxVisible = 3, size = 'sm' }: PermissionListProps) {
    const visible = permissions.slice(0, maxVisible);
    const remaining = permissions.length - maxVisible;

    return (
        <div className={styles.list}>
            {visible.map(perm => (
                <PermissionBadge key={perm} permission={perm} size={size} />
            ))}
            {remaining > 0 && (
                <span className={`${styles.more} ${styles[size]}`}>
                    +{remaining} more
                </span>
            )}
        </div>
    );
}
