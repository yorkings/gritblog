import { useState } from "react";
import { FaGithub } from "react-icons/fa6"
import { FcGoogle } from "react-icons/fc"
import {Link } from "react-router-dom"
import { toast } from "react-toastify";
import { Api } from "../../lib/Api";
import type { AxiosError } from "axios";
import Form from "./Form";



const signUpFields = [
        { name: 'username', type: 'text', placeholder: 'Username', required: true },
        { name: 'email', type: 'email', placeholder: 'Email', required: true },
        { name: 'password', type: 'password', placeholder: 'Password', required: true },
        {name:"confirm", type: 'password', placeholder: 'confirm password', required: true }
     ];  
const SignUp = () => {
    const [loading,setLoading]=useState(false)
    const  submitRegistration=async(data:Record<string,string>)=>{
        setLoading(true)
        try {
            if(data.password === data.confirm ){
                const reg_data=await Api.post("/auth/register",{username:data.username,email:data.email,password:data.password})
                toast.success(reg_data.data)  
            }
            else{
                toast.error("passwords do not match")
            }
            
        } catch (error) {
                const axiosError = error as AxiosError<{ message: string }>;
                toast.error(axiosError.response?.data?.message || 'registration failed.');
        }
        finally{
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
         <Form onSubmit={submitRegistration}  buttonLabel="signUp" fields={signUpFields} isloading={loading}/>
         <p className="mt-3 text-sm  mb-2  dark:text-(--nav-bg-light)"> register with this alternatives    </p>
         <div className=" flex items-center justify-center gap-5 text-2xl">
            <FcGoogle onClick={()=>LoginProvider('google')} className="size-transform cursor-pointer" />
            <FaGithub onClick={()=>LoginProvider('github')}  className="size-transform cursor-pointer text-black dark:text-blue-500" />
         </div>
         <p className="mt-6 text-center text-sm mb-3  dark:text-(--nav-bg-light)">
          Already have an account?{" "}<Link to="/login" className="text-blue-500 hover:underline">Sign up</Link>
        </p>

      </div>
    </div>
  )
}

export default SignUp
