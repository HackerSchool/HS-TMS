import React, { useState } from "react";
import "../styles/Login.css";
import "../App.css";
import axios_instance from "../Axios";
import { showErrorMsg } from "../Alerts";
import hs_logo from "../assets/hs-logo.png";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";

export default function LoginPage() {
  const [imageReady, setImageReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const image = new Image();
  image.onload = () => setImageReady(true);
  image.src = hs_logo;

  function demoAccountLogin() {
    if (loading) return;

    setLoading(true);

    axios_instance
      .post("auth/demo", {
        username: "demo",
        password: "demo",
      })
      .then(res => {
        if (res.status === 200) {
          return window.location.reload();
        }
        throw new Error();
      })
      .catch(err => {
        setLoading(false);
        if (err.handledByMiddleware) return;

        let msg = "Demo login failed";
        if (err.reqTimedOut) msg += ". Request timed out";
        else if (err.response) {
          if (err.response.status === 401) msg += ". Invalid credentials";
          else msg += ". Internal server error";
        }

        showErrorMsg(msg);
      });
  }

  return (
    <div className="LoginPage">
      <div className="login-container">
        <div className="login-header">
          <div className="title">HackerSchool</div>
          <div className="subtitle">Treasury Management System</div>
        </div>

        {imageReady ? (
          <img src={hs_logo} alt="HS-logo" className="logo" />
        ) : (
          <div className="logo loading"></div>
        )}

        <a
          className="button"
          id="fenix-login"
          href={`${import.meta.env.VITE_API_ADDRESS}/auth/fenix`}
          target="_self"
          tabIndex={0}
        >
          Login with FenixEdu@IST
        </a>
        <a className="button" id="demo-account" tabIndex={0} onClick={demoAccountLogin}>
          Demo account
        </a>

        <footer>
          <a href="https://hackerschool.io" target="_blank">
            <div className="footer-item" id="website">
              <i>
                <LanguageIcon />
              </i>
              Website
            </div>
          </a>
          <a href="https://github.com/HackerSchool/HS-TMS" target="_blank">
            <div className="footer-item" id="github">
              <i>
                <GitHubIcon />
              </i>
              Github
            </div>
          </a>
        </footer>
      </div>
    </div>
  );
}
