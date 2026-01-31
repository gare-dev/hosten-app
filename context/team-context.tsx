'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { teamService } from '@/services/team-service';
import {
    Team,
    TeamMember,
    TeamInvitation,
    TeamDetailsResponse,
    TeamPermissionAction,
    TeamRole,
    hasPermission,
    hasAnyPermission
} from '@/types/team';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TeamContextState {
    // Current team
    currentTeam: Team | null;
    currentTeamDetails: TeamDetailsResponse | null;
    isLoadingTeam: boolean;

    // All teams
    teams: Team[];
    isLoadingTeams: boolean;

    // Current user's role and permissions in current team
    currentUserRole: TeamRole | null;
    currentUserPermissions: TeamPermissionAction[];

    // Actions
    selectTeam: (teamId: string | null) => void;
    refreshTeams: () => Promise<void>;
    refreshCurrentTeam: () => Promise<void>;

    // Permission helpers
    can: (permission: TeamPermissionAction) => boolean;
    canAny: (permissions: TeamPermissionAction[]) => boolean;
    isOwner: () => boolean;
    isAdmin: () => boolean;
}

const TeamContext = createContext<TeamContextState | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Storage Key
// ─────────────────────────────────────────────────────────────────────────────

const SELECTED_TEAM_KEY = 'hosten:selectedTeamId';

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface TeamProviderProps {
    children: ReactNode;
}

export function TeamProvider({ children }: TeamProviderProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/register', '/invite'];
    const isPublicRoute = publicRoutes.some(route =>
        router.pathname === route || router.pathname.startsWith('/invite/')
    );

    // Load saved team ID from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTeamId = localStorage.getItem(SELECTED_TEAM_KEY);
            if (savedTeamId) {
                setSelectedTeamId(savedTeamId);
            }
        }
    }, []);

    // Fetch all teams - only when not on public routes
    const {
        data: teamsData,
        isLoading: isLoadingTeams,
        refetch: refetchTeams
    } = useQuery({
        queryKey: ['teams'],
        queryFn: teamService.getTeams,
        staleTime: 60000,
        enabled: !isPublicRoute,
    });

    const teams = teamsData?.teams || [];

    // Auto-select first team if none selected
    useEffect(() => {
        if (!selectedTeamId && teams.length > 0) {
            setSelectedTeamId(teams[0].id);
            if (typeof window !== 'undefined') {
                localStorage.setItem(SELECTED_TEAM_KEY, teams[0].id);
            }
        }
    }, [teams, selectedTeamId]);

    // Fetch current team details
    const {
        data: currentTeamDetails,
        isLoading: isLoadingTeam,
        refetch: refetchCurrentTeam
    } = useQuery({
        queryKey: ['team', selectedTeamId],
        queryFn: () => selectedTeamId ? teamService.getTeam(selectedTeamId) : null,
        enabled: !!selectedTeamId,
        staleTime: 30000,
    });

    const currentTeam = currentTeamDetails?.team || null;
    const currentUserRole = currentTeamDetails?.currentUserRole || null;
    const currentUserPermissions = currentTeamDetails?.currentUserPermissions || [];

    // Select team
    const selectTeam = useCallback((teamId: string | null) => {
        setSelectedTeamId(teamId);
        if (typeof window !== 'undefined') {
            if (teamId) {
                localStorage.setItem(SELECTED_TEAM_KEY, teamId);
            } else {
                localStorage.removeItem(SELECTED_TEAM_KEY);
            }
        }
    }, []);

    // Refresh teams
    const refreshTeams = useCallback(async () => {
        await refetchTeams();
    }, [refetchTeams]);

    // Refresh current team
    const refreshCurrentTeam = useCallback(async () => {
        await refetchCurrentTeam();
    }, [refetchCurrentTeam]);

    // Permission helpers
    const can = useCallback((permission: TeamPermissionAction): boolean => {
        return hasPermission(currentUserPermissions, permission);
    }, [currentUserPermissions]);

    const canAny = useCallback((permissions: TeamPermissionAction[]): boolean => {
        return hasAnyPermission(currentUserPermissions, permissions);
    }, [currentUserPermissions]);

    const isOwner = useCallback((): boolean => {
        return currentUserRole === 'owner';
    }, [currentUserRole]);

    const isAdmin = useCallback((): boolean => {
        return currentUserRole === 'owner' || currentUserRole === 'admin';
    }, [currentUserRole]);

    const value: TeamContextState = {
        currentTeam,
        currentTeamDetails: currentTeamDetails ?? null,
        isLoadingTeam,
        teams,
        isLoadingTeams,
        currentUserRole,
        currentUserPermissions,
        selectTeam,
        refreshTeams,
        refreshCurrentTeam,
        can,
        canAny,
        isOwner,
        isAdmin,
    };

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useTeam() {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission-based UI helpers
// ─────────────────────────────────────────────────────────────────────────────

interface RequirePermissionProps {
    permission: TeamPermissionAction;
    children: ReactNode;
    fallback?: ReactNode;
}

export function RequirePermission({ permission, children, fallback = null }: RequirePermissionProps) {
    const { can } = useTeam();

    if (!can(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

interface RequireAnyPermissionProps {
    permissions: TeamPermissionAction[];
    children: ReactNode;
    fallback?: ReactNode;
}

export function RequireAnyPermission({ permissions, children, fallback = null }: RequireAnyPermissionProps) {
    const { canAny } = useTeam();

    if (!canAny(permissions)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

interface RequireRoleProps {
    role: TeamRole | TeamRole[];
    children: ReactNode;
    fallback?: ReactNode;
}

export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
    const { currentUserRole } = useTeam();

    const roles = Array.isArray(role) ? role : [role];

    if (!currentUserRole || !roles.includes(currentUserRole)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
