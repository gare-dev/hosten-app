import Api from "@/api";
import { User } from "@/types/user";

const userService = () => {
    const fetchUsers = async (): Promise<User[]> => {
        const response = await Api.getUsers();
        return response.data.data;
    };

    const addRoleToUser = async ({ userId, roleId }: { userId: string; roleId: string }) => {
        const response = await Api.addRoleToUser(userId, roleId);
        return response.data;
    };

    const removeRoleFromUser = async ({ userId, roleId }: { userId: string; roleId: string }) => {
        const response = await Api.removeRoleFromUser(userId, roleId);
        return response.data;
    };

    return {
        fetchUsers,
        addRoleToUser,
        removeRoleFromUser
    };
};

export default userService;
