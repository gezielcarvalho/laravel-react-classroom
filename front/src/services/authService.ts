import apiClient from "./apiClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export default class AuthService {
  static async getCsrf(): Promise<any> {
    return apiClient.get("/sanctum/csrf-cookie");
  }

  static async login(
    credentials: LoginCredentials & {
      captcha_token?: string;
      captcha_answer?: string | number;
    }
  ): Promise<any> {
    // Ensure CSRF cookie is set before attempting login
    await this.getCsrf();
    return apiClient.post("/api/login", credentials);
  }

  static async register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    captcha_token?: string;
    captcha_answer?: string | number;
  }): Promise<any> {
    // Ensure CSRF cookie is set before attempting register
    await this.getCsrf();
    return apiClient.post("/api/register", payload);
  }
  static async forgotPassword(payload: {
    email: string;
    captcha_token?: string;
    captcha_answer?: string | number;
  }): Promise<any> {
    await this.getCsrf();
    return apiClient.post("/api/password/forgot", payload);
  }

  static async resetPassword(payload: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
    captcha_token?: string;
    captcha_answer?: string | number;
  }): Promise<any> {
    await this.getCsrf();
    return apiClient.post("/api/password/reset", payload);
  }

  static async logout(): Promise<any> {
    return apiClient.post("/api/logout");
  }

  static async getUser(): Promise<any> {
    return apiClient.get("/api/user");
  }
}
