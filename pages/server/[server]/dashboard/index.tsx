'use client';

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import ServerLayout from '@/components/Layout/ServerLayout';
import styles from '@/styles/dashboard.module.scss';
import { Activity, Cpu, HardDrive, Clock, RefreshCw, Play, Square, RotateCw } from 'lucide-react';
import Api from '@/api';
import fetchProcesses from '@/services/processes-service';
import useServer from '@/hooks/useServer';

const formatMemory = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatUptime = (startTime: number) => {
    if (startTime === 0) return 'Offline';
    const now = Date.now();
    const diff = Math.abs(now - startTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h ${minutes}m`;
};

export default function ServerDashboard() {
    const router = useRouter();
    const { server: clientId } = router.query as { server: string };
    const queryClient = useQueryClient();
    const { setServer } = useServer()

    // Aqui você pode obter o serverName do contexto ou de outra fonte
    const serverName = "gare-server"; // TODO: obter dinamicamente

    const { data: processes, isLoading, isFetching } = useQuery({
        queryKey: ['processes', clientId],
        queryFn: () => fetchProcesses(clientId),
        enabled: !!clientId,
        staleTime: 1000 * 30,
    });


    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['processes', clientId] });
    };

    const handleAction = async (action: 'start' | 'stop' | 'restart', processName: string, processId?: string) => {
        try {
            console.log(processName)
            if (action === 'start') {
                await Api.sendCommand("PM2_START", clientId, {
                    app: "",
                    options: "",
                    script: processName
                });
            } else if (action === 'stop') {
                await Api.sendCommand("PM2_STOP", clientId, {
                    app: processId || "",
                    options: "",
                    script: ""
                });
            } else if (action === 'restart') {
                await Api.sendCommand("PM2_RESTART", clientId, {
                    app: processId || "",
                    options: "",
                    script: ""
                });
            }
            queryClient.invalidateQueries({ queryKey: ['processes', clientId] });
        } catch (error) {
            console.error(`Erro ao executar ${action}:`, error);
        }
    };

    const loading = isLoading || isFetching;

    return (
        <ServerLayout serverName={serverName} clientId={clientId}>

            <div className={styles.dashboardHeader}>
                <div className={styles.dashboardTitle}>
                    <Activity color="#284999" />
                    Visão Geral de Processos (PM2)
                </div>

                <button
                    className={`${styles.refreshBtn} ${loading ? styles.spinning : ''}`}
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    <RefreshCw size={18} />
                    {loading ? 'Atualizando...' : 'Atualizar Lista'}
                </button>
            </div>
            <div className={styles.processGrid}>
                {processes?.result.map((proc) => {
                    const isOnline = proc.status === 'online';

                    return (
                        <div
                            key={proc.pmId}
                            className={`${styles.processCard} ${isOnline ? styles.online : styles.stopped}`}
                        >
                            {/* Header do Card */}
                            <div className={styles.cardHeader}>
                                <div className={styles.processName}>
                                    <h3>{proc.name}</h3>
                                    <span>PID: {proc.pid} | ID: {proc.pmId}</span>
                                </div>
                                <div className={`${styles.statusBadge} ${isOnline ? styles.online : styles.offline}`}>
                                    {proc.status}
                                </div>
                            </div>

                            {/* Grid de Estatísticas */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <label><Clock size={14} /> Uptime</label>
                                    <strong>{formatUptime(proc.uptime)}</strong>
                                </div>

                                <div className={styles.statItem}>
                                    <label><RefreshCw size={14} /> Restarts</label>
                                    <strong>{proc.restarts}</strong>
                                </div>

                                <div className={styles.statItem}>
                                    <label><Cpu size={14} /> CPU</label>
                                    <strong>{proc.cpu}%</strong>
                                </div>

                                <div className={styles.statItem}>
                                    <label><HardDrive size={14} /> Memória</label>
                                    <strong>{formatMemory(proc.memory)}</strong>
                                </div>
                            </div>

                            {/* Detalhes Técnicos (Versão / Logs) */}
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>
                                <strong>Node:</strong> {proc.nodeVersion} • <strong>Mode:</strong> {proc.execMode}
                            </div>

                            {/* Logs Preview */}
                            <div className={styles.logsSection}>
                                <div className={styles.logPath} title={proc.logs.out}>
                                    <span>OUT:</span> {proc.logs.out.split('\\').pop()}
                                </div>
                                <div className={styles.logPath} title={proc.logs.error}>
                                    <span>ERR:</span> {proc.logs.error.split('\\').pop()}
                                </div>
                            </div>

                            {/* BOTÕES DE AÇÃO */}
                            <div className={styles.actions}>
                                <button
                                    className={styles.btnStart}
                                    disabled={isOnline}
                                    onClick={() => handleAction('start', proc.name)}
                                >
                                    <Play size={16} fill="currentColor" /> Start
                                </button>

                                <button
                                    className={styles.btnStop}
                                    disabled={!isOnline}
                                    onClick={() => handleAction('stop', proc.name, proc.pmId.toString())}
                                >
                                    <Square size={16} fill="currentColor" /> Stop
                                </button>

                                <button
                                    className={styles.btnRestart}
                                    onClick={() => handleAction('restart', proc.name, proc.pmId.toString())}
                                >
                                    <RotateCw size={16} /> Restart
                                </button>
                            </div>

                        </div>
                    );
                })}
            </div>

        </ServerLayout>
    );
}

// Server Side Rendering com TanStack Query
export const getServerSideProps: GetServerSideProps = async (context) => {
    const { server: clientId } = context.params as { server: string };
    const queryClient = new QueryClient();

    // Passa o cookie da request para a API (autenticação)
    const cookie = context.req.headers.cookie ?? '';
    Api.setCookie(cookie);

    try {
        await queryClient.prefetchQuery({
            queryKey: ['processes', clientId],
            queryFn: () => fetchProcesses(clientId),
        });
    } catch (error) {
        console.error('Erro ao buscar processos:', error);
    }

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    };
};