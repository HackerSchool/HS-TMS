import { Routes, Route, Navigate } from "react-router-dom"
import { React, useEffect, useState } from "react"
import LoginPage from "./pages/Login"
import Home from "./components/Home"
import './App.css'
import DashboardPage from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import ProjectsPage from './pages/Projects';
import ChartsPage from './pages/Charts';

function App() {

    const [user, setUser] = useState();

    return (
        <div className="App">
            <Routes>
                {!user && <Route path="/login" element={<LoginPage user={user} setUser={setUser} />} />}
                {user && <Route path="/home" element={<Home user={user} />} >
                    <Route index element={<Navigate to='dashboard' />} />
                    <Route path='dashboard' element={<DashboardPage />} />
                    <Route path='transactions' element={<TransactionsPage />} />
                    <Route path='projects' element={<ProjectsPage />} />
                    <Route path='charts' element={<ChartsPage />} />
                    <Route path='*' element={<Navigate to='dashboard' />} />
                </Route>}
                <Route path='*' element={user ? <Navigate to='/home' /> : <Navigate to='/login' />} />
            </Routes>
        </div>
    )
}

export default App
