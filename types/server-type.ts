export interface ServerMetrics {
    uptime: number; // em segundos
    memory: number; // em bytes
    timestamp: number;
}

export interface Server {
    name: string;
    environment: 'testing' | 'production' | 'staging' | 'development';
    host: string;
    clientId: string;
    // A API retorna string "true"/"false", mas o ideal seria boolean.
    // Vamos tipar como string conforme o JSON fornecido.
    connected: boolean;
    lastSeenAt?: string; // Opcional, pois pode não vir se não estiver conectado (embora o JSON de erro não mostre, é bom prevenir)
    metrics?: ServerMetrics;
}

export interface ServerResponse {
    servers: Server[];
}

export const MOCK_SERVERS: Server[] = [
    {
        connected: true,
        name: 'gare-core-system',
        environment: 'production',
        host: '192.168.1.10',
        clientId: "01KEMY0PEMK6B7FVND6NXXSB3R",
        lastSeenAt: new Date().toISOString(),
        metrics: {
            uptime: 12450.5,
            memory: 82354176,
            timestamp: Date.now()
        }
    },
    {
        connected: false,
        name: 'gare-worker-node-04',
        environment: 'testing',
        host: '10.0.0.5',
        clientId: "02JFH81AKL99C2QWZX5MZZ12K",
        lastSeenAt: "2025-12-10T10:00:00Z"
    },
    {
        connected: false,
        name: 'gare-db-monitor',
        environment: 'staging',
        host: '127.0.0.1',
        clientId: "03LGY92BJM11D3RYVY6NXXAA9L",
        lastSeenAt: new Date().toISOString(),
        metrics: {
            uptime: 540.2,
            memory: 256123904,
            timestamp: Date.now()
        }
    }
];