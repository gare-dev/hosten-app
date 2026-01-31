'use client';

import React from 'react';
import { TeamRole, TEAM_ROLES } from '@/types/team';
import styles from '@/styles/rolebadge.module.scss';

interface RoleBadgeProps {
    role: TeamRole;
    size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
    const roleConfig = TEAM_ROLES.find(r => r.value === role);

    if (!roleConfig) return null;

    return (
        <span
            className={`${styles.badge} ${styles[size]}`}
            style={{ '--role-color': roleConfig.color } as React.CSSProperties}
        >
            {roleConfig.label}
        </span>
    );
}
