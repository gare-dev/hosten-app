import Api from "@/api";
import loginType from "@/types/login-type";

export default async function userLogin(data: loginType) {
    const response = await Api.login(data);

    return response.data
}

