import loginType from "@/types/login-type";
import { handleDates } from "@/utils/date";
import { showAlertAfterRedirect } from "@/context/alert-context";

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

    this._instance.interceptors.response.use(
      (response) => {
        return { ...response, data: handleDates(response.data) };
      },
      (error) => {
        if (typeof window !== 'undefined' && error.response?.status === 401) {
          showAlertAfterRedirect('error', 'Session expired. Please log in again.');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }
  public setCookie(cookie: string) {
    this._instance.defaults.headers.common['Cookie'] = cookie;
  }

  public async login(data: loginType) {
    return this._instance.post("/user/auth", data);
  }

  public async logout() {
    return this._instance.delete("/user/auth");
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

  public async getResources() {
    return this._instance.get(`/resource`);
  }

  public async insertResource(payload: { action: string; resource: string }[]) {
    return this._instance.post(`/resource`, payload);
  }

  public async deleteResource(id: string) {
    return this._instance.delete(`/resource/${id}`);
  }

  public async updateResourceRoles(resourceId: string, roleIds: string[]) {
    return this._instance.patch(`/role-permission/${resourceId}/roles`, { roleIds });
  }

  public async addRoleToResource(resourceId: string, roleId: string) {
    return this._instance.post(`/role-permission`, { permissionId: resourceId, roleId });
  }

  public async removeRoleFromResource(resourceId: string, roleId: string) {
    return this._instance.delete(`/role-permission/`, {
      data: { permissionId: resourceId, roleId }
    });
  }

  public async getUsers() {
    return this._instance.get(`/user`);
  }

  public async addRoleToUser(userId: string, roleId: string) {
    return this._instance.post(`/user-role`, { userId, roleId });
  }

  public async removeRoleFromUser(userId: string, roleId: string) {
    return this._instance.delete(`/user-role`, {
      data: { userId, roleId }
    });
  }

}

const Api = new _Api(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5450");



export default Api;
