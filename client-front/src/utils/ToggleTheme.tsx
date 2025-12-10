
import { FaSun ,FaMoon} from "react-icons/fa"
import { useTheme,type Theme } from "./ThemeContext"


const ToggleTheme = () => {
  const {theme,setTheme}=useTheme()  

  const ThemeSwitcher=()=>{
    const nextTheme:Theme= theme == "light"? "dark":"light"
    setTheme(nextTheme)
  }
  const ThemeIcons=(currentheme:Theme)=>{
    switch (currentheme) {
        case "light":
            return <FaSun/>
    
        case "dark":
            return <FaMoon/>
    }
  }
  
  return (
    <button onClick={ThemeSwitcher}     className="relative flex items-center w-12 h-6 md:w-16 md:h-8 bg-gray-300 dark:bg-(--switch-dark) rounded-full p-1 transition-colors duration-500 ease-in-out">
          <div className={`absolute left-1 top-1/2 -translate-y-1/2 w-4 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center  bg-blue-800 text-white text-base md:text-xl  transition-all duration-500 ease-in-out font-extrabold   ${ theme === "light" ? "translate-x-0 text-yellow-500"  : "translate-x-6 md:translate-x-8 text-blue-900"}`} >
            {ThemeIcons(theme)}
          </div>
    </button>
  )
     
}

export default ToggleTheme
