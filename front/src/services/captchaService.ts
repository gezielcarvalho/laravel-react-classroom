import apiClient from "./apiClient";

export default class CaptchaService {
  static async getCaptcha(): Promise<any> {
    return apiClient.get("/api/captcha");
  }

  static async validate(token: string, answer: string | number): Promise<any> {
    return apiClient.post("/api/captcha/validate", { token, answer });
  }
}
