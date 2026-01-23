'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Shield,
    LogOut,
    ChevronDown,
    ChevronRight,
    Server,
    UserCog,
    Key,
    FileCheck,
    SquareStop,
    CircleStop,
    SquareX,
    Menu,
    X
} from 'lucide-react';
import styles from '@/styles/serverlayout.module.scss';
import { useRouter } from 'next/router';
import { useConfirm } from '@/context/confirm-context';
import Api from '@/api';

interface ServerLayoutProps {
    children: React.ReactNode;
    serverName?: string;
    clientId?: string;
}

export default function ServerLayout({ children, serverName = "Unknown Server", clientId = "..." }: ServerLayoutProps) {
    const router = useRouter();
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { confirm } = useConfirm()

    const { server: clientIdFromQuery } = router.query as { server: string };
    const currentPath = router.pathname;

    // Determina qual item está ativo baseado na rota atual
    const isActive = (path: string) => {
        if (path === 'dashboard') {
            return currentPath === '/server/[server]/dashboard';
        }
        if (path === 'roles') {
            return currentPath.includes('/roles');
        }
        if (path === 'resources') {
            return currentPath.includes('/resources');
        }
        if (path === 'user-roles') {
            return currentPath.includes('/user-roles');
        }
        return false;
    };

    const isPermissionsActive = currentPath.includes('/roles') || currentPath.includes('/resources') || currentPath.includes('/user-roles');

    // Abre o submenu de permissions automaticamente se estiver em uma página de permissões
    React.useEffect(() => {
        if (isPermissionsActive) {
            setIsPermissionsOpen(true);
        }
    }, [isPermissionsActive]);

    const handleLogoff = () => {
        router.push('/servers');
    };

    const handleLogout = async () => {
        const confirmLogout = await confirm({
            message: 'Are you sure you want to log out?',
            title: 'Logout Confirmation',
            confirmText: 'Log out',
            cancelText: 'Cancel'
        })

        if (confirmLogout) {
            const response = await Api.logout()

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
                <div className={styles.brand}>
                    <Server style={{ marginRight: 10 }} /> Hosten<span>Manager</span>
                </div>

                <nav>
                    <div
                        className={`${styles.navItem} ${isActive('dashboard') ? styles.active : ''}`}
                        onClick={() => { router.push(`/server/${clientIdFromQuery}/dashboard`); closeSidebar(); }}

                    >
                        <div className={styles.label}>
                            <LayoutDashboard size={20} /> Dashboard
                        </div>
                    </div>

                    <div
                        className={`${styles.navItem} ${isPermissionsActive ? styles.active : ''}`}
                        onClick={() => setIsPermissionsOpen(!isPermissionsOpen)}
                    >
                        <div className={styles.label}>
                            <Shield size={20} /> Permissions
                        </div>
                        {isPermissionsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    <div className={`${styles.subMenu} ${isPermissionsOpen ? styles.open : ''}`}>
                        <Link href={`/server/${clientIdFromQuery}/dashboard/roles`} className={`${styles.subItem} ${isActive('roles') ? styles.activeSubItem : ''}`} onClick={() => closeSidebar()}>
                            Roles
                        </Link>
                        <Link href={`/server/${clientIdFromQuery}/dashboard/resources`} className={`${styles.subItem} ${isActive('resources') ? styles.activeSubItem : ''}`} onClick={() => closeSidebar()}>
                            Resources & Actions
                        </Link>
                        <Link href={`/server/${clientIdFromQuery}/dashboard/user-roles`} className={`${styles.subItem} ${isActive('user-roles') ? styles.activeSubItem : ''}`} onClick={() => closeSidebar()}>
                            Assign User Role
                        </Link>
                    </div>
                </nav>
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
                        <div className={styles.serverInfo}>
                            <h2>{serverName}</h2>
                            <span>ID: {clientId}</span>
                        </div>
                    </div>

                    <div className={styles.headerActions}>
                        <button onClick={handleLogoff} className={styles.logoffBtn}>
                            <SquareX size={18} /> <span>Disconnect</span>
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