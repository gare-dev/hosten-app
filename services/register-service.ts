import Api from "@/api";
import { RegisterPayload } from "@/types/register-type";

export default async function userRegister(data: RegisterPayload) {
    const response = await Api.register(data);
    return response.data;
}
