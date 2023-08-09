import React, {useEffect,useState} from "react";
import axios_instance from "../Axios";
import Plot from "react-plotly.js";

function BalanceTimeSeries({title, typeOfYear}){
    const [fetchTransactions, setFetchTransactions] = useState(true)
    const [dates, setDates] = useState([])
    const [balanceVal, setBalanceVal]=useState([])

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
                  console.log(response.data.map((transaction)=> transaction["date"]))

                  setDates(response.data.map((transaction)=> transaction["date"]));
                  setBalanceVal(response.data.map( (transaction) => transaction["balance"]));
                  setFetchTransactions(false);
              }
          })
          .catch(error=>{
              console.error(error);
      });
      }
    })

    return (
    <div className="chart-box">
        <div className="chart-header">
            <div className="chartTitle">{title}</div>
        </div>
        <div className="chart">
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
            config={{modeBarButtonsToRemove:[ "select2d", "lasso2d"], displaylogo:false}}
            layout={{
              yaxis: {
                showgrid: true,
                gridcolor: "#474747",
                showline:true,
                zeroline: true,
                zerolinecolor: "#ffffff",
                hoverformat:".2f",
                linecolor: "#ffffff",
                type: "linear"
              },
              xaxis: {
                autorange: true,
                range: [dates[0], dates[dates.length-1]],
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
                      count: 3, 
                      label: "3m",
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
                      step:"all",
                      label: "All"
                    }
                  ], 
                  font: {color: '#333333'},
                  bgcolor: '#6bba75',
                  bordercolor: '#6bba75', // Set the border color to be the same as the background color
                  borderwidth: 2},
                rangeslider: {range: [dates[0], dates[dates.length-1]]},
                type: "date",
              },
              width: 680,
              height:450,
              margin: {t: 50, b:30, l: 30, r: 30},
              autosize: false,
              plot_bgcolor: "#333333",
              paper_bgcolor: "#333333",
              font: {
                  color: "#ffffff"
              },
            }}
          />
        </div>
    </div>
    );
}

export default BalanceTimeSeries;