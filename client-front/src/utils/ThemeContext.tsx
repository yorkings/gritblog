import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";


interface ThemecontextType{
    theme:Theme,
    setTheme:(theme:Theme)=>void;
}

export type Theme = "light" | "dark"

interface ThemeProviderProps{
    children:ReactNode;
}

const Themecontext =createContext<ThemecontextType | undefined>(undefined);


export const ThemeProvider= ({children}:ThemeProviderProps)=>{
    const [theme,setTheme]=useState<Theme>(()=>{
        if(typeof window !== "undefined"){
            const storedTheme=localStorage.getItem("theme")
            if(storedTheme=="dark" || storedTheme=="light"){
                return storedTheme
            }   
        } 
        return window.matchMedia('(prefers-color-scheme:dark)').matches?"dark" :"light"       
    })
    //changes the dark class and update local storage
    useEffect(()=>{
        const root=document.documentElement
        if(theme =="dark"){
            root.classList.add("dark")
            localStorage.setItem("theme","dark")
        }
        else if(theme=="light"){
            root.classList.remove("dark")
            localStorage.setItem("theme","light")

        }
        else{
            const preferedTheme=window.matchMedia('(prefers-color-scheme: dark)').matches
            if(preferedTheme){
                root.classList.add('dark');
            }
            else{
                root.classList.remove('dark')
            }
        }
    },[theme])
   const contextvalue= useMemo(()=>({theme,setTheme}),[theme])

    return(
        <Themecontext.Provider value={contextvalue}>
            {children}
        </Themecontext.Provider>
    )
}

export const useTheme=():ThemecontextType=>{
    const  context=useContext(Themecontext);
    if(context == undefined){
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}