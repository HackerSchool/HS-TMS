import React, {useEffect, useState, useCallback} from "react";
import axios_instance from "../Axios";
import Plot from "react-plotly.js";
import ProjectSelectBtn from "./ProjectSelectBtn";

//Botão visível dependendo do valor de disableProjectSelectBtn
//Talvez faça mais sentido só adicionar os projetos ativos às opções?
//Possivelmente fazer opção na página dos projetos para se ver os gráficos relativos aos mesmos independentemente se são ativos ou não?

//Título dependente do projeto escolhido?

function ProjectLineChart({title, typeOfYear, disableProjectSelectBtn}) {
    const [fetchTransactions, setFetchTransactions]= useState(true)
    const [projectID, setProjectID]=useState(0)
    //perguntar
    const refetchTransactions = useCallback(() => setFetchTransactions(true));

    return (
    <div className="chart-box">
        <div className="chart-header">
            <div className="chartTitle">{title}</div>
            <div className="projectSelect"> <ProjectSelectBtn setProjectID={setProjectID} refetch={refetchTransactions} idx={parseInt(title.substr(title.length-1))}/></div>
        </div>
        <div className="chart">
          <Plot
            data={[
              {
                x: [1, 2, 3, 4, 5],
                y: [4, 1, 3, 8, 5],
                type: "scatter",
                mode: "lines+markers",
                marker: { color: "#6BBA75", size: 7 },
                line: { width: 3 },
              },
            ]}
            layout={{
              yaxis: {
                range: [0, 9],
                ticks: "outside",
                showgrid: false,
                zeroline: true,
                zerolinecolor: "#6BBA75",
                color: "#6BBA75",
              },
              xaxis: {
                range: [0, 6],
                ticks: "outside",
                showgrid: false,
                color: "#6BBA75",
              },
              width:680,
              plot_bgcolor: "#333333",
              paper_bgcolor: "#333333",
            }}
          />
        </div>
    </div>
    );
  }

export default ProjectLineChart;