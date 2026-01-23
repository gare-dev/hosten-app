'use client';

import React, { use, useState } from 'react';
import ServerLayout from '@/components/Layout/ServerLayout';
import styles from '@/styles/roles.module.scss';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import Api from '@/api';
import roleService from '@/services/role-service';
import { useAlert } from '@/context/alert-context';
import { AxiosError } from 'axios';
import { useConfirm } from '@/context/confirm-context';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const queryClient = new QueryClient();
    const { server: clientId } = context.params as { server: string };

    const cookie = context.req.headers.cookie ?? '';
    Api.setCookie(cookie);

    try {
        await queryClient.prefetchQuery({
            queryKey: ['roles', clientId],
            queryFn: () => roleService().fetchRoles(),
        });
    } catch (error) {
        console.error('Error fetching processes:', error);
    }

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    };
};

export default function RolesPage() {
    const router = useRouter()
    const [newRoleName, setNewRoleName] = useState('');
    const { server: clientId } = router.query as { server: string };
    const { showAlert } = useAlert();
    const { confirm } = useConfirm();

    const { data: rolesData, isLoading, isFetching } = useQuery({
        queryKey: ['roles', clientId],
        queryFn: () => roleService().fetchRoles(),
        enabled: !!clientId,
        staleTime: 1000 * 30,
    });

    const { mutate: insertRole, isPending } = useMutation({
        mutationFn: roleService().insertRole,
        onSuccess: (data) => {
            showAlert('success', 'Role created successfully!');
            setNewRoleName('');
            rolesData?.push({ id: data.id, name: data.name })

        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                return showAlert('error', error.response?.data.message || error.response?.data.error.details[0].message);
            }
        }
    });

    const { mutate: deleteRole, isPending: isDeletePending } = useMutation({
        mutationFn: roleService().deleteRole,
        onSuccess: (data) => {
            showAlert('success', 'Role deleted successfully!');
            setNewRoleName('');
            rolesData?.splice(rolesData?.findIndex(role => role.id === data.data.id), 1);

        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                return showAlert('error', error.response?.data.message || error.response?.data.error.details[0].message);
            }
        }
    });

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;

        insertRole(newRoleName);

    };

    const handleDeleteRole = async (id: string) => {
        const isConfirmed = await confirm({
            title: 'Confirm Deletion',
            message: 'Are you sure you want to delete this role?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger'
        })
        if (isConfirmed) {
            deleteRole(id);
        }
    };

    const loading = isLoading || isFetching || isPending;


    return (
        <ServerLayout serverName="gare-server" clientId={clientId}>

            <div className={styles.container}>
                <section className={styles.listSection}>
                    <div className={styles.header}>
                        <h2>
                            <Shield size={20} color="#284999" />
                            Existing Roles
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Total: {rolesData?.length ?? 0}
                        </span>
                    </div>

                    <div className={styles.tableContainer}>
                        {rolesData?.length ?? 0 > 0 ? (
                            <table className={styles.roleTable}>
                                <thead>
                                    <tr>
                                        <th>Role Name</th>

                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rolesData?.map((role) => (
                                        <tr key={role.id}>
                                            <td>
                                                <span className={styles.badge}>{role.name}</span>
                                            </td>
                                            <td className={styles.actions}>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteRole(role.id)}
                                                    title="Delete Role"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles.emptyState}>
                                No roles found. Create the first one on the side.
                            </div>
                        )}
                    </div>
                </section>

                <aside className={styles.createSection}>
                    <h3>Create New Role</h3>

                    <form onSubmit={handleCreateRole}>
                        <div className={styles.formGroup}>
                            <label htmlFor="roleName">Role Name</label>
                            <input
                                type="text"
                                id="roleName"
                                placeholder="Ex: admin"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                autoComplete="off"
                            />
                            <small style={{ display: 'block', marginTop: 6, color: '#94a3b8', fontSize: '0.75rem' }}>
                                Use descriptive names. Permissions will be configured in the next step.
                            </small>
                        </div>

                        <button
                            type="submit"
                            className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
                            disabled={loading || !newRoleName.trim()}
                        >
                            {loading ? (
                                'Creating...'
                            ) : (
                                <>
                                    <Plus size={18} /> Add Role
                                </>
                            )}
                        </button>
                    </form>
                </aside>

            </div>

        </ServerLayout>
    );
}