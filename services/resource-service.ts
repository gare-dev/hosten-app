import Api from "@/api";
import { ResourceResponse, ActionType, ResourceActionPayload } from "@/types/resource";

const resourceService = () => {
    const fetchResources = async (): Promise<ResourceResponse> => {
        const response = await Api.getResources();
        return response.data;
    };

    const insertResource = async (data: { name: string; actions: ActionType[] }): Promise<ResourceResponse> => {
        const payload: ResourceActionPayload[] = data.actions.map(action => ({
            action,
            resource: data.name
        }));
        const response = await Api.insertResource(payload);
        return response.data;
    };

    const deleteResource = async (id: string) => {
        const response = await Api.deleteResource(id);
        return response;
    };

    const updateResourceRoles = async (data: { resourceId: string; roleIds: string[] }) => {
        const response = await Api.updateResourceRoles(data.resourceId, data.roleIds);
        return response.data;
    };

    const addRoleToResource = async (data: { resourceId: string; roleId: string }) => {
        const response = await Api.addRoleToResource(data.resourceId, data.roleId);
        return response.data;
    };

    const removeRoleFromResource = async (data: { resourceId: string; roleId: string }) => {
        const response = await Api.removeRoleFromResource(data.resourceId, data.roleId);
        return response.data;
    };

    return {
        fetchResources,
        insertResource,
        deleteResource,
        updateResourceRoles,
        addRoleToResource,
        removeRoleFromResource
    };
};

export default resourceService;
