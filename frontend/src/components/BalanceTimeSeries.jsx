import React, {useEffect,useState} from "react";
import axios_instance from "../Axios";
import Plot from "react-plotly.js";

const today = new Date().toISOString().slice(0,10);
const monthAgo = new Date();
monthAgo.setMonth(monthAgo.getMonth()-1);

function BalanceTimeSeries({title, typeOfYear, disableRange, inDashboard}){
    const [fetchTransactions, setFetchTransactions] = useState(true)
    const [dates, setDates] = useState([])
    const [balanceVal, setBalanceVal]=useState([])

    const xaxisconfig = disableRange ?
        {
          autorange: false,
          range: [monthAgo.toISOString().slice(0,10), today],
          showgrid: true,
          zeroline: true,
          gridcolor: "#474747",
          zerolinecolor: "#ffffff",
          linecolor: "#ffffff",
          color: "#ffffff",
          type: "date",
        } :
        {
          autorange: true,
          range: [dates[0], today],
          showgrid: true,
          zeroline: true,
          gridcolor: "#474747",
          zerolinecolor: "#ffffff",
          linecolor: "#ffffff",
          color: "#ffffff",
          rangeselector: {buttons: [
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
            font: {color: '#333333'},
            bgcolor: '#6bba75',
            bordercolor: '#6bba75', // Set the border color to be the same as the background color
            borderwidth: 2},
          rangeslider: {range: [dates[0], today]},
          type: "date",
        };

    useEffect( () => {
      if(fetchTransactions){
        axios_instance.get("transactions",{
          params:{
              order:'ASC'
          },
      })
          .then( response => {
              if(response.data.length===0){
                  console.log("No transactions found.");
              }
              else {
                  const valuePerDate={};
                  for (const value of response.data) {
                    if (!valuePerDate[value["date"]] || value.id > valuePerDate[value["date"]].id){
                      valuePerDate[value["date"]] = value;
                    }
                  }
                  const balance = Object.values(valuePerDate);
                  setDates(balance.map((transaction)=> transaction["date"]));
                  setBalanceVal(balance.map( (transaction) => transaction["balance"]));
                  setFetchTransactions(false);
              }
          })
          .catch(error=>{
              console.error(error);
      });
      }
    })
    return (
          <Plot
            data={[
              {
                x: dates,
                y: balanceVal,
                type: "scatter",
                mode: "lines",
                line: { color:"6bba75", width: 3 },
              },
            ]}
            config={{modeBarButtonsToRemove:[ "select2d", "lasso2d", "resetScale2d"], displaylogo:false}}
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
                //desde o 0? ou só pelos limites?
                rangemode: "tozero"
              },
              xaxis: xaxisconfig,
              width: 680,
              height:inDashboard ? 350 : 450,
              margin: {t: inDashboard ? 20 : 60, b:20, l: inDashboard ? 40 : 50, r: inDashboard ? 40 : 50},
              autosize: false,
              plot_bgcolor: inDashboard ? "#252525":"#333333",
              paper_bgcolor: inDashboard ? "#252525":"#333333",
              font: {
                  color: "#ffffff"
              },
            }}
          />
    );
}

export default BalanceTimeSeries;