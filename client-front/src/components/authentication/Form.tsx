import {useState, type ChangeEvent, type FormEvent } from "react";

interface FormProps<T extends Record<string,string>>{
    onSubmit:(data: T)=>void | Promise<void>,
    buttonLabel:string,
    fields:{ name:keyof T; type: string; placeholder: string; required: boolean } [], 
    isloading:boolean;

}

const Form = <T extends Record<string,string>>({onSubmit,buttonLabel,fields,isloading}:FormProps<T>) => {
    const [formData,setFormData]=useState<T>({} as T )
   
    const HandleChange=(e:ChangeEvent<HTMLInputElement>)=>{
        const {name,value}=e.target;
        setFormData((prev)=>({...prev,[name]:value}));
    }
    
    const HandleSubmit=(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        onSubmit(formData)
    }
  
  return (
      <form onSubmit={HandleSubmit} className="slide-in  text-(--lighttext-subheader) dark:text-(--darktext-subheader) flex items-center justify-center  flex-col ">
        {fields.map((field)=>(
             <div className="min-w-full my-5 relative  input-group" key={field.name as string} >
                <input id={field.name as string} onChange={HandleChange} type={field.type}  name={field.name as string} value={formData[field.name] || ""}  required={field.required} className="max-w-90 max-h-14 min-h-5 pt-2.5 pl-3.5  outline-none bg-(--dark-text) dark:bg-(--switch-dark) rounded-lg"/>
                <label htmlFor={field.name as string} className="absolute top-[8%] left-3.5 text-base transition-all duration-500">{field.placeholder} </label>
             </div>
        ))}
         <button type="submit" disabled={isloading} className="w-full  max-w-[60%] flex justify-center font-semibold bg-(--blue-400-fade) p-2 rounded-lg text-(--lighttext-text) dark:text-(--darktext-text)">{!isloading ? buttonLabel : ""}</button>
      </form>
  )
}

export default Form

