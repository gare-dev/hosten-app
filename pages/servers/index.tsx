import { useState, useEffect } from 'react';
import { Server } from '@/types/server-type';
import styles from '@/styles/server.module.scss';
import { Server as ServerIcon, Info, Activity, RefreshCw, Cpu } from 'lucide-react';
import { dehydrate, useQuery, QueryClient } from '@tanstack/react-query';
import { serverService } from '@/services/server-service';
import { useAlert } from '@/context/alert-context';
import { useRouter } from 'next/router';

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US');
};

export async function getServerSideProps() {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['servers'],
        queryFn: serverService.getServers
    });

    return {
        props: {
            dehydratedState: dehydrate(queryClient)
        }
    };
}

export default function ServersPage() {
    const [secondsAgo, setSecondsAgo] = useState(0);
    const { showAlert } = useAlert();
    const router = useRouter()

    const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
        queryKey: ['servers'],
        queryFn: serverService.getServers,
        refetchInterval: 60000,
        staleTime: 50000,
    });

    const servers = data?.servers || [];

    useEffect(() => {
        const timerInterval = setInterval(() => {
            setSecondsAgo(Math.floor((Date.now() - dataUpdatedAt) / 1000));
        }, 1000);
        return () => clearInterval(timerInterval);
    }, [dataUpdatedAt]);

    const handleServerDoubleClick = (server: Server) => {
        showAlert('info', `Connecting to server: ${server.name} (${server.clientId})`);
        router.push(`/server/${server.clientId}/dashboard`);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Server Monitoring</h1>
                    <p>Real-time management of nodes connected to Core.</p>
                </div>

                <div className={styles.controls}>
                    <span className={styles.lastUpdate}>
                        Updated {secondsAgo} seconds ago
                    </span>
                    <button
                        className={`${styles.refreshBtn} ${isLoading ? styles.loading : ''}`}
                        onClick={() => refetch()}
                        disabled={isLoading}
                    >
                        <RefreshCw size={18} />
                        {isLoading ? 'Updating...' : 'Refresh'}
                    </button>
                </div>
            </header>

            <div className={styles.grid}>
                {servers.map((server) => {
                    const isConnected = server.connected === true;

                    return (
                        <div
                            key={server.clientId}
                            className={`${styles.serverCard} ${isConnected ? styles.connected : styles.disconnected}`}
                            onDoubleClick={() => handleServerDoubleClick(server)}
                            title="Double-click to manage this server"
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.nameWrapper}>
                                    <h2>{server.name}</h2>
                                    <span className={styles.environmentBadge}>
                                        {server.environment}
                                    </span>
                                </div>
                                <span className={`${styles.statusBadge} ${isConnected ? styles.online : styles.offline}`}>
                                    {isConnected ? 'Online' : 'Offline'}
                                </span>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <ServerIcon size={16} />
                                    <span>Client ID:</span>
                                </div>
                                <div className={styles.clientId}>{server.clientId}</div>
                            </div>

                            <div className={styles.cardFooter}>
                                <span className={styles.dblClickHint}>Double-click to connect</span>

                                <div
                                    className={styles.tooltipWrapper}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Info className={styles.infoIcon} size={20} />

                                    <div className={styles.tooltipContent}>
                                        <h4>Telemetry</h4>
                                        <ul>
                                            <li>
                                                <span>Host:</span>
                                                <span>{server.host}</span>
                                            </li>
                                            <li>
                                                <span>Ping:</span>
                                                <span>{isConnected ? 'Now' : formatDate(server.lastSeenAt)}</span>
                                            </li>

                                            {isConnected && server.metrics && (
                                                <>
                                                    <hr style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
                                                    <li>
                                                        <span><Activity size={12} style={{ marginRight: 4 }} /> Uptime:</span>
                                                        <span>{formatUptime(server.metrics.uptime)}</span>
                                                    </li>
                                                    <li>
                                                        <span><Cpu size={12} style={{ marginRight: 4 }} /> Memory:</span>
                                                        <span>{formatBytes(server.metrics.memory)}</span>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}