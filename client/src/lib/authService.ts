export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("dailylog_token");
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token might be expired or invalid
        localStorage.removeItem("dailylog_token");
        localStorage.removeItem("dailylog_user");
        return null;
      }

      const user = await response.json();
      localStorage.setItem("dailylog_user", JSON.stringify(user));
      return user;
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      // Fallback to cached profile if server is down
      const cached = localStorage.getItem("dailylog_user");
      return cached ? JSON.parse(cached) : null;
    }
  },

  async login(email: string, password?: string): Promise<UserProfile> {
    if (!password) throw new Error("Password is required.");

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Login failed.");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("dailylog_token", data.token);
      localStorage.setItem("dailylog_user", JSON.stringify(data.user));
    }

    return data.user;
  },

  async signup(email: string, password?: string, name?: string): Promise<UserProfile> {
    if (!password) throw new Error("Password is required.");
    if (!name) throw new Error("Name is required.");

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Registration failed.");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("dailylog_token", data.token);
      localStorage.setItem("dailylog_user", JSON.stringify(data.user));
    }

    return data.user;
  },

  async signInWithGoogle(): Promise<void> {
    throw new Error("Google login is no longer supported. Please register using email and password.");
  },

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("dailylog_token");
      localStorage.removeItem("dailylog_user");
    }
  },
};
