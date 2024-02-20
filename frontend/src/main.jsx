import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { UserProvider } from "./context/UserContext.jsx";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider anchorOrigin={{ horizontal: "right", vertical: "bottom" }} maxSnack={5}>
        <UserProvider>
          <App />
        </UserProvider>
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>
);
