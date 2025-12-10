
import { create } from "zustand";
import { Api } from "./Api";
import { toast } from "react-toastify";

interface CurrentUser {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  fetchUser: (u: CurrentUser) => void;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  loading: true,

  fetchUser: (user) => {
    set({ currentUser: user, isAuthenticated: true, loading: false });
  },

  refreshToken: async () => {
    try {
      await Api.post("/auth/refresh"); // backend sets new cookies
      return true;
    } catch (e) {
      console.error("Refresh failed", e);
      toast.error("Failed to refresh session");
      set({ currentUser: null, isAuthenticated: false, loading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await Api.post("/auth/logout");
    } catch (e) {
      console.warn("Logout API failed, clearing state anyway");
    }

    set({ currentUser: null, isAuthenticated: false, loading: false });
  },
}));

