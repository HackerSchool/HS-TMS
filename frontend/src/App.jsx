import { Routes, Route, Navigate } from "react-router-dom";
import { React, useEffect, useState, lazy, Suspense } from "react";
import "./App.css";
import axios_instance from "./Axios";
import { showErrorMsg } from "./Alerts";
const Home = lazy(() => import("./components/Home"));
const LoginPage = lazy(() => import("./pages/Login"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const TransactionsPage = lazy(() => import("./pages/Transactions"));
const ProjectsPage = lazy(() => import("./pages/Projects"));
const ChartsPage = lazy(() => import("./pages/Charts"));
const SettingsPage = lazy(() => import("./pages/Settings"));
import CircularProgress from "@mui/material/CircularProgress";

function App() {
  const [user, setUser] = useState();

  useEffect(() => {
    // Add a timeout to requests
    axios_instance.interceptors.request.use(config => {
      config.timeout = 10000; // Wait for 10 seconds before timing out
      return config;
    });

    // Add a response interceptor (middleware)
    axios_instance.interceptors.response.use(
      response => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
      },
      error => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger

        // Check for timeout
        if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
          console.log("Request timed out");
          error.reqTimedOut = true;
          return Promise.reject(error);
        }

        // Check for demo user trying to modify data
        if (error.response.status === 403 && error.response.data?.username === "demo") {
          console.log("Demo user can't modify data");
          showErrorMsg("Demo User can't modify data");
          error.handledByMiddleware = true;
          return Promise.reject(error);
        }

        // logout user when unauthorized
        if (error.response.status === 403 || error.response.status === 401) {
          if (window.location.pathname.match(/\/home\//g))
            showErrorMsg("Session expired or no longer authorized");

          setUser(false);
        }

        return Promise.reject(error);
      }
    );

    // Check if user is logged in
    axios_instance
      .get("auth/user")
      .then(res => {
        if (res.status === 200) return res.data;
        throw new Error("Authentication failed!");
      })
      .then(data => setUser(data))
      .catch(err => {
        if (err.handledByMiddleware) return;

        setUser(false);

        if (err.reqTimedOut) {
          showErrorMsg("Authentication failed! Request timed out");
        } else if (!err.response) {
          // Thrown error above
          showErrorMsg(err.message);
        } else if (err.response.status === 403) {
          // AxiosError, sv responded with 4xx
          showErrorMsg("Successfully authenticated via FenixEdu but not authorized in the system");
        } else if (("" + err.response.status)[0] === "5") {
          // Internal sv error
          showErrorMsg("Authentication failed. Internal server error");
        }
      });
  }, []);

  return (
    <div className="App">
      {user !== undefined && (
        <Suspense
          fallback={
            <div
              style={{
                height: "100svh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
              }}
            >
              <CircularProgress className="loading-circle large" />
              <p>Loading page...</p>
            </div>
          }
        >
          <Routes>
            {!user && <Route path="/login" element={<LoginPage />} />}
            {user && (
              <Route path="/home" element={<Home user={user} />}>
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="charts" element={<ChartsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Route>
            )}
            <Route path="*" element={user ? <Navigate to="/home" /> : <Navigate to="/login" />} />
          </Routes>
        </Suspense>
      )}
    </div>
  );
}

export default App;
