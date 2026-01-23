'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import ServerLayout from '@/components/Layout/ServerLayout';
import styles from '@/styles/userroles.module.scss';
import { useAlert } from '@/context/alert-context';
import { Users, ChevronDown, Shield, Info } from 'lucide-react';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import Api from '@/api';
import { useRouter } from 'next/router';
import userService from '@/services/user-service';
import roleService from '@/services/role-service';
import { AxiosError } from 'axios';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const queryClient = new QueryClient();
    const { server: clientId } = context.params as { server: string };

    const cookie = context.req.headers.cookie ?? '';
    Api.setCookie(cookie);

    try {
        await queryClient.prefetchQuery({
            queryKey: ['users', clientId],
            queryFn: () => userService().fetchUsers(),
        });
        await queryClient.prefetchQuery({
            queryKey: ['roles'],
            queryFn: () => roleService().fetchRoles(),
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    return {
        props: {
            dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
        },
    };
};

export default function UserRolesPage() {
    const { showAlert } = useAlert();
    const router = useRouter();
    const { server: clientId } = router.query as { server: string };

    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { data: usersData, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['users', clientId],
        queryFn: () => userService().fetchUsers(),
        enabled: !!clientId,
        staleTime: 1000 * 30,
    });

    const { data: rolesData } = useQuery({
        queryKey: ['roles'],
        queryFn: () => roleService().fetchRoles(),
        staleTime: 1000 * 60,
    });

    const filteredUsers = useMemo(() => {
        if (!usersData) return [];
        if (!searchTerm.trim()) return usersData;

        const term = searchTerm.toLowerCase();
        return usersData.filter(user =>
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
    }, [usersData, searchTerm]);

    const { mutate: addRoleToUser } = useMutation({
        mutationFn: userService().addRoleToUser,
        onSuccess: () => {
            showAlert('success', 'Role assigned successfully.');
            refetch();
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                return showAlert('error', error.response?.data.message || error.response?.data.error.details[0].message);
            }
        }
    });

    const { mutate: removeRoleFromUser } = useMutation({
        mutationFn: userService().removeRoleFromUser,
        onSuccess: () => {
            showAlert('success', 'Role removed successfully.');
            refetch();
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                return showAlert('error', error.response?.data.message || error.response?.data.error.details[0].message);
            }
        }
    });

    const handleRoleToggle = (userId: string, roleId: string, currentRoleIds: string[]) => {
        const isRemoving = currentRoleIds.includes(roleId);

        if (isRemoving) {
            removeRoleFromUser({ userId, roleId });
        } else {
            addRoleToUser({ userId, roleId });
        }
    };

    const getRoleNames = (roles: { id: string; name: string }[]) => {
        if (!roles || roles.length === 0) return 'No roles assigned';
        return roles
            .map(role => role.name)
            .filter(Boolean)
            .join(', ') || 'No roles assigned';
    };

    const loading = isLoading || isFetching;

    return (
        <ServerLayout serverName="gare-server" clientId={clientId}>
            <div className={styles.container}>
                <section className={styles.listSection}>
                    <div className={styles.header}>
                        <h2>
                            <Users size={20} color="#284999" />
                            User Role Assignment
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Total: {usersData?.length ?? 0} users
                        </span>
                    </div>

                    <div className={styles.searchSection}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.tableContainer}>
                        {filteredUsers.length > 0 ? (
                            <table className={styles.userTable}>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Roles</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className={styles.userInfo}>
                                                    <span className={styles.userName}>{user.username}</span>
                                                    <span className={styles.userEmail}>{user.email}</span>
                                                </div>
                                            </td>
                                            <td className={styles.rolesCell}>
                                                <div
                                                    className={styles.rolesDropdownWrapper}
                                                    ref={openDropdown === user.id ? dropdownRef : null}
                                                >
                                                    <button
                                                        type="button"
                                                        className={styles.rolesDropdownBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (openDropdown === user.id) {
                                                                setOpenDropdown(null);
                                                            } else {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setDropdownPosition({
                                                                    top: rect.bottom + 4,
                                                                    left: rect.left
                                                                });
                                                                setOpenDropdown(user.id);
                                                            }
                                                        }}
                                                    >
                                                        <Shield size={14} />
                                                        <span>{getRoleNames(user.roles)}</span>
                                                        <ChevronDown size={14} />
                                                    </button>
                                                    {openDropdown === user.id && (
                                                        <div 
                                                            className={styles.rolesDropdownMenu}
                                                            style={{
                                                                position: 'fixed',
                                                                top: dropdownPosition.top,
                                                                left: dropdownPosition.left
                                                            }}
                                                        >
                                                            {rolesData && rolesData.length > 0 ? (
                                                                rolesData.map(role => (
                                                                    <label
                                                                        key={role.id}
                                                                        className={styles.roleOption}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={user.roles.some(r => r.id === role.id)}
                                                                            onChange={() => handleRoleToggle(user.id, role.id, user.roles.map(r => r.id))}
                                                                        />
                                                                        <span>{role.name}</span>
                                                                    </label>
                                                                ))
                                                            ) : (
                                                                <div className={styles.noRoles}>
                                                                    No roles available. Create roles first.
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles.emptyState}>
                                {loading ? 'Loading users...' :
                                    searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
                            </div>
                        )}
                    </div>
                </section>

                <aside className={styles.infoCard}>
                    <h3>
                        <Info size={18} color="#284999" />
                        About User Roles
                    </h3>
                    <p>
                        Assign roles to users to control their access permissions across resources and actions.
                    </p>
                    <ul>
                        <li>Each user can have multiple roles</li>
                        <li>Roles define what actions a user can perform</li>
                        <li>Create roles in the <strong>Roles</strong> section</li>
                        <li>Configure role permissions in <strong>Resources & Actions</strong></li>
                    </ul>
                </aside>
            </div>
        </ServerLayout>
    );
}
