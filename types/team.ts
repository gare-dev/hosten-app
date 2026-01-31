// ─────────────────────────────────────────────────────────────────────────────
// Team Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Team {
    id: string;
    name: string;
    slug: string;
    description?: string;
    avatarUrl?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    memberCount?: number;
    serverCount?: number;
}

export interface TeamMember {
    id: string;
    teamId: string;
    userId: string;
    user: {
        id: string;
        email: string;
        username: string;
        avatarUrl?: string;
    };
    role: TeamRole;
    permissions: TeamPermission[];
    joinedAt: string;
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamRoleConfig {
    value: TeamRole;
    label: string;
    description: string;
    color: string;
}

export const TEAM_ROLES: TeamRoleConfig[] = [
    {
        value: 'owner',
        label: 'Owner',
        description: 'Full control over the team and all resources',
        color: '#f59e0b'
    },
    {
        value: 'admin',
        label: 'Admin',
        description: 'Can manage team members and most settings',
        color: '#8b5cf6'
    },
    {
        value: 'member',
        label: 'Member',
        description: 'Can view and manage assigned resources',
        color: '#3b82f6'
    },
    {
        value: 'viewer',
        label: 'Viewer',
        description: 'Read-only access to team resources',
        color: '#6b7280'
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// Permissions
// ─────────────────────────────────────────────────────────────────────────────

export type PermissionScope = 'team' | 'server' | 'process';

export type TeamPermissionAction =
    // Team permissions
    | 'team:view'
    | 'team:edit'
    | 'team:delete'
    | 'team:manage_members'
    | 'team:manage_roles'
    | 'team:manage_permissions'
    | 'team:invite_members'
    // Server permissions
    | 'server:view'
    | 'server:create'
    | 'server:edit'
    | 'server:delete'
    | 'server:manage'
    // Process permissions
    | 'process:view'
    | 'process:start'
    | 'process:stop'
    | 'process:restart'
    | 'process:delete'
    | 'process:view_logs'
    | 'process:manage';

export interface TeamPermission {
    id: string;
    action: TeamPermissionAction;
    scope: PermissionScope;
    resourceId?: string; // Optional: specific server/process ID
    description?: string;
}

export interface PermissionGroup {
    scope: PermissionScope;
    label: string;
    icon: string;
    permissions: {
        action: TeamPermissionAction;
        label: string;
        description: string;
    }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        scope: 'team',
        label: 'Team',
        icon: 'Users',
        permissions: [
            { action: 'team:view', label: 'View Team', description: 'View team details and members' },
            { action: 'team:edit', label: 'Edit Team', description: 'Edit team name, description, and settings' },
            { action: 'team:delete', label: 'Delete Team', description: 'Permanently delete the team' },
            { action: 'team:manage_members', label: 'Manage Members', description: 'Add, remove, and update team members' },
            { action: 'team:manage_roles', label: 'Manage Roles', description: 'Create and modify team roles' },
            { action: 'team:manage_permissions', label: 'Manage Permissions', description: 'Assign and revoke permissions' },
            { action: 'team:invite_members', label: 'Invite Members', description: 'Send invitations to new members' },
        ]
    },
    {
        scope: 'server',
        label: 'Servers',
        icon: 'Server',
        permissions: [
            { action: 'server:view', label: 'View Servers', description: 'View server list and details' },
            { action: 'server:create', label: 'Create Server', description: 'Add new servers to the team' },
            { action: 'server:edit', label: 'Edit Server', description: 'Modify server configuration' },
            { action: 'server:delete', label: 'Delete Server', description: 'Remove servers from the team' },
            { action: 'server:manage', label: 'Manage Server', description: 'Full server management access' },
        ]
    },
    {
        scope: 'process',
        label: 'Processes',
        icon: 'Activity',
        permissions: [
            { action: 'process:view', label: 'View Processes', description: 'View process list and status' },
            { action: 'process:start', label: 'Start Process', description: 'Start stopped processes' },
            { action: 'process:stop', label: 'Stop Process', description: 'Stop running processes' },
            { action: 'process:restart', label: 'Restart Process', description: 'Restart processes' },
            { action: 'process:delete', label: 'Delete Process', description: 'Remove processes' },
            { action: 'process:view_logs', label: 'View Logs', description: 'Access process logs and metrics' },
            { action: 'process:manage', label: 'Manage Processes', description: 'Full process management access' },
        ]
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// Invitations
// ─────────────────────────────────────────────────────────────────────────────

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface TeamInvitation {
    id: string;
    teamId: string;
    team?: Team;
    email: string;
    role: TeamRole;
    permissions: TeamPermissionAction[];
    message?: string;
    invitedBy: {
        id: string;
        username: string;
        email: string;
    };
    token: string;
    status: InvitationStatus;
    expiresAt: string;
    createdAt: string;
    acceptedAt?: string;
}

export interface CreateInvitationPayload {
    teamId: string;
    email: string;
    role: TeamRole;
    permissions?: TeamPermissionAction[];
    message?: string;
}

export interface InvitationResponse {
    invitation: TeamInvitation;
    inviteLink: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Payloads
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateTeamPayload {
    name: string;
    description?: string;
}

export interface UpdateTeamPayload {
    name?: string;
    description?: string;
    avatarUrl?: string;
}

export interface UpdateMemberPayload {
    role?: TeamRole;
    permissions?: TeamPermissionAction[];
}

export interface TeamsResponse {
    teams: Team[];
    total: number;
}

export interface TeamDetailsResponse {
    team: Team;
    members: TeamMember[];
    invitations: TeamInvitation[];
    currentUserRole: TeamRole;
    currentUserPermissions: TeamPermissionAction[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_ROLE_PERMISSIONS: Record<TeamRole, TeamPermissionAction[]> = {
    owner: [
        'team:view', 'team:edit', 'team:delete', 'team:manage_members',
        'team:manage_roles', 'team:manage_permissions', 'team:invite_members',
        'server:view', 'server:create', 'server:edit', 'server:delete', 'server:manage',
        'process:view', 'process:start', 'process:stop', 'process:restart',
        'process:delete', 'process:view_logs', 'process:manage'
    ],
    admin: [
        'team:view', 'team:edit', 'team:manage_members', 'team:invite_members',
        'server:view', 'server:create', 'server:edit', 'server:manage',
        'process:view', 'process:start', 'process:stop', 'process:restart',
        'process:view_logs', 'process:manage'
    ],
    member: [
        'team:view',
        'server:view', 'server:edit',
        'process:view', 'process:start', 'process:stop', 'process:restart', 'process:view_logs'
    ],
    viewer: [
        'team:view',
        'server:view',
        'process:view', 'process:view_logs'
    ]
};

export function hasPermission(
    userPermissions: TeamPermissionAction[],
    requiredPermission: TeamPermissionAction
): boolean {
    return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
    userPermissions: TeamPermissionAction[],
    requiredPermissions: TeamPermissionAction[]
): boolean {
    return requiredPermissions.some(p => userPermissions.includes(p));
}

export function hasAllPermissions(
    userPermissions: TeamPermissionAction[],
    requiredPermissions: TeamPermissionAction[]
): boolean {
    return requiredPermissions.every(p => userPermissions.includes(p));
}
