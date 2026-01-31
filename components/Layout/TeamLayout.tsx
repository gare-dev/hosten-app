'use client';

import React, { useState } from 'react';
import {
    LogOut,
    Menu,
    X,
    Users
} from 'lucide-react';
import styles from '@/styles/teamlayout.module.scss';
import { useRouter } from 'next/router';
import { useConfirm } from '@/context/confirm-context';
import { ThemeToggle } from '@/context/theme-context';
import { Sidebar } from '@/components/Sidebar';
import { useTeam } from '@/context/team-context';
import Api from '@/api';
import { useQueryClient } from '@tanstack/react-query';

interface TeamLayoutProps {
    children: React.ReactNode;
}

export default function TeamLayout({ children }: TeamLayoutProps) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { confirm } = useConfirm();
    const queryClient = useQueryClient();
    const { currentTeam, isLoadingTeam } = useTeam();

    const handleLogout = async () => {
        const confirmLogout = await confirm({
            message: 'Are you sure you want to log out?',
            title: 'Logout Confirmation',
            confirmText: 'Log out',
            cancelText: 'Cancel'
        });

        if (confirmLogout) {
            const response = await Api.logout();
            queryClient.clear();

            if (response.status === 200) {
                router.push('/');
            }
        }
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className={styles.layoutContainer}>
            <div
                className={`${styles.overlay} ${isSidebarOpen ? styles.visible : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                <Sidebar
                    variant="team"
                    onClose={closeSidebar}
                />
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            className={styles.menuToggle}
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className={styles.teamInfo}>
                            <h2>
                                <Users size={20} style={{ marginRight: 8 }} />
                                {isLoadingTeam ? 'Loading...' : currentTeam?.name || 'No Team Selected'}
                            </h2>
                            {currentTeam?.description && (
                                <span>{currentTeam.description}</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.headerActions}>
                        <ThemeToggle className={styles.themeToggle} />
                        <button onClick={() => router.push('/servers')} className={styles.serversBtn}>
                            Servers
                        </button>
                        <button onClick={handleLogout} className={styles.logoffBtn}>
                            <LogOut size={18} /> <span>Log out</span>
                        </button>
                    </div>
                </header>

                <div className={styles.pageBody}>
                    {children}
                </div>
            </main>
        </div>
    );
}
