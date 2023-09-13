import React, {useEffect, useState, useCallback} from "react";
import axios_instance from "../Axios";
import Plot from "react-plotly.js";
import TransactionTypeBtn from "./TransactionTypeBtn";

const projects = [-1,6,7,8];
const project_names = ["Projects", "Bank", "HS", "Other"];
const bars_color = ["#7FA8FD","#FFDC82","#6BBA75","#FF787C"];
const bar_lines_color = ["#4274C4", "#CEA54E", "#0E9553", "#9F5C5C"];

//Transactions CANNOT BE any combination of Bank, HS and Other.
function StackedBarChart({title, typeOfYear, fetchTransactions, setFetchTransactions}){
    const [histogramData, setHistogramData] = useState([]);
    const [years, setYears] = useState([]);
    const [earningBool, setEarningBool] = useState(true);
    const [projectsData, setProjectsData] = useState([]);
    const [bankData, setBankData] = useState([]);
    const [HSData, setHSData] = useState([]);
    const [otherData, setOtherData] = useState([]); 

    const refetchTransactions = useCallback(() => setFetchTransactions(true));

    const fetchTransactionData = (month, year, earningBool, projectID) => {
        const res = axios_instance.get("transactions", {
            params:{
                initialMonth:`${year}-${month}`,
                finalMonth:`${year}-${month}`,
                ...
                earningBool ? {initialValue:0} : {finalValue:0},
                ...
                projectID === -1 ? {} : {projects:JSON.stringify([projectID])},
            },
        })
        .then( response => {
            const transactions=response.data;
            if(transactions.length===0){
                return 0;
            }
            else {
                //Sum of the transactions values
                return Math.abs(transactions.reduce((accumulator, transaction) => {
                    if(projectID===-1){
                        if(transaction.projects !== "Banco" && transaction.projects !== "HS" && transaction.projects !== "Outros"){
                            return accumulator + transaction.value;
                        } else {
                            return accumulator;
                        }
                    } else {
                        return accumulator + transaction.value
                    }
                }, 0));
            }
        })
        .catch(error=>{
            console.error(error);
        });
        return res;
    };

    //Fetches the first and last year recorded by the transactions
    const fetchYears = () => {
        const res = axios_instance.get("transactions")
            .then( response => {
                const transactions = response.data;
                if(transactions.length===0){
                    //If there are no transactions, 2023 is chosen as default year
                    return ["2023"]
                } else {
                    //If typeOfYear is civic then the first year is automatically the first year seen. If typeOfYear is academic we need to check if the month is lesser than 9 (september): if it is the first, academic year is firstYear-1/firstYear.
                    //if it isn't the first academic year, is firstYear/firstYear+1 (we only return the first year of the academic year). The same check is done for lastYear.
                    const firstYear= typeOfYear==="civic" ? parseInt(transactions[transactions.length-1].date.substring(0,4)) : 
                        parseInt(transactions[transactions.length-1].date.substring(5,7)) < 9 ? parseInt(transactions[transactions.length-1].date.substring(0,4))-1 : parseInt(transactions[transactions.length-1].date.substring(0,4));
                    const lastYear=typeOfYear==="civic" ? parseInt(transactions[0].date.substring(0,4)) : 
                        parseInt(transactions[0].date.substring(5,7)) < 9 ? parseInt(transactions[0].date.substring(0,4))-1 : parseInt(transactions[0].date.substring(0,4));
                    return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => (firstYear + index)).reverse();
                }
            })
            .catch(error=>{
                console.error(error);
            });
            return res;
    }

    useEffect(() => {
        if(fetchTransactions){
            const months = typeOfYear === "civic" ? [1,2,3,4,5,6,7,8,9,10,11,12] : [9,10,11,12,1,2,3,4,5,6,7,8];
            const years_promise = fetchYears();
            Promise.all([years_promise])
                .then((result)=> {
                    const years = result[0];
                    //[-1, 6,7,8] - ID's [All Projects, Banco, HS, Outros] - Hard Coded
                    setYears(years);
                    const data_promises = projects.flatMap((projectID) => months.flatMap((month) => 
                        years.map((year)=> typeOfYear==="academic" && month < 9 ? fetchTransactionData(month,year+1,earningBool, projectID) : fetchTransactionData(month,year,earningBool, projectID))));
                    Promise.all(data_promises)
                        .then((results) => {

                            let data = [];
                            years.forEach((year)=>{
                                const year_index = years.indexOf(year);
                                let year_data=[];
                                for(let i=0; i<4;i++){
                                    const typeData = results.slice((results.length/4)*i, (results.length/4)*(i+1));
                                    const y_year = typeData.filter((value, index) => index % years.length === year_index);
                                   
                                    const typedTransactions = {
                                        x: months.map(String),
                                        y: y_year,
                                        name: project_names[i],
                                        text: y_year.map(String),
                                        type: "bar",
                                        //Only the most recent year with transactions is initially visible
                                        visible: year_index===0,
                                        marker: {
                                            color: bars_color[i],
                                            line: {
                                            color: bar_lines_color[i],
                                            width: 2,
                                            },
                                        },
                                    };
                                    year_data=[...year_data, typedTransactions]
                                }
                                data = [...data, ...year_data];
                            });
                            setHistogramData(data);
                            setFetchTransactions(false)
                        })
                        .catch((error) => {
                            console.error(error);
                        });
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
                            const visibleArray=Array(years.length*4).fill(false);
                            for(let i=0; i<4; i++){
                                visibleArray[index*4+i]=true;
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