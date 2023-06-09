import React from 'react';
import { Outlet } from "react-router-dom"
import Sidebar from './Sidebar';
import DashboardPage from '../pages/Dashboard';
import TransactionsPage from '../pages/Transactions';
import ProjectsPage from '../pages/Projects';
import ChartsPage from '../pages/Charts';

function Home() {
    return (
        <>
            <Sidebar />
            <Outlet />
        </>
    );
}

export default Home;