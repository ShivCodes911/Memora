import { Dashboard }from "./pages/dashboard";
import { Signup } from "./pages/signup";
import { Signin } from "./pages/signin";
import { BrowserRouter,Routes,Route } from "react-router-dom";


// App.tsx has been made bulkier that is why , we have moved the dashboard page in pages folder seprately

 function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/signup" element={<Signup/>} />
    <Route path="/signin" element={<Signin/>} />
    <Route path="/dashboard" element={<Dashboard/>} />
  </Routes> 
  
  </BrowserRouter>

}

export default App;