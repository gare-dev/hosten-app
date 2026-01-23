import Api from "@/api";
import { ServerResponse } from "@/types/server-type";
import { CreateServerPayload, CreateServerResponse } from "@/types/create-server";

export const serverService = {
    getServers: async (): Promise<ServerResponse> => {
        const response = await Api.getServers();
        return response.data;
    },

    createServer: async (data: CreateServerPayload): Promise<CreateServerResponse> => {
        const response = await Api.createServer(data);
        return response.data;
    },
};
