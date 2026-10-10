import { Dashboard }from "./pages/dashboard";
import { Signup } from "./pages/signup";
import { Signin } from "./pages/signin";
import { BrowserRouter,Routes,Route } from "react-router-dom";
import { Landing } from "./pages/landing";
import { SharedPage } from "./pages/sharedPage";


// App.tsx has been made bulkier that is why , we have moved the dashboard page in pages folder seprately

 function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/signup" element={<Signup/>} />
    <Route path="/signin" element={<Signin/>} />
    <Route path="/dashboard" element={<Dashboard/>} />
    <Route path="/share/:shareLink" element={<SharedPage/>} />
    <Route path="*" element={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400 font-sans">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">404</h1>
          <p>Page not found</p>
        </div>
      </div>
    } />
  </Routes> 
  
  </BrowserRouter>
}

export default App;