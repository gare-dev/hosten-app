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
    FileCheck
} from 'lucide-react';
import styles from '@/styles/serverlayout.module.scss';
import { useRouter } from 'next/navigation';

interface ServerLayoutProps {
    children: React.ReactNode;
    serverName?: string;
    clientId?: string;
}

export default function ServerLayout({ children, serverName = "Unknown Server", clientId = "..." }: ServerLayoutProps) {
    const router = useRouter();
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [activePath, setActivePath] = useState('dashboard'); // Simples controle de estado ativo para demo

    const handleLogoff = () => {
        // Lógica de desconexão ou limpar storage aqui
        router.push('/servers'); // Volta para a tela de seleção
    };

    return (
        <div className={styles.layoutContainer}>

            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <Server style={{ marginRight: 10 }} /> Hosten<span>Manager</span>
                </div>

                <nav>
                    {/* Dashboard Link */}
                    <div
                        className={`${styles.navItem} ${activePath === 'dashboard' ? styles.active : ''}`}
                        onClick={() => setActivePath('dashboard')}
                    >
                        <div className={styles.label}>
                            <LayoutDashboard size={20} /> Dashboard
                        </div>
                    </div>

                    {/* Menu Permissões (Expansível) */}
                    <div
                        className={`${styles.navItem} ${activePath.includes('permissions') ? styles.active : ''}`}
                        onClick={() => setIsPermissionsOpen(!isPermissionsOpen)}
                    >
                        <div className={styles.label}>
                            <Shield size={20} /> Permissões
                        </div>
                        {isPermissionsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    {/* Submenu Itens */}
                    <div className={`${styles.subMenu} ${isPermissionsOpen ? styles.open : ''}`}>
                        <Link href="#" className={styles.subItem} onClick={() => setActivePath('permissions-role')}>
                            Roles (Funções)
                        </Link>
                        <Link href="#" className={styles.subItem} onClick={() => setActivePath('permissions-rp')}>
                            Role Permissions
                        </Link>
                        <Link href="#" className={styles.subItem} onClick={() => setActivePath('permissions-p')}>
                            Recursos & Ações
                        </Link>
                        <Link href="#" className={styles.subItem} onClick={() => setActivePath('permissions-user')}>
                            Atribuir User Role
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main className={styles.mainContent}>

                {/* HEADER */}
                <header className={styles.header}>
                    <div className={styles.serverInfo}>
                        <h2>{serverName}</h2>
                        <span>ID: {clientId}</span>
                    </div>

                    <button onClick={handleLogoff} className={styles.logoffBtn}>
                        <LogOut size={18} /> Desconectar
                    </button>
                </header>

                {/* CORPO DA PÁGINA */}
                <div className={styles.pageBody}>
                    {children}
                </div>
            </main>
        </div>
    );
}