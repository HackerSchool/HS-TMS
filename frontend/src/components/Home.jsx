import React from 'react';
import { Outlet } from "react-router-dom"
import Sidebar from './Sidebar';

function Home({user}) {
    return (
        <>
            <Sidebar user={user} />
            <Outlet />
        </>
    );
}

export default Home;