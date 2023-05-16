import React from "react";
import '../styles/Login.css'
import '../App.css'
import hs_logo from '../assets/hs-logo.png'
import text_logo from '../assets/text-logo.png'

export default function LoginPage() {
    return (
        <div className="LoginPage">
            <div className="login-container">
                <h1>Welcome to HS-TMS!</h1>

                <img src={hs_logo} alt="HS-logo" className="logo" />

                <div className="button" id="fenix-login">Login with FenixEdu@IST</div>
                <div className="button" id="demo-account">Demo account</div>
                <a href="">Github</a>
            </div>
        </div>
    )
}