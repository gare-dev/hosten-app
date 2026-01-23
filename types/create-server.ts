// ─────────────────────────────────────────────────────────────────────────────
// Create Server Types
// ─────────────────────────────────────────────────────────────────────────────

export type ServerEnvironment = 'prod' | 'staging' | 'dev' | 'testing';

export interface CreateServerPayload {
    name: string;
    environment: ServerEnvironment;
    host: string;
    description?: string;
}

export interface CreateServerResponse {
    clientId: string;
    clientSecret: string;
}

export const ENVIRONMENT_OPTIONS: { value: ServerEnvironment; label: string }[] = [
    { value: 'prod', label: 'Production' },
    { value: 'staging', label: 'Staging' },
    { value: 'dev', label: 'Development' },
    { value: 'testing', label: 'Testing' },
];
