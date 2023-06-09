import React from "react";
import '../styles/Login.css'
import '../App.css'
import hs_logo from '../assets/hs-logo.png'
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';

export default function LoginPage() {
    return (
        <div className="LoginPage">
            <div className="login-container">
                <h1>Welcome to HS-TMS!</h1>

                <img src={hs_logo} alt="HS-logo" className="logo" />

                <div className="button" id="fenix-login">
                    Login with FenixEdu@IST
                </div>
                <div className="button" id="demo-account">Demo account</div>

                <footer>
                    <a href="https://hackerschool.io" target="_blank">
                        <div className="footer-item" id="website">
                            <i><LanguageIcon /></i>
                            Website
                        </div>
                    </a>
                    <a href="https://github.com/HackerSchool/HS-TMS" target="_blank">
                        <div className="footer-item" id="github">
                            <i><GitHubIcon /></i>
                            Github
                        </div>
                    </a>
                </footer>
            </div>
        </div>
    )
}