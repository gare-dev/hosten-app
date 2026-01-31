import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Server, Plus, Search, Filter, MoreVertical, Activity, HardDrive, Cpu, RefreshCw } from 'lucide-react';
import TeamLayout from '@/components/Layout/TeamLayout';
import { useTeam } from '@/context/team-context';
import { teamService } from '@/services/team-service';
import { serverService } from '@/services/server-service';
import styles from '@/styles/teamservers.module.scss';
import { useState } from 'react';

interface TeamServer {
    id: string;
    name: string;
    ip: string;
    status: 'online' | 'offline' | 'maintenance';
    cpu: number;
    memory: number;
    disk: number;
    lastSeen: string;
}

// Mock de servidores do time
const mockTeamServers: TeamServer[] = [
    {
        id: 'server-001',
        name: 'Production Server',
        ip: '192.168.1.100',
        status: 'online',
        cpu: 45,
        memory: 62,
        disk: 38,
        lastSeen: new Date().toISOString()
    },
    {
        id: 'server-002',
        name: 'Development Server',
        ip: '192.168.1.101',
        status: 'online',
        cpu: 23,
        memory: 41,
        disk: 55,
        lastSeen: new Date().toISOString()
    },
    {
        id: 'server-003',
        name: 'Staging Server',
        ip: '192.168.1.102',
        status: 'maintenance',
        cpu: 0,
        memory: 0,
        disk: 72,
        lastSeen: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 'server-004',
        name: 'Backup Server',
        ip: '192.168.1.103',
        status: 'offline',
        cpu: 0,
        memory: 0,
        disk: 89,
        lastSeen: new Date(Date.now() - 86400000).toISOString()
    }
];

export default function TeamServersPage() {
    const router = useRouter();
    const { teamId } = router.query;
    const { currentTeam, can } = useTeam();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');

    // Em produção, isso viria de uma API real
    const { data: servers = mockTeamServers, isLoading, refetch } = useQuery({
        queryKey: ['team-servers', teamId],
        queryFn: async () => {
            // Quando o backend estiver pronto, substituir por:
            // return serverService.getServersByTeam(teamId as string);
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockTeamServers;
        },
        enabled: !!teamId
    });

    const filteredServers = servers.filter(server => {
        const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            server.ip.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || server.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: servers.length,
        online: servers.filter(s => s.status === 'online').length,
        offline: servers.filter(s => s.status === 'offline').length,
        maintenance: servers.filter(s => s.status === 'maintenance').length
    };

    const getStatusClass = (status: TeamServer['status']) => {
        switch (status) {
            case 'online': return styles.online;
            case 'offline': return styles.offline;
            case 'maintenance': return styles.maintenance;
        }
    };

    const formatLastSeen = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        if (diff < 60000) return 'Agora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
        return `${Math.floor(diff / 86400000)}d atrás`;
    };

    const getProgressColor = (value: number) => {
        if (value >= 80) return styles.critical;
        if (value >= 60) return styles.warning;
        return styles.good;
    };

    if (!currentTeam) {
        return (
            <TeamLayout>
                <div className={styles.loading}>Carregando...</div>
            </TeamLayout>
        );
    }

    return (
        <TeamLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h1>
                            <Server size={28} />
                            Servidores
                        </h1>
                        <p>Gerencie os servidores do time {currentTeam.name}</p>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.refreshBtn}
                            onClick={() => refetch()}
                            title="Atualizar"
                        >
                            <RefreshCw size={18} />
                        </button>
                        {can('server:create') && (
                            <button className={styles.addBtn}>
                                <Plus size={18} />
                                Adicionar Servidor
                            </button>
                        )}
                    </div>
                </header>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <Server size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats.total}</span>
                            <span className={styles.statLabel}>Total</span>
                        </div>
                    </div>
                    <div className={`${styles.statCard} ${styles.online}`}>
                        <div className={styles.statIcon}>
                            <Activity size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats.online}</span>
                            <span className={styles.statLabel}>Online</span>
                        </div>
                    </div>
                    <div className={`${styles.statCard} ${styles.offline}`}>
                        <div className={styles.statIcon}>
                            <Server size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats.offline}</span>
                            <span className={styles.statLabel}>Offline</span>
                        </div>
                    </div>
                    <div className={`${styles.statCard} ${styles.maintenance}`}>
                        <div className={styles.statIcon}>
                            <RefreshCw size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stats.maintenance}</span>
                            <span className={styles.statLabel}>Manutenção</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou IP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.statusFilter}>
                        <Filter size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">Todos os status</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="maintenance">Manutenção</option>
                        </select>
                    </div>
                </div>

                {/* Server Grid */}
                {isLoading ? (
                    <div className={styles.loading}>
                        <RefreshCw className={styles.spin} size={32} />
                        <p>Carregando servidores...</p>
                    </div>
                ) : filteredServers.length === 0 ? (
                    <div className={styles.empty}>
                        <Server size={48} />
                        <h3>Nenhum servidor encontrado</h3>
                        <p>
                            {searchTerm || statusFilter !== 'all'
                                ? 'Tente ajustar os filtros de busca.'
                                : 'Adicione servidores para começar a gerenciá-los.'}
                        </p>
                    </div>
                ) : (
                    <div className={styles.serverGrid}>
                        {filteredServers.map((server) => (
                            <div
                                key={server.id}
                                className={styles.serverCard}
                                onClick={() => router.push(`/server/${server.id}/dashboard`)}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.serverInfo}>
                                        <span className={`${styles.statusDot} ${getStatusClass(server.status)}`} />
                                        <div>
                                            <h3>{server.name}</h3>
                                            <span className={styles.ip}>{server.ip}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.menuBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Menu de ações
                                        }}
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </div>

                                <div className={styles.metrics}>
                                    <div className={styles.metric}>
                                        <div className={styles.metricHeader}>
                                            <Cpu size={14} />
                                            <span>CPU</span>
                                            <span className={styles.value}>{server.cpu}%</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={`${styles.progress} ${getProgressColor(server.cpu)}`}
                                                style={{ width: `${server.cpu}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.metric}>
                                        <div className={styles.metricHeader}>
                                            <Activity size={14} />
                                            <span>Memória</span>
                                            <span className={styles.value}>{server.memory}%</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={`${styles.progress} ${getProgressColor(server.memory)}`}
                                                style={{ width: `${server.memory}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.metric}>
                                        <div className={styles.metricHeader}>
                                            <HardDrive size={14} />
                                            <span>Disco</span>
                                            <span className={styles.value}>{server.disk}%</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={`${styles.progress} ${getProgressColor(server.disk)}`}
                                                style={{ width: `${server.disk}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <span className={`${styles.statusBadge} ${getStatusClass(server.status)}`}>
                                        {server.status === 'online' && 'Online'}
                                        {server.status === 'offline' && 'Offline'}
                                        {server.status === 'maintenance' && 'Manutenção'}
                                    </span>
                                    <span className={styles.lastSeen}>
                                        {formatLastSeen(server.lastSeen)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </TeamLayout>
    );
}
