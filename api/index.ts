import loginType from "@/types/login-type";
import { handleDates } from "@/utils/date";

import axios, { AxiosInstance } from "axios";

class _Api {
  private _instance: AxiosInstance;
  private _baseUrl: string;

  constructor(apiBaseUrl: string) {
    this._baseUrl = apiBaseUrl;

    this._instance = axios.create({
      timeout: 30000,
      baseURL: this._baseUrl,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "json",
    });

    this._instance.interceptors.response.use((response) => {
      return { ...response, data: handleDates(response.data) };
    });
  }
  public setCookie(cookie: string) {
    this._instance.defaults.headers.common['Cookie'] = cookie;
  }

  public async login(data: loginType) {
    return this._instance.post("/user/auth", data);
  }

  public async getServers() {
    return this._instance.get("/server");
  }

  public sendCommand(command: string, clientId: string, payload?: { app: string, options: string, script: string }) {
    return this._instance.post(`/server/command`, {
      type: command,
      clientId,
      payload
    });
  }

  public async getProcesses(clientId: string) {
    return this._instance.get(`/server/${clientId}/processes`);
  }

  public async getRoles() {
    return this._instance.get(`/role`);
  }

  public async insertRole(role: string) {
    return this._instance.post(`/role`, { name: role });
  }

  public async deleteRole(id: string) {
    return this._instance.delete(`/role/${id}`);
  }


}

const Api = new _Api(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5450");



export default Api;
