import React from 'react';
import { Routes, Route, Link, Navigate } from "react-router-dom"
import Sidebar from './Sidebar';
import DashboardPage from '../pages/Dashboard';
import TransactionsPage from '../pages/Transactions';
import ProjectsPage from '../pages/Projects';
import ChartsPage from '../pages/Charts';

function Home() {
    return (
        <>
            <Sidebar />
            <Routes>
                <Route path='/dashboard' element={<DashboardPage />}/>
                <Route path='/transactions' element={<TransactionsPage />}/>
                <Route path='/projects' element={<ProjectsPage />}/>
                <Route path='/charts' element={<ChartsPage />}/>
                <Route path='*' element={<Navigate to='/dashboard'/>}/>
            </Routes>
        </>
    );
}

export default Home;