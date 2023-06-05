import { Routes, Route, Navigate} from "react-router-dom"
import { React, useState } from "react"
import LoginPage from "./pages/Login"
import Home from "./components/Home"
import './App.css'

function App() {

    const [user, setuser] = useState(true);


    return (
        <div className="App">
            <Routes>
                {!user && <Route path="/login" element={<LoginPage />} />}
                {user && <Route path='*' element={<Home />} />}
                <Route path='*' element={<Navigate to='/login'/>}/>
            </Routes>
        </div>
    )
}

export default App
