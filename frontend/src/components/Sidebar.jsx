import React from 'react';
import { NavLink } from 'react-router-dom';
import ImageRenderer from './ImageRenderer';
import axios_instance from '../Axios';
import { showErrorMsg } from '../Alerts';
import hslogo from '../assets/hs-logo.png'
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HandymanIcon from '@mui/icons-material/Handyman';
import BarChartIcon from '@mui/icons-material/BarChart';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Sidebar({ user }) {

    function logout() {
        axios_instance.post("auth/logout")
            .then(res => {
                if (res.status == 200)
                    window.open('/login', "_self")
                else throw new Error();
            })
            .catch(err => {
                let msg = "Logout failed";
                if (err.response)
                    msg += `. ${("" + err.response.status)[0] === '4' ? "Bad client request" : "Internal server error"}`;

                showErrorMsg(msg);
            });
    }

    return (
        <aside>
            <div className="Sidebar">
                <div className="nav-item" id="hstms-logo">
                    <img src={hslogo} alt="HS-logo" id='logo-img' />
                    HS-TMS
                </div>

                <div className="sidebar-routes-container">
                    <NavLink to='dashboard' className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <DashboardIcon />
                        Dashboard
                    </NavLink>

                    <NavLink to='transactions' className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <AttachMoneyIcon />
                        Transactions
                    </NavLink>
                    <NavLink to='projects' className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <HandymanIcon />
                        Projects
                    </NavLink>
                    <NavLink to='charts' className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <BarChartIcon />
                        Charts
                    </NavLink>
                    <NavLink to='settings' className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <SettingsIcon />
                        Settings
                    </NavLink>
                </div>

                <div className="nav-item" id='user'>
                    <div className="nav-item" id="user-info" >
                        {user.photo ? 
                            <ImageRenderer
                                imageData={[user.photo]}
                                altText='Profile pic'
                                className="profile-pic"
                            />
                            : <AccountCircleIcon
                                alttext='No profile pic'
                                className='profile-pic'
                                />
                        }
                        {user.name}
                    </div>
                    <a className="nav-item" id='logout' onClick={logout} >
                        <PowerSettingsNewIcon />
                        Logout
                    </a>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;