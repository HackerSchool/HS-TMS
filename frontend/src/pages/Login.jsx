import React, { useState } from "react";
import '../styles/Login.css'
import '../App.css'
import hs_logo from '../assets/hs-logo.png'
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';

export default function LoginPage() {
    const [imageReady, setImageReady] = useState(false)

    const image = new Image();
    image.onload = () => setImageReady(true)
    image.src = hs_logo;

    return (
        <div className="LoginPage">
            <div className="login-container">
                <h1>Welcome to HS-TMS!</h1>

                {imageReady ?
                <img src={hs_logo} alt="HS-logo" className="logo" />
                : <div className="logo loading"></div>
                }

                <a className="button" id="fenix-login"
                    href="http://localhost:3000/auth/fenix" target="_self" tabIndex={0}>
                    Login with FenixEdu@IST
                </a>
                <a className="button" id="demo-account" tabIndex={0}>Demo account</a>

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