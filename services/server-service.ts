import Api from "@/api";
import { ServerResponse } from "@/types/server-type";

export const serverService = {
    getServers: async (): Promise<ServerResponse> => {
        const response = await Api.getServers();
        return response.data;
    },
};
