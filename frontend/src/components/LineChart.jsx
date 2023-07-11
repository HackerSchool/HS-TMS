import Plot from "react-plotly.js";
import React from "react";

function LineChart(props) {
    return (
      <>
        <div className="chartTitle">{props.title}</div>
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
              plot_bgcolor: "#333333",
              paper_bgcolor: "#333333",
            }}
          />
        </div>
      </>
    );
  }

export default LineChart;