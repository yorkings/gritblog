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
  const isLoading = AuthStore((state) => state.loading);  
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
  if (isLoading) {
          return (
              <div className="min-h-screen flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
          );
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
