import { Routes, Route, Navigate } from "react-router-dom"
import { React, useEffect, useState } from "react"
import './App.css'
import axios_instance from "./Axios"
import { showErrorMsg } from "./Alerts"
import Home from "./components/Home"
import LoginPage from "./pages/Login"
import DashboardPage from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import ProjectsPage from './pages/Projects';
import ChartsPage from './pages/Charts';
import SettingsPage from "./pages/Settings"

function App() {

    const [user, setUser] = useState();

    useEffect(() => {

        // Add a response interceptor to logout user when unauthorized
        axios_instance.interceptors.response.use((response) => {
            // Any status code that lie within the range of 2xx cause this function to trigger
            return response;
        }, (error) => {
            // Any status codes that falls outside the range of 2xx cause this function to trigger

            if (error.response.status === 403 || error.response.status === 401) {
                if (window.location.pathname.match(/\/home\//g))
                    showErrorMsg("Session expired or no longer authorized");
                
                setUser(false);
            }
            
            return Promise.reject(error);
        });


        // Check if user is logged in
        axios_instance.get("auth/user")
            .then(res => {
                if (res.status === 200) return res.data;
                throw new Error("Authentication failed!");
            })
            .then(data => setUser(data))
            .catch(err => {
                if (!err.response) { // Thrown error above
                    showErrorMsg(err.message);
                }
                else if (err.response.status === 403) { // AxiosError, sv responded with 4xx
                    showErrorMsg("Successfully authenticated via FenixEdu but not authorized in the system");
                }
                else if (("" + err.response.status)[0] === '5') { // Internal sv error
                    showErrorMsg("Authentication failed. Internal server error")
                }
            });
    }, []);

    return (
        <div className="App">
            {user != undefined && <Routes>
                {!user && <Route path="/login" element={<LoginPage />} />}
                {user && <Route path="/home" element={<Home user={user} />} >
                    <Route index element={<Navigate to='dashboard' />} />
                    <Route path='dashboard' element={<DashboardPage />} />
                    <Route path='transactions' element={<TransactionsPage />} />
                    <Route path='projects' element={<ProjectsPage />} />
                    <Route path='charts' element={<ChartsPage />} />
                    <Route path='settings' element={<SettingsPage />} />
                    <Route path='*' element={<Navigate to='dashboard' />} />
                </Route>}
                <Route path='*' element={user ? <Navigate to='/home' /> : <Navigate to='/login' />} />
            </Routes>}
        </div>
    )
}

export default App
