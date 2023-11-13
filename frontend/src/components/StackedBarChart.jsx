import React, {useEffect, useState, useCallback} from "react";
import axios_instance from "../Axios";
import Plot from "react-plotly.js";
import TransactionTypeBtn from "./TransactionTypeBtn";

const bars_color = ["#7FA8FD","#6BBA75","#FFDC82","#FF787C"];
const bar_lines_color = ["#4274C4","#0E9553", "#CEA54E", "#9F5C5C"];

//Transactions CANNOT BE any combination of Bank, HS and Other.
function StackedBarChart({title, typeOfYear, fetchTransactions, setFetchTransactions}){
    const [histogramData, setHistogramData] = useState([]);
    const [years, setYears] = useState([]);
    const [defaultProjects, setDefaultProjects]=useState([])
    const [earningBool, setEarningBool] = useState(true);

    const refetchTransactions = useCallback(() => setFetchTransactions(true));

    const fetchTransactionData = (earningBool, projects) => {
        const res = axios_instance.get("transactions", {
            params:{
                ...
                earningBool ? {initialValue:0} : {finalValue:0},
            },
        })
        .then( response => {
            const transactions=response.data;
            if(transactions.length===0){
                setHistogramData([{
                    x: months.map(String),
                    y: Array(12).fill(0),
                    name: "Projects",
                    type: "bar",
                    marker: {
                        line: {
                        width: 2,
                        },
                    },
                    }]);
                setYears([2023]);
                setFetchTransactions(false);
            }
            else {
                const firstYear = typeOfYear==="civic" ? parseInt(transactions[transactions.length-1].date.substring(0,4)) :
                        parseInt(transactions[transactions.length-1].date.substring(5,7)) < 9 ? parseInt(transactions[transactions.length-1].date.substring(0,4))-1 : parseInt(transactions[transactions.length-1].date.substring(0,4));
                const lastYear = typeOfYear==="civic" ? parseInt(transactions[0].date.substring(0,4)) : 
                    parseInt(transactions[0].date.substring(5,7)) < 9 ? parseInt(transactions[0].date.substring(0,4))-1 : parseInt(transactions[0].date.substring(0,4));
                const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => (firstYear + index)).reverse();
                setYears(years);
                let transaction_y = years.map((year)=>{
                    return Array(projects.length+1).fill(Array(12).fill(0))

                });
                //Porque é que isto tem logo um valor? :')
                console.log(transaction_y)
                
                const months = typeOfYear==="civic" ? [1,2,3,4,5,6,7,8,9,10,11,12] : [9,10,11,12,1,2,3,4,5,6,7,8];
                
                transactions.forEach((transaction)=>{
                    const year_idx= typeOfYear==="civic" ? years.indexOf(parseInt(transaction.date.substring(0,4))) : 
                        parseInt(transaction.date.substring(5,7)) < 9 ? years.indexOf(parseInt(transaction.date.substring(0,4))-1) : years.indexOf(parseInt(transaction.date.substring(0,4)));
                    const month_idx=months.indexOf(parseInt(transaction.date.substring(5,7)));
                    const project_idx=projects.indexOf(transaction.projects);
                    //If project_idx===-1 (project is not default) then the value is assigned to the last position of the transactions array
                    if(project_idx===-1){
                        transaction_y[year_idx][projects.length][month_idx] = transaction_y[year_idx][projects.length][month_idx] + Math.abs(transaction.value);
                    } else {
                        console.log(transaction_y[year_idx][project_idx][month_idx])
                        transaction_y[year_idx][project_idx][month_idx] = transaction_y[year_idx][project_idx][month_idx] + Math.abs(transaction.value);
                    }
                });
                const histData = transaction_y.map((year_y, year_index) => {
                    console.log(year_y)
                    return year_y.map((project_y, project_idx)=>{
                        console.log(projects[project_idx % (projects.length+1)] ? projects[project_idx % (projects.length+1)] : "Projects")
                        return {
                            x: months.map(String),
                            y: project_y,
                            //sque isto
                            name: projects[project_idx % (projects.length+1)] ? projects[project_idx % (projects.length+1)] : "Projects",
                            text: project_y.map(String),
                            type: "bar",
                            //Only the most recent year with transactions is initially visible
                            visible: year_index===0,
                            marker: {
                                //é seguro meter cores, de certeza que só são 3 defaults?
                                color: projects[project_idx % (projects.length+1)] ? bars_color[project_idx % (projects.length+1)] : bars_color[bars_color.length-1],
                                line: {
                                color: projects[project_idx % (projects.length+1)] ? bar_lines_color[project_idx % (projects.length+1)] : bar_lines_color[bar_lines_color.length-1],
                                width: 2,
                                },
                            },
                        }
                    }).flat()
                }).flat();
                console.log(histData)
                setFetchTransactions(false)
                setHistogramData(histData)
            }
        })
        .catch(error=>{
            console.error(error);
        });
    };

    const fetchDefaultProjects = () => {
        const res = axios_instance.get("projects", {
            params: {
                defaultProject: true
            },
        })
        .then( response => {
            const projects=response.data;
            let project_data = projects.map((project) => project.name)
            setDefaultProjects(project_data)
            return project_data
        });
        return res;
    }

    useEffect(() => {
        if(fetchTransactions){
            const default_projects_promise=fetchDefaultProjects();
            Promise.all([default_projects_promise])
                .then((result)=> {
                    const projects = result[0];
                    fetchTransactionData(earningBool, projects);
                }).catch((error) => {
                    console.error(error)
                })
    }}, [fetchTransactions]);
    
    return (
        <div className="chart-box">
            <div className="chart-header">
                <div className="chartTitle">{title}</div>
            <div className="projectSelect"> <TransactionTypeBtn setEarningBool={setEarningBool} refetch={refetchTransactions}/></div>
        </div>
            <div className="chart">
            <Plot
                data={histogramData}
                config={{modeBarButtonsToRemove:[ "select2d", "lasso2d"], displaylogo:false}}
                layout = {{
                    legend: {
                        x: 1,
                        xanchor: 'right',
                        y: 1.15,
                        bgcolor: 'rgba(0,0,0,0)'
                      },
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
                        tickvals: typeOfYear==="civic" ? [1,2,3,4,5,6,7,8,9,10,11,12].map(String) : [9,10,11,12,1,2,3,4,5,6,7,8].map(String),
                        ticktext: typeOfYear==="civic" ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
                        showgrid: false,
                        zeroline: true,
                        zerolinecolor: "#ffffff",
                        color: "#ffffff",
                    },
                    width: 680,
                    height:450,
                    margin: {t: 60, b: 50, l: 50, r: 50},
                    autosize: false,
                    plot_bgcolor: "#333333",
                    paper_bgcolor: "#333333",
                    font: {
                        color: "#ffffff"
                    },
                    //Dropdown menu for choosing the desired year
                    updatemenus:[{
                        buttons:years.map((year,index)=>{
                            const visibleArray=Array(years.length*(defaultProjects.length+1)).fill(false);
                            for(let i=0; i<defaultProjects.length+1; i++){
                                visibleArray[index*(defaultProjects.length+1)+i]=true;
                            }
                            return {
                                method:"restyle",
                                args:["visible", visibleArray],
                                label: typeOfYear==="civic" ? year : [String(year), "/", String(year+1)].join("")
                            }
                        }),
                        type:"dropdown",
                        xanchor:"left",
                        x:0,
                        y:1.15,
                        font: {color: '#333333'},
                        bgcolor: '#6bba75',
                        bordercolor: '#6bba75', // Set the border color to be the same as the background color
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