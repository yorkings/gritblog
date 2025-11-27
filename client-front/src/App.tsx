import Navbar from "./components/Navbar"
import Toastcontainer from "./utils/ToastContainer"
import { BrowserRouter as Router,Routes,Route } from "react-router-dom"

function App() {
  return(
      < main className="h-screen">
          <Router>
            <Navbar/>
            <Toastcontainer/>
            <Routes>
              {/* Public routes */}

              
              {/* Protected routes */}
      

            </Routes>
         
        </Router>

        </main>
  )
}

export default App
