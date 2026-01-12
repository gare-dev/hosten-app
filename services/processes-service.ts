import Api from "@/api";
import { ProcessInfo } from "@/types/process";

const fetchProcesses = async (clientId: string): Promise<ProcessInfo> => {
    const response = await Api.sendCommand("PM2_LIST", clientId);

    return response.data;
};

export default fetchProcesses;