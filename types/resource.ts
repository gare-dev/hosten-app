export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'list' | 'start' | 'stop' | 'restart';

export interface ResourceActionPayload {
    action: ActionType;
    resource: string;
}

export interface ResourceItem {
    id: string;
    resource: string;
    action: ActionType;
    roleIds?: string[];
}

export interface GroupedResourceAction {
    id: string;
    action: ActionType;
    roleIds: string[];
}

export interface GroupedResource {
    resource: string;
    actions: GroupedResourceAction[];
}

export type ResourceResponse = {
    resources: {
        id: string;
        resource: string;
        action: ActionType;
        roleIds?: string[];
    }[]
}