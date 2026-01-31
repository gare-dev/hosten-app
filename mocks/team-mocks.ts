import {
    Team,
    TeamMember,
    TeamInvitation,
    TeamDetailsResponse,
    TeamsResponse,
    TeamRole,
    TeamPermissionAction,
    InvitationResponse,
    DEFAULT_ROLE_PERMISSIONS
} from '@/types/team';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Users
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_USERS = {
    currentUser: {
        id: 'user-001',
        email: 'admin@hosten.io',
        username: 'admin',
        avatarUrl: undefined
    },
    user2: {
        id: 'user-002',
        email: 'john.doe@example.com',
        username: 'johndoe',
        avatarUrl: undefined
    },
    user3: {
        id: 'user-003',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        avatarUrl: undefined
    },
    user4: {
        id: 'user-004',
        email: 'bob.wilson@example.com',
        username: 'bobwilson',
        avatarUrl: undefined
    },
    user5: {
        id: 'user-005',
        email: 'alice.johnson@example.com',
        username: 'alicejohnson',
        avatarUrl: undefined
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Teams
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_TEAMS: Team[] = [
    {
        id: 'team-001',
        name: 'Production Team',
        slug: 'production-team',
        description: 'Main production infrastructure management team',
        avatarUrl: undefined,
        ownerId: 'user-001',
        createdAt: '2025-06-15T10:30:00Z',
        updatedAt: '2026-01-20T14:22:00Z',
        memberCount: 5,
        serverCount: 8
    },
    {
        id: 'team-002',
        name: 'Development Squad',
        slug: 'development-squad',
        description: 'Development and staging environments',
        avatarUrl: undefined,
        ownerId: 'user-001',
        createdAt: '2025-08-20T09:00:00Z',
        updatedAt: '2026-01-18T11:45:00Z',
        memberCount: 3,
        serverCount: 4
    },
    {
        id: 'team-003',
        name: 'QA Testing',
        slug: 'qa-testing',
        description: 'Quality assurance and testing infrastructure',
        avatarUrl: undefined,
        ownerId: 'user-002',
        createdAt: '2025-10-01T14:00:00Z',
        updatedAt: '2026-01-15T16:30:00Z',
        memberCount: 2,
        serverCount: 2
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock Team Members
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_TEAM_MEMBERS: Record<string, TeamMember[]> = {
    'team-001': [
        {
            id: 'member-001',
            teamId: 'team-001',
            userId: 'user-001',
            user: MOCK_USERS.currentUser,
            role: 'owner',
            permissions: DEFAULT_ROLE_PERMISSIONS.owner.map(action => ({
                id: `perm-${action}`,
                action,
                scope: action.split(':')[0] as 'team' | 'server' | 'process'
            })),
            joinedAt: '2025-06-15T10:30:00Z'
        },
        {
            id: 'member-002',
            teamId: 'team-001',
            userId: 'user-002',
            user: MOCK_USERS.user2,
            role: 'admin',
            permissions: DEFAULT_ROLE_PERMISSIONS.admin.map(action => ({
                id: `perm-${action}`,
                action,
                scope: action.split(':')[0] as 'team' | 'server' | 'process'
            })),
            joinedAt: '2025-07-01T08:00:00Z'
        },
        {
            id: 'member-003',
            teamId: 'team-001',
            userId: 'user-003',
            user: MOCK_USERS.user3,
            role: 'member',
            permissions: DEFAULT_ROLE_PERMISSIONS.member.map(action => ({
                id: `perm-${action}`,
                action,
                scope: action.split(':')[0] as 'team' | 'server' | 'process'
            })),
            joinedAt: '2025-08-15T14:30:00Z'
        },
        {
            id: 'member-004',
            teamId: 'team-001',
            userId: 'user-004',
            user: MOCK_USERS.user4,
            role: 'member',
            permissions: DEFAULT_ROLE_PERMISSIONS.member.map(action => ({
                id: `perm-${action}`,
                action,
                scope: action.split(':')[0] as 'team' | 'server' | 'process'
            })),
            joinedAt: '2025-09-20T11:00:00Z'
        },
        {
            id: 'member-005',
            teamId: 'team-001',
            userId: 'user-005',
            user: MOCK_USERS.user5,
            role: 'viewer',
            permissions: DEFAULT_ROLE_PERMISSIONS.viewer.map(action => ({
                id: `perm-${action}`,
                action,
                scope: action.split(':')[0] as 'team' | 'server' | 'process'
            })),
            joinedAt: '2025-11-10T09:15:00Z'
        }
    ],
    'team-002': [
        {
            id: 'member-006',
            teamId: 'team-002',
            userId: 'user-001',
            user: MOCK_USERS.currentUser,
            role: 'owner',
            permissions: DEFAULT_ROLE_PERMISSIONS.owner.map(action => ({
                id: `perm-${action}`,
                action,
                scope: action.split(':')[0] as 'team' | 'server' | 'process'
            })),
            joinedAt: '2025-08-20T09:00:00Z'
        },
        {
            id: 'member-007',
            teamId: 'team-002',
            userId: 'user-003',
            user: MOCK_USERS.user3,
            role: 'admin',
            permissions: DEFAULT_ROLE_PERMISSIONS.admin.map(action => ({
                id: `perm-${action}`,
                action,
                scope: action.split(':')[0] as 'team' | 'server' | 'process'
            })),
            joinedAt: '2025-08-25T10:00:00Z'
        },
        {
            id: 'member-008',
            teamId: 'team-002',
            userId: 'user-004',
            user: MOCK_USERS.user4,
            role: 'member',
            permissions: DEFAULT_ROLE_PERMISSIONS.member.map(action => ({
                id: `perm-${action}`,
                action,
                scope: action.split(':')[0] as 'team' | 'server' | 'process'
            })),
            joinedAt: '2025-09-01T15:30:00Z'
        }
    ],
    'team-003': [
        {
            id: 'member-009',
            teamId: 'team-003',
            userId: 'user-002',
            user: MOCK_USERS.user2,
            role: 'owner',
            permissions: DEFAULT_ROLE_PERMISSIONS.owner.map(action => ({
                id: `perm-${action}`,
                action,
                scope: action.split(':')[0] as 'team' | 'server' | 'process'
            })),
            joinedAt: '2025-10-01T14:00:00Z'
        },
        {
            id: 'member-010',
            teamId: 'team-003',
            userId: 'user-001',
            user: MOCK_USERS.currentUser,
            role: 'member',
            permissions: DEFAULT_ROLE_PERMISSIONS.member.map(action => ({
                id: `perm-${action}`,
                action,
                scope: action.split(':')[0] as 'team' | 'server' | 'process'
            })),
            joinedAt: '2025-10-05T11:00:00Z'
        }
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Invitations
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_INVITATIONS: Record<string, TeamInvitation[]> = {
    'team-001': [
        {
            id: 'invite-001',
            teamId: 'team-001',
            team: MOCK_TEAMS[0],
            email: 'newuser@example.com',
            role: 'member',
            permissions: DEFAULT_ROLE_PERMISSIONS.member,
            message: 'Welcome to the Production Team!',
            invitedBy: MOCK_USERS.currentUser,
            token: 'inv_abc123def456',
            status: 'pending',
            expiresAt: '2026-02-01T10:30:00Z',
            createdAt: '2026-01-20T10:30:00Z'
        },
        {
            id: 'invite-002',
            teamId: 'team-001',
            team: MOCK_TEAMS[0],
            email: 'developer@company.com',
            role: 'admin',
            permissions: DEFAULT_ROLE_PERMISSIONS.admin,
            invitedBy: MOCK_USERS.currentUser,
            token: 'inv_xyz789ghi012',
            status: 'pending',
            expiresAt: '2026-01-30T14:00:00Z',
            createdAt: '2026-01-16T14:00:00Z'
        },
        {
            id: 'invite-003',
            teamId: 'team-001',
            team: MOCK_TEAMS[0],
            email: 'past.member@old.com',
            role: 'viewer',
            permissions: DEFAULT_ROLE_PERMISSIONS.viewer,
            invitedBy: MOCK_USERS.user2,
            token: 'inv_old123expired',
            status: 'expired',
            expiresAt: '2025-12-15T10:00:00Z',
            createdAt: '2025-12-01T10:00:00Z'
        },
        {
            id: 'invite-004',
            teamId: 'team-001',
            team: MOCK_TEAMS[0],
            email: 'accepted.user@done.com',
            role: 'member',
            permissions: DEFAULT_ROLE_PERMISSIONS.member,
            invitedBy: MOCK_USERS.currentUser,
            token: 'inv_accepted456',
            status: 'accepted',
            expiresAt: '2026-01-10T10:00:00Z',
            createdAt: '2025-12-25T10:00:00Z',
            acceptedAt: '2025-12-28T15:30:00Z'
        },
        {
            id: 'invite-005',
            teamId: 'team-001',
            team: MOCK_TEAMS[0],
            email: 'revoked.user@cancelled.com',
            role: 'member',
            permissions: DEFAULT_ROLE_PERMISSIONS.member,
            invitedBy: MOCK_USERS.currentUser,
            token: 'inv_revoked789',
            status: 'revoked',
            expiresAt: '2026-01-20T10:00:00Z',
            createdAt: '2026-01-05T10:00:00Z'
        }
    ],
    'team-002': [
        {
            id: 'invite-006',
            teamId: 'team-002',
            team: MOCK_TEAMS[1],
            email: 'dev.intern@company.com',
            role: 'viewer',
            permissions: DEFAULT_ROLE_PERMISSIONS.viewer,
            message: 'Join our development team!',
            invitedBy: MOCK_USERS.currentUser,
            token: 'inv_dev123intern',
            status: 'pending',
            expiresAt: '2026-02-05T09:00:00Z',
            createdAt: '2026-01-22T09:00:00Z'
        }
    ],
    'team-003': []
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock API Response Functions
// ─────────────────────────────────────────────────────────────────────────────

// Simulates API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Current user ID (in real app, this comes from auth)
const CURRENT_USER_ID = 'user-001';

/**
 * GET /api/teams
 * Returns all teams the current user is a member of
 */
export async function mockGetTeams(): Promise<TeamsResponse> {
    await delay(300);

    // Filter teams where current user is a member
    const userTeams = MOCK_TEAMS.filter(team => {
        const members = MOCK_TEAM_MEMBERS[team.id] || [];
        return members.some(m => m.userId === CURRENT_USER_ID);
    });

    return {
        teams: userTeams,
        total: userTeams.length
    };
}

/**
 * GET /api/teams/:teamId
 * Returns team details with members, invitations, and current user's permissions
 */
export async function mockGetTeam(teamId: string): Promise<TeamDetailsResponse> {
    await delay(200);

    const team = MOCK_TEAMS.find(t => t.id === teamId);
    if (!team) {
        throw new Error('Team not found');
    }

    const members = MOCK_TEAM_MEMBERS[teamId] || [];
    const invitations = MOCK_INVITATIONS[teamId] || [];

    // Find current user's membership
    const currentUserMember = members.find(m => m.userId === CURRENT_USER_ID);

    return {
        team,
        members,
        invitations,
        currentUserRole: currentUserMember?.role || 'viewer',
        currentUserPermissions: currentUserMember
            ? DEFAULT_ROLE_PERMISSIONS[currentUserMember.role]
            : DEFAULT_ROLE_PERMISSIONS.viewer
    };
}

/**
 * POST /api/teams
 * Creates a new team
 */
export async function mockCreateTeam(data: { name: string; description?: string }): Promise<Team> {
    await delay(400);

    const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        ownerId: CURRENT_USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memberCount: 1,
        serverCount: 0
    };

    // In real implementation, add to database
    MOCK_TEAMS.push(newTeam);

    // Add owner as first member
    MOCK_TEAM_MEMBERS[newTeam.id] = [{
        id: `member-${Date.now()}`,
        teamId: newTeam.id,
        userId: CURRENT_USER_ID,
        user: MOCK_USERS.currentUser,
        role: 'owner',
        permissions: DEFAULT_ROLE_PERMISSIONS.owner.map(action => ({
            id: `perm-${action}`,
            action,
            scope: action.split(':')[0] as 'team' | 'server' | 'process'
        })),
        joinedAt: new Date().toISOString()
    }];

    MOCK_INVITATIONS[newTeam.id] = [];

    return newTeam;
}

/**
 * PUT /api/teams/:teamId
 * Updates team settings
 */
export async function mockUpdateTeam(
    teamId: string,
    data: { name?: string; description?: string; avatarUrl?: string }
): Promise<Team> {
    await delay(300);

    const teamIndex = MOCK_TEAMS.findIndex(t => t.id === teamId);
    if (teamIndex === -1) {
        throw new Error('Team not found');
    }

    MOCK_TEAMS[teamIndex] = {
        ...MOCK_TEAMS[teamIndex],
        ...data,
        updatedAt: new Date().toISOString()
    };

    return MOCK_TEAMS[teamIndex];
}

/**
 * DELETE /api/teams/:teamId
 * Deletes a team
 */
export async function mockDeleteTeam(teamId: string): Promise<void> {
    await delay(400);

    const teamIndex = MOCK_TEAMS.findIndex(t => t.id === teamId);
    if (teamIndex === -1) {
        throw new Error('Team not found');
    }

    // Check if user is owner
    const members = MOCK_TEAM_MEMBERS[teamId] || [];
    const currentMember = members.find(m => m.userId === CURRENT_USER_ID);
    if (currentMember?.role !== 'owner') {
        throw new Error('Only team owner can delete the team');
    }

    MOCK_TEAMS.splice(teamIndex, 1);
    delete MOCK_TEAM_MEMBERS[teamId];
    delete MOCK_INVITATIONS[teamId];
}

/**
 * GET /api/teams/:teamId/members
 * Returns team members
 */
export async function mockGetTeamMembers(teamId: string): Promise<TeamMember[]> {
    await delay(200);
    return MOCK_TEAM_MEMBERS[teamId] || [];
}

/**
 * DELETE /api/teams/:teamId/members/:memberId
 * Removes a member from the team
 */
export async function mockRemoveTeamMember(teamId: string, memberId: string): Promise<void> {
    await delay(300);

    const members = MOCK_TEAM_MEMBERS[teamId];
    if (!members) {
        throw new Error('Team not found');
    }

    const memberIndex = members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
        throw new Error('Member not found');
    }

    // Cannot remove owner
    if (members[memberIndex].role === 'owner') {
        throw new Error('Cannot remove team owner');
    }

    members.splice(memberIndex, 1);

    // Update team member count
    const team = MOCK_TEAMS.find(t => t.id === teamId);
    if (team) {
        team.memberCount = members.length;
    }
}

/**
 * PUT /api/teams/:teamId/members/:memberId/role
 * Updates a member's role
 */
export async function mockUpdateMemberRole(
    teamId: string,
    memberId: string,
    role: TeamRole
): Promise<TeamMember> {
    await delay(300);

    const members = MOCK_TEAM_MEMBERS[teamId];
    if (!members) {
        throw new Error('Team not found');
    }

    const member = members.find(m => m.id === memberId);
    if (!member) {
        throw new Error('Member not found');
    }

    // Cannot change owner's role
    if (member.role === 'owner') {
        throw new Error('Cannot change owner role');
    }

    member.role = role;
    member.permissions = DEFAULT_ROLE_PERMISSIONS[role].map(action => ({
        id: `perm-${action}`,
        action,
        scope: action.split(':')[0] as 'team' | 'server' | 'process'
    }));

    return member;
}

/**
 * GET /api/teams/:teamId/invitations
 * Returns team invitations
 */
export async function mockGetTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    await delay(200);
    return MOCK_INVITATIONS[teamId] || [];
}

/**
 * POST /api/teams/:teamId/invitations
 * Creates a new invitation
 */
export async function mockCreateInvitation(data: {
    teamId: string;
    email: string;
    role: TeamRole;
    permissions?: TeamPermissionAction[];
    message?: string;
}): Promise<InvitationResponse> {
    await delay(400);

    const team = MOCK_TEAMS.find(t => t.id === data.teamId);
    if (!team) {
        throw new Error('Team not found');
    }

    const token = `inv_${Math.random().toString(36).substring(2, 15)}`;

    const invitation: TeamInvitation = {
        id: `invite-${Date.now()}`,
        teamId: data.teamId,
        team,
        email: data.email,
        role: data.role,
        permissions: data.permissions || DEFAULT_ROLE_PERMISSIONS[data.role],
        message: data.message,
        invitedBy: MOCK_USERS.currentUser,
        token,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        createdAt: new Date().toISOString()
    };

    if (!MOCK_INVITATIONS[data.teamId]) {
        MOCK_INVITATIONS[data.teamId] = [];
    }
    MOCK_INVITATIONS[data.teamId].push(invitation);

    return {
        invitation,
        inviteLink: `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${token}`
    };
}

/**
 * DELETE /api/teams/:teamId/invitations/:invitationId
 * Revokes an invitation
 */
export async function mockRevokeInvitation(teamId: string, invitationId: string): Promise<void> {
    await delay(300);

    const invitations = MOCK_INVITATIONS[teamId];
    if (!invitations) {
        throw new Error('Team not found');
    }

    const invitation = invitations.find(i => i.id === invitationId);
    if (!invitation) {
        throw new Error('Invitation not found');
    }

    invitation.status = 'revoked';
}

/**
 * POST /api/teams/:teamId/invitations/:invitationId/resend
 * Resends an invitation email
 */
export async function mockResendInvitation(teamId: string, invitationId: string): Promise<TeamInvitation> {
    await delay(400);

    const invitations = MOCK_INVITATIONS[teamId];
    if (!invitations) {
        throw new Error('Team not found');
    }

    const invitation = invitations.find(i => i.id === invitationId);
    if (!invitation) {
        throw new Error('Invitation not found');
    }

    // Reset expiration
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    invitation.status = 'pending';

    return invitation;
}

/**
 * GET /api/invitations/:token
 * Gets invitation details by token (for accept page)
 */
export async function mockGetInvitationByToken(token: string): Promise<TeamInvitation> {
    await delay(200);

    for (const teamId in MOCK_INVITATIONS) {
        const invitation = MOCK_INVITATIONS[teamId].find(i => i.token === token);
        if (invitation) {
            return invitation;
        }
    }

    throw new Error('Invitation not found');
}

/**
 * POST /api/invitations/:token/accept
 * Accepts an invitation and adds user to team
 */
export async function mockAcceptInvitation(token: string): Promise<{ team: Team; member: TeamMember }> {
    await delay(500);

    let foundInvitation: TeamInvitation | null = null;
    let foundTeamId: string | null = null;

    for (const teamId in MOCK_INVITATIONS) {
        const invitation = MOCK_INVITATIONS[teamId].find(i => i.token === token);
        if (invitation) {
            foundInvitation = invitation;
            foundTeamId = teamId;
            break;
        }
    }

    if (!foundInvitation || !foundTeamId) {
        throw new Error('Invitation not found');
    }

    if (foundInvitation.status !== 'pending') {
        throw new Error(`Invitation is ${foundInvitation.status}`);
    }

    if (new Date(foundInvitation.expiresAt) < new Date()) {
        foundInvitation.status = 'expired';
        throw new Error('Invitation has expired');
    }

    // Mark invitation as accepted
    foundInvitation.status = 'accepted';
    foundInvitation.acceptedAt = new Date().toISOString();

    // Add user as team member
    const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        teamId: foundTeamId,
        userId: CURRENT_USER_ID,
        user: MOCK_USERS.currentUser,
        role: foundInvitation.role,
        permissions: DEFAULT_ROLE_PERMISSIONS[foundInvitation.role].map(action => ({
            id: `perm-${action}`,
            action,
            scope: action.split(':')[0] as 'team' | 'server' | 'process'
        })),
        joinedAt: new Date().toISOString()
    };

    MOCK_TEAM_MEMBERS[foundTeamId].push(newMember);

    // Update team member count
    const team = MOCK_TEAMS.find(t => t.id === foundTeamId);
    if (team) {
        team.memberCount = MOCK_TEAM_MEMBERS[foundTeamId].length;
    }

    return {
        team: team!,
        member: newMember
    };
}

/**
 * POST /api/teams/:teamId/leave
 * Current user leaves the team
 */
export async function mockLeaveTeam(teamId: string): Promise<void> {
    await delay(300);

    const members = MOCK_TEAM_MEMBERS[teamId];
    if (!members) {
        throw new Error('Team not found');
    }

    const memberIndex = members.findIndex(m => m.userId === CURRENT_USER_ID);
    if (memberIndex === -1) {
        throw new Error('You are not a member of this team');
    }

    // Owner cannot leave
    if (members[memberIndex].role === 'owner') {
        throw new Error('Team owner cannot leave. Transfer ownership first.');
    }

    members.splice(memberIndex, 1);

    // Update team member count
    const team = MOCK_TEAMS.find(t => t.id === teamId);
    if (team) {
        team.memberCount = members.length;
    }
}
