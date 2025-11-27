import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Home, FileText, Folder, Info } from "lucide-react";
import ToggleTheme from "../utils/ToggleTheme";

const links = [
  { to: "/", label: "Home", icon: <Home size={18} /> },
  { to: "/create/post", label: "Post", icon: <FileText size={18} /> },
  { to: "/categories", label: "Categories", icon: <Folder size={18} /> },
  { to: "/about", label: "About", icon: <Info size={18} /> },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);

  return (
   <div className=" w-full md:max-w-4xl md:mx-auto ">
       <nav className="sticky top-0 z-50 my-3 px-4 w-full py-3 bg-(--nav-bg-light) dark:bg-(--nav-bg-dark) rounded-4xl shadow-md flex justify-between items-center gap-5">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-400" id="logo-container">
          {"GritBlog".split("").map((l, i) => (
            <span key={i} className="letter-animate" style={{ animationDelay: `${0.1 * i}s` }}>{l}</span>
          ))}
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center">
          {links.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 font-medium transition-all ${isActive
                ? "text-blue-500 border-b-2 border-blue-500 pb-1"
                : "text-(--nav-link-light) dark:text-(--nav-link-dark) hover:text-blue-400"}`
            }>{icon}{label}</NavLink>
          ))}
          <ToggleTheme />
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-(--nav-link-light) dark:text-(--nav-link-dark)" onClick={toggle}>
          {open ? <X size={20} /> : <Menu size={24} />}
        </button>

        {/* Mobile Sidebar */}
        <div className={`fixed top-0 right-0 h-full w-40 bg-(--nav-bg-light) dark:bg-(--nav-bg-dark) shadow-lg transform transition-transform duration-300 ease-in-out text-(--nav-link-light) dark:text-(--nav-link-dark) ${open ? "translate-x-0" : "translate-x-full"} md:hidden flex flex-col p-6`}>
          <button className="self-end mb-6" onClick={toggle}><X size={24} /></button>
          <div className="flex flex-col gap-4">
            {links.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) =>`flex items-center gap-2 text-lg font-medium transition ${isActive
                  ? "text-blue-500!"
                  : "text-(--nav-link-light) dark:text-(--nav-link-dark) hover:text-blue-400!"} focus:outline-none`
              }>{icon}{label}</NavLink>
            ))}
          </div>
          <div className="mt-auto pt-6 border-t border-gray-300 dark:border-gray-700"><ToggleTheme /></div>
        </div>
    </nav>
   </div>
    
  );
};

export default Navbar;
