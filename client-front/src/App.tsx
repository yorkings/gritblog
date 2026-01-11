import { useEffect } from "react"
import Login from "./components/authentication/Login"
import SignUp from "./components/authentication/SignUp"
import Navbar from "./components/Navbar"
import Toastcontainer from "./utils/ToastContainer"
import { BrowserRouter as Router,Routes,Route } from "react-router-dom"
import { AuthStore } from "./lib/AuthStore"
import { Api } from "./lib/Api"
import ProtectedRoutes from "./components/ProtectedRoutes"
import Home from "./components/Home"
import CreatePost from "./components/posts/CreatePost"
import OAuthSuccessHandler from "./components/authentication/OauthSuccess"
import Detail from "./components/posts/Detail"

interface CurrentUser {
  id: number;
  username: string;
  email: string;
}

function App() {
  const fetchUser = AuthStore((state) => state.fetchUser);
  const isAuthenticated = AuthStore((state) => state.isAuthenticated);
  const loading = AuthStore((state) => state.loading);  
  useEffect(()=>{
      const acquireUser = async () => {
        
        try {
          const res_user = await Api.get<CurrentUser>("/user/me")
          fetchUser(res_user.data)
          
        } catch (error) {
          console.error("Failed to acquire user:", error)
          AuthStore.setState({ isAuthenticated: false, loading: false });
        }
    }
    acquireUser()
  },[fetchUser])
  if (loading) {
    return <div className="p-8 text-center">Loading user session...</div>;
  }
  return(
      < main className="h-screen">
          <Router>
            <Navbar/>
            <Toastcontainer/>
            <Routes>
              {/* Public routes */}
               <Route path="/login" element={<Login/>}/>
               <Route path="/register" element={<SignUp/>}/>
                <Route path="/oauth-success" element={<OAuthSuccessHandler/>}/>
                
              {/* Protected routes */}
              <Route element={<ProtectedRoutes />}>
                <Route index element={<Home/>}/>
                <Route path="/create/post" element={<CreatePost/>}/>
                <Route path="/post/detail/:postId" element={<Detail/>} />
      
              </Route>
      
            </Routes>
         
        </Router>

        </main>
  )
}

export default App
