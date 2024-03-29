import React, { useEffect, useState, lazy, Suspense } from "react";
import { NavLink } from "react-router-dom";
const Plot = lazy(() => import("react-plotly.js"));
import CircularProgress from "@mui/material/CircularProgress";

const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date();
monthAgo.setMonth(monthAgo.getMonth() - 1);

function BalanceTimeSeries({ transactions, loading, disableRange, inDashboard, orderAsc }) {
  const [dates, setDates] = useState([]);
  const [balanceVal, setBalanceVal] = useState([]);

  useEffect(() => {
    if (loading) return;

    const tempTransactions = orderAsc ? transactions : transactions.map(t => t).reverse();

    const balancesForEachDay = new Map();
    for (const transaction of tempTransactions) {
      balancesForEachDay.set(transaction.date, transaction);
    }

    const balances = Array.from(balancesForEachDay.values());
    setDates(balances.map(transaction => transaction.date));
    setBalanceVal(balances.map(transaction => transaction.balance));
  }, [transactions, loading]);

  const xaxisconfig = {
    autorange: disableRange ? false : true,
    range: [inDashboard ? monthAgo.toISOString().slice(0, 10) : dates[0], today],
    showgrid: true,
    zeroline: true,
    gridcolor: "#474747",
    zerolinecolor: "rgba(255, 255, 255, 0.6)",
    linecolor: "#ffffff",
    color: "#ffffff",
    type: "date",
    ...(disableRange
      ? {}
      : {
          rangeselector: {
            buttons: [
              {
                count: 1,
                label: "1m",
                step: "month",
                stepmode: "backward",
              },
              {
                count: 6,
                label: "6m",
                step: "month",
                stepmode: "backward",
              },
              {
                count: 12,
                label: "1y",
                step: "month",
                stepmode: "backward",
              },
              {
                step: "all",
                label: "All",
              },
            ],
            font: { color: "#ffffff" },
            borderwidth: 1,
            y: 1.06,
          },
          rangeslider: { range: [dates[0], today] },
        }),
  };

  if (!loading && dates.length === 0) {
    return (
      <div className="transaction-warn-container" style={inDashboard ? {} : { height: 450 }}>
        <span>
          Not enough data to plot
          {inDashboard ? (
            <>
              .<br />
              Check the
              <NavLink to="/home/charts" className="link">
                {" "}
                charts page{" "}
              </NavLink>
              for the full balance history
            </>
          ) : (
            ""
          )}
        </span>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          style={{
            width: "100%",
            height: inDashboard ? "100%" : 450,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CircularProgress className="loading-circle large" />
          <p>Loading plot resources...</p>
        </div>
      }
    >
      <Plot
        data={[
          {
            x: dates,
            y: balanceVal,
            type: "scatter",
            mode: "lines+markers",
            line: { color: "6bba75", width: 1.5 },
            marker: { color: "white", size: 6 },
            hoverinfo: "x+y",
          },
        ]}
        config={{
          modeBarButtonsToRemove: ["select2d", "lasso2d", "resetScale2d"],
          displaylogo: false,
          responsive: true,
        }}
        layout={{
          yaxis: {
            showgrid: true,
            gridcolor: "#474747",
            showline: true,
            zeroline: true,
            zerolinecolor: "rgba(255, 255, 255, 0.6)",
            hoverformat: ".2f",
            linecolor: "#ffffff",
            type: "linear",
          },
          modebar: { orientation: "v", bgcolor: "rgba(0,0,0,0)" },
          xaxis: xaxisconfig,
          height: inDashboard ? undefined : 450,
          margin: {
            t: disableRange ? 10 : 50,
            b: disableRange ? 20 : 15,
            l: inDashboard ? 40 : 45,
            r: inDashboard ? 40 : 45,
          },
          autosize: true,
          plot_bgcolor: "rgba(0,0,0,0)",
          paper_bgcolor: inDashboard ? "#252525" : "#333333", // var(--cinza-2) : var(--cinza-4)
          font: {
            color: "#ffffff",
          },
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </Suspense>
  );
}

export default BalanceTimeSeries;
