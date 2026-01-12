import Api from "@/api";
import { Role } from "@/types/role";

const roleService = () => {
    const fetchRoles = async (): Promise<Role[]> => {
        const response = await Api.getRoles();

        return response.data.data;
    };

    const insertRole = async (role: string) => {
        const response = await Api.insertRole(role);

        return response.data;
    };

    const deleteRole = async (id: string) => {
        const response = await Api.deleteRole(id);

        return response
    }

    return {
        fetchRoles,
        insertRole,
        deleteRole
    }
}
export default roleService