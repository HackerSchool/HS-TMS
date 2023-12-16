import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Plot from "react-plotly.js";

const today = new Date().toISOString().slice(0,10);
const monthAgo = new Date();
monthAgo.setMonth(monthAgo.getMonth()-1);

function BalanceTimeSeries({ transactions, loading, disableRange, inDashboard }){
    const [dates, setDates] = useState([]);
    const [balanceVal, setBalanceVal] = useState([]);
    
    useEffect(() => {
        if (loading) return;

        const orderAsc = transactions[0]?.date > transactions[transactions.length - 1]?.date ? false : true;

        const tempTransactions = orderAsc ? transactions : transactions.map(t => t).reverse()
        
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
        range: [
            inDashboard ? monthAgo.toISOString().slice(0,10) : dates[0],
            today
        ],
        showgrid: true,
        zeroline: true,
        gridcolor: "#474747",
        zerolinecolor: "#ffffff",
        linecolor: "#ffffff",
        color: "#ffffff",
        type: "date",
        ...(disableRange ? {} : {
            rangeselector: {
                buttons: [
                    {
                    count: 1, 
                    label: "1m",
                    step: "month",
                    stepmode:"backward"
                    },
                    {
                    count: 6, 
                    label: "6m",
                    step: "month",
                    stepmode:"backward"
                    },
                    {
                    count: 12, 
                    label: "1y",
                    step: "month",
                    stepmode:"backward"
                    },
                    {
                    step:"all",
                    label: "All"
                    }
                ], 
              font: { color: '#333333' },
              bgcolor: '#6bba75',
              bordercolor: '#6bba75',
              borderwidth: 2
            },
            rangeslider: { range: [dates[0], today] },
        })
      };

    if (!loading && transactions.length <= 1) {
        return <div className="transaction-warn-container" style={{ textAlign: "center" }}>
            Not enough transactions to plot
            {inDashboard
                ? <>.<br/>Check the
                    <NavLink to="/home/charts" className="link"> charts page </NavLink>
                    for the full balance history</>
                : ""
            }
        </div>
    }

    return (
          <Plot
            data={[
              {
                x: dates,
                y: balanceVal,
                type: "scatter",
                mode: "lines+markers+text",
                line: { color: "6bba75", width: 1.5 },
                marker: { color: "white", size: 6 },
                text: balanceVal,
                textposition: "top center",
                hoverinfo: "x+y",
              },
            ]}
            config={{ modeBarButtonsToRemove: ["select2d", "lasso2d", "resetScale2d"], displaylogo: false }}
            layout={{
              yaxis: {
                showgrid: true,
                gridcolor: "#474747",
                showline:true,
                zeroline: true,
                zerolinecolor: "#ffffff",
                hoverformat:".2f",
                linecolor: "#ffffff",
                type: "linear",
              },
              modebar:{ orientation:"v", bgcolor: "rgba(0,0,0,0)" },
              xaxis: xaxisconfig,
              width: 680,
              height: inDashboard ? 350 : 450,
              margin: {t: disableRange ? 20 : 60, b:20, l: inDashboard ? 40 : 50, r: inDashboard ? 40 : 50},
              autosize: false,
              plot_bgcolor: "rgba(0,0,0,0)",
              paper_bgcolor: "rgba(0,0,0,0)",
              font: {
                  color: "#ffffff"
              },
            }}
          />
    );
}

export default BalanceTimeSeries;