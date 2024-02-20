import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import CircularProgress from "@mui/material/CircularProgress";

function Home() {
  return (
    <>
      <Sidebar />
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
        <Outlet />
      </Suspense>
    </>
  );
}

export default Home;
