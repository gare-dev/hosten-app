import Api from "@/api";
import {
    Team,
    TeamMember,
    TeamInvitation,
    TeamsResponse,
    TeamDetailsResponse,
    CreateTeamPayload,
    UpdateTeamPayload,
    CreateInvitationPayload,
    InvitationResponse,
    UpdateMemberPayload,
    TeamRole,
    TeamPermissionAction
} from "@/types/team";

// Import mocks
import {
    mockGetTeams,
    mockGetTeam,
    mockCreateTeam,
    mockUpdateTeam,
    mockDeleteTeam,
    mockGetTeamMembers,
    mockRemoveTeamMember,
    mockUpdateMemberRole,
    mockGetTeamInvitations,
    mockCreateInvitation,
    mockRevokeInvitation,
    mockResendInvitation,
    mockGetInvitationByToken,
    mockAcceptInvitation,
    mockLeaveTeam
} from "@/mocks/team-mocks";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

// Set to true to use mock data, false to use real API
const USE_MOCKS = true;

// ─────────────────────────────────────────────────────────────────────────────
// Team Service
// ─────────────────────────────────────────────────────────────────────────────

export const teamService = {
    // ─────────────────────────────────────────────────────────────────────────
    // Teams
    // ─────────────────────────────────────────────────────────────────────────

    async getTeams(): Promise<TeamsResponse> {
        if (USE_MOCKS) {
            return mockGetTeams();
        }
        const response = await Api.getTeams();
        return response.data;
    },

    async getTeam(teamId: string): Promise<TeamDetailsResponse> {
        if (USE_MOCKS) {
            return mockGetTeam(teamId);
        }
        const response = await Api.getTeam(teamId);

        console.log(response.data)
        return response.data;
    },

    async createTeam(data: CreateTeamPayload): Promise<Team> {
        if (USE_MOCKS) {
            return mockCreateTeam(data);
        }
        const response = await Api.createTeam(data);
        return response.data;
    },

    async updateTeam(teamId: string, data: UpdateTeamPayload): Promise<Team> {
        if (USE_MOCKS) {
            return mockUpdateTeam(teamId, data);
        }
        const response = await Api.updateTeam(teamId, data);
        return response.data;
    },

    async deleteTeam(teamId: string): Promise<void> {
        if (USE_MOCKS) {
            return mockDeleteTeam(teamId);
        }
        await Api.deleteTeam(teamId);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Members
    // ─────────────────────────────────────────────────────────────────────────

    async getTeamMembers(teamId: string): Promise<TeamMember[]> {
        if (USE_MOCKS) {
            return mockGetTeamMembers(teamId);
        }
        const response = await Api.getTeamMembers(teamId);
        return response.data;
    },

    async updateTeamMember(teamId: string, memberId: string, data: UpdateMemberPayload): Promise<TeamMember> {
        if (USE_MOCKS) {
            // Mock doesn't have this specific function, use updateMemberRole if role is being updated
            if (data.role) {
                return mockUpdateMemberRole(teamId, memberId, data.role);
            }
            throw new Error('Mock not implemented for this operation');
        }
        const response = await Api.updateTeamMember(teamId, memberId, data);
        return response.data;
    },

    async removeTeamMember(teamId: string, memberId: string): Promise<void> {
        if (USE_MOCKS) {
            return mockRemoveTeamMember(teamId, memberId);
        }
        await Api.removeTeamMember(teamId, memberId);
    },

    async leaveTeam(teamId: string): Promise<void> {
        if (USE_MOCKS) {
            return mockLeaveTeam(teamId);
        }
        await Api.leaveTeam(teamId);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Invitations
    // ─────────────────────────────────────────────────────────────────────────

    async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
        if (USE_MOCKS) {
            return mockGetTeamInvitations(teamId);
        }
        const response = await Api.getTeamInvitations(teamId);
        return response.data;
    },

    async createInvitation(data: CreateInvitationPayload): Promise<InvitationResponse> {
        if (USE_MOCKS) {
            return mockCreateInvitation(data);
        }
        const response = await Api.createInvitation(data);
        return response.data;
    },

    async revokeInvitation(teamId: string, invitationId: string): Promise<void> {
        if (USE_MOCKS) {
            return mockRevokeInvitation(teamId, invitationId);
        }
        await Api.revokeInvitation(teamId, invitationId);
    },

    async resendInvitation(teamId: string, invitationId: string): Promise<InvitationResponse> {
        if (USE_MOCKS) {
            const invitation = await mockResendInvitation(teamId, invitationId);
            return {
                invitation,
                inviteLink: `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${invitation.token}`
            };
        }
        const response = await Api.resendInvitation(teamId, invitationId);
        return response.data;
    },

    async getInvitationByToken(token: string): Promise<TeamInvitation> {
        if (USE_MOCKS) {
            return mockGetInvitationByToken(token);
        }
        const response = await Api.getInvitationByToken(token);
        return response.data;
    },

    async acceptInvitation(token: string): Promise<{ team: Team; member: TeamMember }> {
        if (USE_MOCKS) {
            return mockAcceptInvitation(token);
        }
        const response = await Api.acceptInvitation(token);
        return response.data;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Permissions & Roles
    // ─────────────────────────────────────────────────────────────────────────

    async updateMemberPermissions(teamId: string, memberId: string, permissions: TeamPermissionAction[]): Promise<TeamMember> {
        if (USE_MOCKS) {
            // Mock doesn't implement custom permissions, just return the member
            const members = await mockGetTeamMembers(teamId);
            const member = members.find(m => m.id === memberId);
            if (!member) throw new Error('Member not found');
            return member;
        }
        const response = await Api.updateMemberPermissions(teamId, memberId, permissions);
        return response.data;
    },

    async updateMemberRole(teamId: string, memberId: string, role: TeamRole): Promise<TeamMember> {
        if (USE_MOCKS) {
            return mockUpdateMemberRole(teamId, memberId, role);
        }
        const response = await Api.updateMemberRole(teamId, memberId, role);
        return response.data;
    }
};

export default teamService;
