import { Routes, Route, Navigate } from "react-router-dom"
import { React, useEffect, useState } from "react"
import LoginPage from "./pages/Login"
import Home from "./components/Home"
import axios_instance from "./Axios"
import './App.css'
import DashboardPage from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import ProjectsPage from './pages/Projects';
import ChartsPage from './pages/Charts';
import Alert from '@mui/material/Alert';

function App() {

    const [user, setUser] = useState();
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        axios_instance.get("auth/user")
            .then(res => {
                if (res.status == 200) return res.data;
                throw new Error("Authentication failed!");
            })
            .then(data => {
                console.log(data);
                setUser(data);
            })
            .catch(err => {
                console.log(err);
                setUser(false);
                if (typeof err === String) setErrorMsg(err);
                else if (err.response.status === 403)
                    setErrorMsg("Successfully authenticated via FenixEdu but not authorized in the system")
            });
    }, [])

    return (
        <div className="App">
            {errorMsg && <Alert className="login-alert" onClose={() => setErrorMsg("")} severity="error">{errorMsg}</Alert>}

            {user != undefined && <Routes>
                {!user && <Route path="/login" element={<LoginPage />} />}
                {user && <Route path="/home" element={<Home user={user} />} >
                    <Route index element={<Navigate to='dashboard' />} />
                    <Route path='dashboard' element={<DashboardPage />} />
                    <Route path='transactions' element={<TransactionsPage />} />
                    <Route path='projects' element={<ProjectsPage />} />
                    <Route path='charts' element={<ChartsPage />} />
                    <Route path='*' element={<Navigate to='dashboard' />} />
                </Route>}
                <Route path='*' element={user ? <Navigate to='/home' /> : <Navigate to='/login' />} />
            </Routes>}
        </div>
    )
}

export default App
