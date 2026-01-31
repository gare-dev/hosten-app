'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    LayoutDashboard,
    Shield,
    ChevronDown,
    ChevronRight,
    Server,
    Users,
    UserPlus,
    Settings,
    Key,
    Building2,
    Check,
    Plus,
    Loader2
} from 'lucide-react';
import styles from '@/styles/sidebar.module.scss';
import { useTeam } from '@/context/team-context';
import { Team } from '@/types/team';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarProps {
    variant: 'server' | 'team';
    clientId?: string;
    onClose?: () => void;
}

interface NavSection {
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    permission?: string;
    children?: {
        id: string;
        label: string;
        href: string;
        permission?: string;
    }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Sidebar({ variant, clientId, onClose }: SidebarProps) {
    const router = useRouter();
    const { teams, currentTeam, selectTeam, isLoadingTeams, can } = useTeam();
    const [openSections, setOpenSections] = useState<string[]>([]);
    const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState(false);

    const currentPath = router.pathname;

    // Build navigation based on variant
    const getNavSections = (): NavSection[] => {
        if (variant === 'server') {
            return [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: <LayoutDashboard size={20} />,
                    href: `/server/${clientId}/dashboard`
                },
                {
                    id: 'team',
                    label: 'Team',
                    icon: <Users size={20} />,
                    children: [
                        { id: 'members', label: 'Members', href: `/server/${clientId}/dashboard/team/members` },
                        { id: 'invitations', label: 'Invitations', href: `/server/${clientId}/dashboard/team/invitations`, permission: 'team:invite_members' },
                        { id: 'roles', label: 'Roles', href: `/server/${clientId}/dashboard/team/roles`, permission: 'team:manage_roles' },
                        { id: 'permissions', label: 'Permissions', href: `/server/${clientId}/dashboard/team/permissions`, permission: 'team:manage_permissions' },
                    ]
                },
                {
                    id: 'permissions',
                    label: 'Permissions',
                    icon: <Shield size={20} />,
                    children: [
                        { id: 'server-roles', label: 'Roles', href: `/server/${clientId}/dashboard/roles` },
                        { id: 'resources', label: 'Resources & Actions', href: `/server/${clientId}/dashboard/resources` },
                        { id: 'user-roles', label: 'Assign User Role', href: `/server/${clientId}/dashboard/user-roles` },
                    ]
                }
            ];
        }

        // Team variant (standalone team pages)
        return [
            {
                id: 'overview',
                label: 'Overview',
                icon: <LayoutDashboard size={20} />,
                href: `/team/${currentTeam?.id}`
            },
            {
                id: 'servers',
                label: 'Servers',
                icon: <Server size={20} />,
                href: `/team/${currentTeam?.id}/servers`
            },
            {
                id: 'members',
                label: 'Members',
                icon: <Users size={20} />,
                href: `/team/${currentTeam?.id}/members`
            },
            {
                id: 'invitations',
                label: 'Invitations',
                icon: <UserPlus size={20} />,
                href: `/team/${currentTeam?.id}/invitations`,
                permission: 'team:invite_members'
            },
            {
                id: 'roles',
                label: 'Roles & Permissions',
                icon: <Key size={20} />,
                href: `/team/${currentTeam?.id}/roles`,
                permission: 'team:manage_roles'
            },
            {
                id: 'settings',
                label: 'Settings',
                icon: <Settings size={20} />,
                href: `/team/${currentTeam?.id}/settings`,
                permission: 'team:edit'
            }
        ];
    };

    const navSections = getNavSections();

    // Auto-open sections based on current path
    useEffect(() => {
        navSections.forEach(section => {
            if (section.children?.some(child => currentPath.includes(child.href))) {
                setOpenSections(prev => prev.includes(section.id) ? prev : [...prev, section.id]);
            }
        });
    }, [currentPath]);

    const toggleSection = (sectionId: string) => {
        setOpenSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const isActive = (href: string) => {
        return currentPath === href || currentPath.startsWith(href + '/');
    };

    const isSectionActive = (section: NavSection) => {
        if (section.href) return isActive(section.href);
        return section.children?.some(child => isActive(child.href)) || false;
    };

    const handleNavClick = (href?: string) => {
        if (href) {
            router.push(href);
            onClose?.();
        }
    };

    const handleTeamSelect = (team: Team) => {
        selectTeam(team.id);
        setIsTeamSelectorOpen(false);
    };

    return (
        <div className={styles.sidebar}>
            {/* Brand */}
            <div className={styles.brand}>
                <Server style={{ marginRight: 10 }} />
                Hosten<span>Manager</span>
            </div>

            {/* Team Selector */}
            <div className={styles.teamSelector}>
                <button
                    className={styles.teamSelectorBtn}
                    onClick={() => setIsTeamSelectorOpen(!isTeamSelectorOpen)}
                >
                    <div className={styles.teamInfo}>
                        <Building2 size={18} />
                        <span className={styles.teamName}>
                            {isLoadingTeams ? 'Loading...' : (currentTeam?.name || 'Select Team')}
                        </span>
                    </div>
                    <ChevronDown
                        size={16}
                        className={`${styles.chevron} ${isTeamSelectorOpen ? styles.open : ''}`}
                    />
                </button>

                {isTeamSelectorOpen && (
                    <div className={styles.teamDropdown}>
                        {isLoadingTeams ? (
                            <div className={styles.loadingTeams}>
                                <Loader2 size={16} className={styles.spinner} />
                                <span>Loading teams...</span>
                            </div>
                        ) : teams.length === 0 ? (
                            <div className={styles.noTeams}>
                                <span>No teams yet</span>
                            </div>
                        ) : (
                            <>
                                {teams.map(team => (
                                    <button
                                        key={team.id}
                                        className={`${styles.teamOption} ${currentTeam?.id === team.id ? styles.active : ''}`}
                                        onClick={() => handleTeamSelect(team)}
                                    >
                                        <span>{team.name}</span>
                                        {currentTeam?.id === team.id && <Check size={14} />}
                                    </button>
                                ))}
                            </>
                        )}
                        <div className={styles.teamDivider} />
                        <button
                            className={styles.createTeamBtn}
                            onClick={() => {
                                router.push('/teams/create');
                                setIsTeamSelectorOpen(false);
                                onClose?.();
                            }}
                        >
                            <Plus size={16} />
                            <span>Create New Team</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navSections.map(section => {
                    // Skip items that require permissions the user doesn't have
                    if (section.permission && !can(section.permission as any)) {
                        return null;
                    }

                    const hasChildren = section.children && section.children.length > 0;
                    const isOpen = openSections.includes(section.id);
                    const active = isSectionActive(section);

                    return (
                        <div key={section.id} className={styles.navSection}>
                            <div
                                className={`${styles.navItem} ${active ? styles.active : ''}`}
                                onClick={() => hasChildren ? toggleSection(section.id) : handleNavClick(section.href)}
                            >
                                <div className={styles.label}>
                                    {section.icon}
                                    {section.label}
                                </div>
                                {hasChildren && (
                                    isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                                )}
                            </div>

                            {hasChildren && (
                                <div className={`${styles.subMenu} ${isOpen ? styles.open : ''}`}>
                                    {section.children!.map(child => {
                                        // Skip items that require permissions the user doesn't have
                                        if (child.permission && !can(child.permission as any)) {
                                            return null;
                                        }

                                        return (
                                            <Link
                                                key={child.id}
                                                href={child.href}
                                                className={`${styles.subItem} ${isActive(child.href) ? styles.activeSubItem : ''}`}
                                                onClick={() => onClose?.()}
                                            >
                                                {child.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
