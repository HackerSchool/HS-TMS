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
import FadingAlert from "./components/FadingAlert"

function App() {

    const [user, setUser] = useState();
    const [errorMsg, setErrorMsg] = useState("");
    const [displayErrorMsg, setDisplayErrorMsg] = useState(false);

    useEffect(() => {
        axios_instance.get("auth/user")
            .then(res => {
                if (res.status === 200) return res.data;
                throw new Error("Authentication failed!");
            })
            .then(data => setUser(data))
            .catch(err => {
                setUser(false);

                if (!err.response) { // Thrown error above
                    setErrorMsg(err.message);
                    setDisplayErrorMsg(true);
                }
                else if (err.response.status === 403) { // AxiosError, sv responded with 4xx
                    setErrorMsg("Successfully authenticated via FenixEdu but not authorized in the system");
                    setDisplayErrorMsg(true);
                }
            });
    }, []);

    return (
        <div className="App">
            <FadingAlert show={displayErrorMsg} className="login-alert" duration={3000}
                    onClose={() => setDisplayErrorMsg(false)} severity="error">
                {errorMsg}
            </FadingAlert>

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
