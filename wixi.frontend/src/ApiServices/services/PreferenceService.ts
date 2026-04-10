import { BASE_URL } from "../config/api.config";
import { TokenService } from "./TokenService";

export type ThemeMode = "light" | "dark";
export type LangCode = "de" | "tr" | "en" | "ar";

export interface UserPreferenceDto {
  language: LangCode;
  theme: ThemeMode;
}

export const PreferenceService = {
  async getMe(): Promise<UserPreferenceDto> {
    const token = await TokenService.getInstance().getToken();
    const res = await fetch(`${BASE_URL}/api/v1.0/admin/user-preferences/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load preferences");
    const data = await res.json();
    // Backend returns { success: true, language: "...", theme: "..." }
    return {
      language: data.language || "de",
      theme: data.theme || "light",
    };
  },

  async updateMe(input: Partial<UserPreferenceDto>): Promise<UserPreferenceDto> {
    const token = await TokenService.getInstance().getToken();
    const res = await fetch(`${BASE_URL}/api/v1.0/admin/user-preferences/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      credentials: "include",
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Failed to update preferences");
    const data = await res.json();
    // Backend returns { success: true, language: "...", theme: "..." }
    return {
      language: data.language || "de",
      theme: data.theme || "light",
    };
  },
};


