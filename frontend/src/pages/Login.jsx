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

    function fenixLogin() {
        window.open("http://localhost:3000/auth/fenix", "_self");
    }

    return (
        <div className="LoginPage">
            <div className="login-container">
                <h1>Welcome to HS-TMS!</h1>

                {imageReady ?
                <img src={hs_logo} alt="HS-logo" className="logo" />
                : <div className="logo loading"></div>
                }

                <div className="button" id="fenix-login" onClick={fenixLogin}>
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