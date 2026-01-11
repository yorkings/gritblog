
import { create } from "zustand";
import { Api } from "./Api";
import { toast } from "react-toastify";

interface CurrentUser {
  id: string;
  username: string;
  email: string;
}
interface CurrentProfile{
  id:string,
  avatar:string,
}

interface AuthState {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  currentProfile:CurrentProfile | null;
  fetchUser: (u: CurrentUser) => void;
  fetchProfile:(u:CurrentUser)=>void;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  loading: true,
  currentProfile:null,

  fetchUser: (user) => {
    set({ currentUser: user, isAuthenticated: true, loading: false});
  },
  fetchProfile:async(user)=>{
    try{
          const prof_data=await Api.get(`/profiles/${user.id}`)
          set({loading:false,currentProfile:prof_data.data})

    }catch(e){
      console.log("profile failed",e)
       toast.error("failed to fetch profile",)
    }

  }
  ,

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

