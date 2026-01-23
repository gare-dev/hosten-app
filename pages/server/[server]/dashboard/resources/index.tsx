'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import ServerLayout from '@/components/Layout/ServerLayout';
import styles from '@/styles/resources.module.scss';
import { ResourceResponse, ActionType, GroupedResource } from '@/types/resource';
import { useConfirm } from '@/context/confirm-context';
import { useAlert } from '@/context/alert-context';
import { Box, Plus, Trash2, CheckSquare, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { GetServerSideProps } from 'next';
import { dehydrate, QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import Api from '@/api';
import { useRouter } from 'next/router';
import resourceService from '@/services/resource-service';
import roleService from '@/services/role-service';
import { AxiosError } from 'axios';

const AVAILABLE_ACTIONS: ActionType[] = [
    'list', 'create', 'read', 'update', 'delete', 'start', 'stop', 'restart'
];

export const getServerSideProps: GetServerSideProps = async (context) => {
    const queryClient = new QueryClient();
    const { server: clientId } = context.params as { server: string };

    const cookie = context.req.headers.cookie ?? '';
    Api.setCookie(cookie);

    try {
        await queryClient.prefetchQuery({
            queryKey: ['resources', clientId],
            queryFn: () => resourceService().fetchResources(),
        });
        await queryClient.prefetchQuery({
            queryKey: ['roles'],
            queryFn: () => roleService().fetchRoles(),
        });
    } catch (error) {
        console.error('Error fetching resources:', error);
    }

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    };
};

export default function ResourcesPage() {
    const { confirm } = useConfirm();
    const { showAlert } = useAlert();
    const router = useRouter();
    const { server: clientId } = router.query as { server: string };

    const [resName, setResName] = useState('');
    const [selectedActions, setSelectedActions] = useState<ActionType[]>([]);
    const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
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

    const { data: resourcesData, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['resources', clientId],
        queryFn: () => resourceService().fetchResources(),
        enabled: !!clientId,
        staleTime: 1000 * 30,
    });

    const { data: rolesData } = useQuery({
        queryKey: ['roles'],
        queryFn: () => roleService().fetchRoles(),
        staleTime: 1000 * 60,
    });

    const groupedResources = useMemo((): GroupedResource[] => {
        if (!resourcesData) return [];

        const grouped = resourcesData.resources.reduce((acc, item) => {
            if (!acc[item.resource]) {
                acc[item.resource] = {
                    resource: item.resource,
                    actions: []
                };
            }
            acc[item.resource].actions.push({ id: item.id, action: item.action, roleIds: item.roleIds || [] });
            return acc;
        }, {} as Record<string, GroupedResource>);

        return Object.values(grouped);
    }, [resourcesData]);

    const { mutate: insertResource, isPending } = useMutation({
        mutationFn: resourceService().insertResource,
        onSuccess: (data) => {
            console.log(data)
            showAlert('success', `Resource created successfully.`);
            setResName('');
            setSelectedActions([]);
            refetch();
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                return showAlert('error', error.response?.data.message || error.response?.data.error.details[0].message);
            }
        }
    });

    const { mutate: deleteResource, isPending: isDeletePending } = useMutation({
        mutationFn: resourceService().deleteResource,
        onSuccess: () => {
            showAlert('success', 'Resource removed.');
            refetch();
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                return showAlert('error', error.response?.data.message || error.response?.data.error.details[0].message);
            }
        }
    });

    const { mutate: updateResourceRoles } = useMutation({
        mutationFn: resourceService().updateResourceRoles,
        onSuccess: () => {
            showAlert('success', 'Roles updated.');
            refetch();
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                return showAlert('error', error.response?.data.message || error.response?.data.error.details[0].message);
            }
        }
    });

    const { mutate: addRoleToResource } = useMutation({
        mutationFn: resourceService().addRoleToResource,
        onSuccess: () => {
            showAlert('success', 'Role added.');
            refetch();
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                return showAlert('error', error.response?.data.message || error.response?.data.error.details[0].message);
            }
        }
    });

    const { mutate: removeRoleFromResource } = useMutation({
        mutationFn: resourceService().removeRoleFromResource,
        onSuccess: () => {
            showAlert('success', 'Role removed.');
            refetch();
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                return showAlert('error', error.response?.data.message || error.response?.data.error.details[0].message);
            }
        }
    });

    const toggleAction = (action: ActionType) => {
        setSelectedActions(prev =>
            prev.includes(action)
                ? prev.filter(a => a !== action)
                : [...prev, action]
        );
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resName.trim()) {
            showAlert('warning', 'Resource name is required.');
            return;
        }
        if (selectedActions.length === 0) {
            showAlert('warning', 'Select at least one action for this resource.');
            return;
        }

        insertResource({ name: resName.toLowerCase(), actions: selectedActions });
    };

    const handleDelete = async (id: string, resourceName: string, actionName: string) => {
        const isConfirmed = await confirm({
            title: 'Delete Action?',
            message: `Are you sure you want to remove the action "${actionName}" from resource "${resourceName}"?`,
            variant: 'danger',
            confirmText: 'Yes, delete'
        });

        if (isConfirmed) {
            deleteResource(id);
        }
    };

    const toggleExpanded = (resource: string) => {
        setExpandedResources(prev => {
            const newSet = new Set(prev);
            if (newSet.has(resource)) {
                newSet.delete(resource);
            } else {
                newSet.add(resource);
            }
            return newSet;
        });
    };

    const handleRoleToggle = (resourceId: string, roleId: string, currentRoleIds: string[]) => {
        const isRemoving = currentRoleIds.includes(roleId);

        if (isRemoving) {
            removeRoleFromResource({ resourceId, roleId });
        } else {
            addRoleToResource({ resourceId, roleId });
        }
    };

    const getRoleNames = (roleIds: string[]) => {
        if (!rolesData || roleIds.length === 0) return 'No roles';
        return roleIds
            .map(id => rolesData.find(role => role.id === id)?.name)
            .filter(Boolean)
            .join(', ') || 'No roles';
    };

    const loading = isLoading || isFetching || isPending || isDeletePending;

    return (
        <ServerLayout serverName="gare-server" clientId={clientId}>

            <div className={styles.container}>

                <section className={styles.listSection}>
                    <div className={styles.header}>
                        <h2>
                            <Box size={20} color="#284999" />
                            Resources & Actions
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Total: {groupedResources.length}
                        </span>
                    </div>

                    <div className={styles.tableContainer}>
                        {groupedResources.length > 0 ? (
                            <table className={styles.resourceTable}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Resource</th>
                                        <th>Actions Count</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedResources.map((res) => {
                                        const isExpanded = expandedResources.has(res.resource);
                                        return (
                                            <React.Fragment key={res.resource}>
                                                <tr
                                                    className={styles.resourceRow}
                                                    onClick={() => toggleExpanded(res.resource)}
                                                >
                                                    <td className={styles.expandCell}>
                                                        {isExpanded ? (
                                                            <ChevronDown size={18} />
                                                        ) : (
                                                            <ChevronRight size={18} />
                                                        )}
                                                    </td>
                                                    <td>
                                                        <strong style={{ color: '#1e293b' }}>{res.resource}</strong>
                                                    </td>
                                                    <td>
                                                        <span className={styles.countBadge}>
                                                            {res.actions.length} {res.actions.length === 1 ? 'action' : 'actions'}
                                                        </span>
                                                    </td>
                                                    <td></td>
                                                </tr>
                                                {isExpanded && res.actions.map((actionItem) => (
                                                    <tr key={actionItem.id} className={styles.actionDetailRow}>
                                                        <td></td>
                                                        <td className={styles.actionDetailCell}>
                                                            <span className={styles.actionBadge}>
                                                                {actionItem.action}
                                                            </span>
                                                        </td>
                                                        <td className={styles.rolesCell}>
                                                            <div
                                                                className={styles.rolesDropdownWrapper}
                                                                ref={openDropdown === actionItem.id ? dropdownRef : null}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className={styles.rolesDropdownBtn}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenDropdown(openDropdown === actionItem.id ? null : actionItem.id);
                                                                    }}
                                                                >
                                                                    <Users size={14} />
                                                                    <span>{getRoleNames(actionItem.roleIds)}</span>
                                                                    <ChevronDown size={14} />
                                                                </button>
                                                                {openDropdown === actionItem.id && (
                                                                    <div className={styles.rolesDropdownMenu}>
                                                                        {rolesData && rolesData.length > 0 ? (
                                                                            rolesData.map(role => (
                                                                                <label
                                                                                    key={role.id}
                                                                                    className={styles.roleOption}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={actionItem.roleIds.includes(role.id)}
                                                                                        onChange={() => handleRoleToggle(actionItem.id, role.id, actionItem.roleIds)}
                                                                                    />
                                                                                    <span>{role.name}</span>
                                                                                </label>
                                                                            ))
                                                                        ) : (
                                                                            <div className={styles.noRoles}>No roles available</div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className={styles.actions}>
                                                            <button
                                                                className={styles.deleteBtn}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(actionItem.id, res.resource, actionItem.action);
                                                                }}
                                                                title={`Delete ${actionItem.action}`}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles.emptyState}>
                                No resources defined. Add the first one.
                            </div>
                        )}
                    </div>
                </section>

                <aside className={styles.createSection}>
                    <h3>Define New Resource</h3>

                    <form onSubmit={handleCreate}>
                        <div className={styles.formGroup}>
                            <label htmlFor="resName">Resource Name</label>
                            <input
                                style={{ width: '90%' }}
                                type="text"
                                id="resName"
                                placeholder="Ex: databases"
                                value={resName}
                                onChange={(e) => setResName(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Available Actions</label>
                            <div className={styles.actionSelectorGrid}>
                                {AVAILABLE_ACTIONS.map((action) => {
                                    const isSelected = selectedActions.includes(action);
                                    return (
                                        <div
                                            key={action}
                                            className={`${styles.actionCheckbox} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => toggleAction(action)}
                                        >
                                            {isSelected && <CheckSquare size={14} style={{ marginRight: 6 }} />}
                                            {action}
                                        </div>
                                    );
                                })}
                            </div>
                            <small style={{ display: 'block', marginTop: 8, color: '#94a3b8', fontSize: '0.75rem' }}>
                                Select all actions this resource supports.
                            </small>
                        </div>

                        <button
                            type="submit"
                            className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
                            disabled={loading || !resName.trim() || selectedActions.length === 0}
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Plus size={18} /> Create Definition
                                </>
                            )}
                        </button>
                    </form>
                </aside>

            </div>
        </ServerLayout>
    );
}