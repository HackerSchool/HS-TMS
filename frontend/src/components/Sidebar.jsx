import React from 'react';
import { NavLink } from 'react-router-dom';
import hslogo from '../assets/hs-logo.png'
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HandymanIcon from '@mui/icons-material/Handyman';
import BarChartIcon from '@mui/icons-material/BarChart';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

function Sidebar() {
    return (
        <aside>
            <div className="Sidebar">
                <div className="nav-item" id="hstms-logo">
                    <img src={hslogo} alt="HS-logo" id='logo-img' />
                    HS-TMS
                </div>
                <NavLink to='dashboard' className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <DashboardIcon />
                        Dashboard
                </NavLink>

                <NavLink to='transactions' className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <AttachMoneyIcon />
                        Transactions
                </NavLink>
                <NavLink to='projects' className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <HandymanIcon />
                        Projects
                </NavLink>
                <NavLink to='charts' className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <BarChartIcon />
                        Charts
                </NavLink>
                <div className="nav-item" id='logout'>
                    <PowerSettingsNewIcon />
                    Logout
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;