import { useEffect } from "react";
import {  useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { AuthStore } from "../../lib/AuthStore";
import type { AxiosError } from "axios";
import { Api } from "../../lib/Api";

interface CurrentUser {
  id: number;
  username: string;
  email: string;
}

const OAuthSuccessHandler = () => {
    const navigate = useNavigate();
    const {fetchUser}=AuthStore()
    useEffect(() => { 
        const use_fetching=async()=>{
            try {
                const user_res= await Api.get<CurrentUser>("/user/me",{withCredentials:true})
                fetchUser(user_res.data)
                toast.success("Authentication successful!");
            } catch (error) {
                const axiosError = error as AxiosError<{ message: string }>;
                toast.error(axiosError.response?.data?.message || "fatching user failed.");
            }
        }
        use_fetching();
       navigate("/", { replace: true });

  }, [navigate,fetchUser]);
  
  return (


    <div className="w-full">
      
    </div>
  )
}

export default OAuthSuccessHandler