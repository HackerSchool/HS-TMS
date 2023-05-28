import { Routes, Route, Navigate} from "react-router-dom"
import { React, useState } from "react"
import LoginPage from "./pages/Login"
import Home from "./components/Home"
import './App.css'

function App() {

    const [loginToken, setLoginToken] = useState("");


    return (
        <div className="App">
            <Routes>
                {!loginToken && <Route path="/login" element={<LoginPage />} />}
                {loginToken && <Route path='*' element={<Home />} />}
                <Route path='*' element={<Navigate to='/login'/>}/>
            </Routes>
        </div>
    )
}

export default App
