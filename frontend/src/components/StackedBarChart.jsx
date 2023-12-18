import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";
import CircularProgress from '@mui/material/CircularProgress';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DropdownBtn from "./DropdownBtn";

const transactionTypeOptions = [
    { name: "Earnings", bool: true },
    { name: "Costs", bool: false }
];

const bars_color = ["#7FA8FD","#6BBA75","#FFDC82","#FF787C"];
const bar_lines_color = ["#4274C4","#0E9553", "#CEA54E", "#9F5C5C"];

function StackedBarChart({ title, typeOfYear, projectList, transactionsList, loading }){
    const [years, setYears] = useState([]);
    const [earningBool, setEarningBool] = useState(transactionTypeOptions[0].bool);
    const [histogramData, setHistogramData] = useState(() => getHistData([], []));

    const onTransactionTypeSelection = (chosenOption) => {
        setEarningBool(chosenOption.bool);
    }

    useEffect(() => {
        if (loading) return;
        const filteredTransactions = transactionsList.filter(t => {
            if (earningBool) return t.value >= 0;
            return t.value <= 0;
        })
        setHistogramData(getHistData(filteredTransactions, symbolicProjectsNames));
    }, [earningBool, typeOfYear, projectList, transactionsList]);

    const symbolicProjectsNames = useMemo(() => {
        return projectList.filter(proj => proj.symbolic)
                          .map(symbProj => symbProj.name);
    }, [projectList]);

    function getHistData(transactions, projects) {
        const months =
            typeOfYear === "civic"
                ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                : [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

        if (transactions.length === 0) {
            setYears([new Date().getFullYear()]);

            return [
                {
                    x: months.map(String),
                    y: Array(12).fill(0),
                    name: "Projects",
                    type: "bar",
                    marker: {
                        line: {
                            width: 2,
                        },
                    },
                },
            ];
        }

        const firstYear =
            typeOfYear === "civic"
                ? parseInt(
                      transactions[transactions.length - 1].date.substring(0, 4)
                  )
                : parseInt(
                      transactions[transactions.length - 1].date.substring(5, 7)
                  ) < 9
                ? parseInt(
                      transactions[transactions.length - 1].date.substring(0, 4)
                  ) - 1
                : parseInt(
                      transactions[transactions.length - 1].date.substring(0, 4)
                  );

        const lastYear =
            typeOfYear === "civic"
                ? parseInt(transactions[0].date.substring(0, 4))
                : parseInt(transactions[0].date.substring(5, 7)) < 9
                ? parseInt(transactions[0].date.substring(0, 4)) - 1
                : parseInt(transactions[0].date.substring(0, 4));

        const yearsList = Array.from(
            { length: lastYear - firstYear + 1 },
            (_, index) => firstYear + index
        ).reverse();
        setYears(yearsList);

        let n_years = yearsList.length;
        let n_projects = projects.length + 1;
        let n_months = 12;

        // Creating a 3D array [n_years][n_projects][n_months]
        let transaction_y = [];
        for (let i = 0; i < n_years; i++) {
            transaction_y[i] = Array(n_projects);
            for (let j = 0; j < n_projects; j++) {
                transaction_y[i][j] = Array(n_months);
                for (let k = 0; k < n_months; k++) transaction_y[i][j][k] = 0;
            }
        }

        transactions.forEach((transaction) => {
            const year_idx =
                typeOfYear === "civic"
                    ? yearsList.indexOf(parseInt(transaction.date.substring(0, 4)))
                    : parseInt(transaction.date.substring(5, 7)) < 9
                    ? yearsList.indexOf(
                          parseInt(transaction.date.substring(0, 4)) - 1
                      )
                    : yearsList.indexOf(parseInt(transaction.date.substring(0, 4)));
            const month_idx = months.indexOf(
                parseInt(transaction.date.substring(5, 7))
            );
            const project_idx = projects.indexOf(transaction.projects);
            // If project_idx === -1 (project is not symbolic) then the value is
            // assigned to the last position of the transactions array
            if (project_idx === -1) {
                transaction_y[year_idx][projects.length][month_idx] =
                    transaction_y[year_idx][projects.length][month_idx] +
                    Math.abs(transaction.value);
            } else {
                transaction_y[year_idx][project_idx][month_idx] =
                    transaction_y[year_idx][project_idx][month_idx] +
                    Math.abs(transaction.value);
            }
        });

        return transaction_y
            .map((year_y, year_index) => {
                return year_y
                    .map((project_y, project_idx) => {
                        return {
                            x: months.map(String),
                            y: project_y,
                            // sque isto FIXME
                            name: projects[project_idx % (projects.length + 1)]
                                ? projects[project_idx % (projects.length + 1)]
                                : "Projects",
                            text: project_y.map(String),
                            type: "bar",
                            // Only the most recent year with transactions is initially visible
                            visible: year_index === 0,
                            hoverinfo: "x+y",
                            marker: {
                                // é seguro meter cores, de certeza que só são 3 defaults? FIXME
                                color: projects[
                                    project_idx % (projects.length + 1)
                                ]
                                    ? bars_color[
                                          project_idx % (projects.length + 1)
                                      ]
                                    : bars_color[bars_color.length - 1],
                                line: {
                                    color: projects[
                                        project_idx % (projects.length + 1)
                                    ]
                                        ? bar_lines_color[
                                              project_idx %
                                                  (projects.length + 1)
                                          ]
                                        : bar_lines_color[
                                              bar_lines_color.length - 1
                                          ],
                                    width: 2,
                                },
                            },
                        };
                    })
                    .flat();
            })
            .flat();
    }
    
    return (
        <div className="chart-box">
            <div className="chart-header">
                <div className="chartTitle">{title}</div>
                {loading &&
                    <CircularProgress
                        className="loading-circle small"
                        style={{ marginLeft: 10, marginRight: "auto" }}
                    />}
                <div className="projectSelect">
                    <DropdownBtn
                        icon={<AttachMoneyIcon />}
                        options={transactionTypeOptions}
                        onOptionSelection={onTransactionTypeSelection}
                        defaultIndex={0}
                    />
                </div>
            </div>
            <div className="chart">
            <Plot
                data={histogramData}
                config={{
                    modeBarButtonsToRemove: [ "select2d", "lasso2d"],
                    displaylogo:false
                }}
                layout = {{
                    legend: {
                        x: 1,
                        xanchor: 'right',
                        y: 1.15,
                        bgcolor: 'rgba(0,0,0,0)',
                        orientation: "h"
                      },
                    modebar: { orientation: "v", bgcolor: "rgba(0,0,0,0)" },
                    barmode: "stack",
                    yaxis: {
                        showgrid: true,
                        gridcolor: "#474747",
                        showline:true,
                        zeroline: true,
                        zerolinecolor: "#ffffff",
                        hoverformat:".2f",
                        linecolor: "#ffffff",
                    },
                    xaxis: {
                        type: "category",
                        tickvals: typeOfYear === "civic" 
                                    ? [1,2,3,4,5,6,7,8,9,10,11,12].map(String)
                                    : [9,10,11,12,1,2,3,4,5,6,7,8].map(String),
                        ticktext: typeOfYear === "civic"
                                    ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                    : ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
                        showgrid: false,
                        zeroline: true,
                        zerolinecolor: "#ffffff",
                        color: "#ffffff",
                    },
                    width: 680,
                    height: 450,
                    margin: { t: 60, b: 50, l: 50, r: 50 },
                    autosize: false,
                    plot_bgcolor: "rgba(0,0,0,0)",
                    paper_bgcolor: "rgba(0,0,0,0)",
                    font: {
                        color: "#ffffff"
                    },
                    // Dropdown menu for choosing the desired year
                    updatemenus: [{
                        buttons: years.map((year,index, array) => {
                            const visibleArray = Array(array.length*(symbolicProjectsNames.length+1)).fill(false);
                            for (let i = 0; i < symbolicProjectsNames.length + 1; i++){
                                visibleArray[index*(symbolicProjectsNames.length+1)+i] = true;
                            }
                            return {
                                method: "restyle",
                                args: ["visible", visibleArray],
                                label: typeOfYear==="civic"
                                        ? year
                                        : [String(year), "/", String(year+1)].join("")
                            }
                        }),
                        type: "dropdown",
                        xanchor: "left",
                        x:0,
                        y:1.15,
                        font: { color: '#333333' },
                        bgcolor: '#6bba75',
                        bordercolor: '#6bba75',
                        borderwidth: 2,
                        showactive: true,
                    }]
                }}
            />
            </div>
        </div>
    );
}

export default StackedBarChart;