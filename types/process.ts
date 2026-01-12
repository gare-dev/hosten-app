export interface ProcessLogs {
    out: string;
    error: string;
}

export interface ProcessInfo {
    result: {
        pmId: number;
        name: string;
        pid: number;
        status: 'online' | 'stopped' | 'errored' | 'stopping';
        uptime: number;
        restarts: number;
        cpu: number;
        memory: number;
        execMode: string;
        instances: number;
        nodeVersion: string;
        logs: ProcessLogs;
    }[]
    status: string
}