import React, {useEffect, useState, useCallback} from "react";
import axios_instance from "../Axios";
import Plot from "react-plotly.js";
import ProjectSelectBtn from "./ProjectSelectBtn";

//Botão visível dependendo do valor de disableProjectSelectBtn
//Talvez faça mais sentido só adicionar os projetos ativos às opções?
//Possivelmente fazer opção na página dos projetos para se ver os gráficos relativos aos mesmos independentemente se são ativos ou não?

//Título dependente do projeto escolhido?
const today = new Date().toISOString().slice(0,10);
const monthAgo = new Date();
monthAgo.setMonth(monthAgo.getMonth()-1);

function ProjectLineChart({title, typeOfYear, disableProjectSelectBtn}) {
    const [fetchTransactions, setFetchTransactions]= useState(true)

    //Checkar se o ID do projeto é 0 ou não para saber se há projetos ativos
    const [projectID, setProjectID]=useState(0)
    const [dates, setDates] = useState([])
    const [balanceVal, setBalanceVal]=useState([])

    const refetchTransactions = useCallback(() => setFetchTransactions(true));

    useEffect( () => {
      if(fetchTransactions){
        axios_instance.get("transactions",{
          params:{
              order:'ASC',
              balanceBy: projectID
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
    <div className="chart-box">
        <div className="chart-header">
            <div className="chartTitle">{title}</div>
            <div className="projectSelect"> <ProjectSelectBtn setProjectID={setProjectID} refetch={refetchTransactions} idx={parseInt(title.substr(title.length-1))}/></div>
        </div>
        <div className="chart">
          {(dates.length===0 || dates.length===1) ? <div className="transaction-warn-container">Not enough transactions</div>: 
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
              xaxis: {
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
              },
              modebar:{orientation:"v"},
              width: 680,
              height:450,
              margin: {t:60, b:20, l: 50, r: 50},
              autosize: false,
              plot_bgcolor:"#333333",
              paper_bgcolor:"#333333",
              font: {
                  color: "#ffffff"
              },
            }}
          />}
        </div>
    </div>
    );
  }

export default ProjectLineChart;