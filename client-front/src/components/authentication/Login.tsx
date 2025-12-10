import { useState } from "react";
import Form from "./Form";
import { Api } from "../../lib/Api";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { AuthStore } from "../../lib/AuthStore";

// interface LoginData {
//   username: string;
//   password: string;
// }
interface CurrentUser {
  id: number;
  username: string;
  email: string;
}
const loginFields = [
    { name: "username", type: "text", placeholder: "Username/Email", required: true },
    { name: "password", type: "password", placeholder: "Password", required: true },
  ];
const Login = () => {
    const[loading,setLoading]=useState(false)
    const {fetchUser}=AuthStore()
    const navigate=useNavigate()
 
    const SubmitLogin=async( data:Record<string,string>)=>{
         setLoading(true)
         try {
             const log_res=await Api.post("/auth/login",data)
             localStorage.setItem("token",log_res.data.token)
             const user_res= await Api.get<CurrentUser>("/user/me",{withCredentials:true})
             fetchUser(user_res.data)
             toast.success("login successful")
             navigate("/",{ replace: true })

         } catch (error) {
             const axiosError = error as AxiosError<{ message: string }>;
              toast.error(axiosError.response?.data?.message || "Login failed.");
            
         }finally{
            setLoading(false)
         }
    }
    const LoginProvider=(provider:string)=>{
            window.location.href=`http://localhost:8080/oauth2/authorization/${provider}`
    }    
  return (
    <div className=" flex items-center justify-center min-h-full">
      <div className="w-full  max-w-sm md:max-w-md flex flex-col justify-center items-center  rounded-2xl shadow-xl px-8 py-6 z-10 relative dark:bg-(--dark-card)">
         <h2 className="text-2xl font-bold text-center text-blue-500 my-2"> {"Sign In".split("").map((l, i) => (
            <span key={i} className="letter-animate" style={{ animationDelay: `${0.1 * i}s` }}>{l}</span>
          ))}</h2>
         <Form onSubmit={SubmitLogin} buttonLabel="sign In" fields={loginFields} isloading={loading}/>
         <p className="mt-3 text-sm  mb-2  dark:text-(--nav-bg-light)"> login with   </p>
         <div className=" flex items-center justify-center gap-5 text-2xl">
            <FcGoogle onClick={()=>LoginProvider('google')} className="size-transform cursor-pointer" />
            <FaGithub onClick={()=>LoginProvider('github')}  className="size-transform cursor-pointer text-black dark:text-blue-500" />
         </div>
         <p className="mt-6 text-center text-sm mb-3  dark:text-(--nav-bg-light)">
          Don't have an account?{" "}<Link to="/register" className="text-blue-500 hover:underline">Sign up</Link>
        </p>

      </div>
    </div>
  )
}

export default Login
