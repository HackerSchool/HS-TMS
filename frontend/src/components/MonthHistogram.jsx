import React, {useEffect,useState} from "react";
import axios_instance from "../Axios";
import Plot from "react-plotly.js";

function MonthHistogram({title, typeOfYear, fetchTransactions, setFetchTransactions}){
    const [histogramData, setHistogramData] = useState([]);
    const [years, setYears]=useState([]);

    useEffect(() => {
        if(fetchTransactions){
            axios_instance.get("transactions", {})
            .then( response => {
                const transactions=response.data;
                if(transactions.length===0){
                    setHistogramData([{
                        x: months.map(String),
                        y: Array(12).fill(0),
                        name: "Earnings",
                        type: "bar",
                        width:0.4,
                        marker: {
                            color: "#6bba75",
                            line: {
                            color: "#0e9553",
                            width: 2,
                            },
                        },
                        }, {
                        x: months.map(String),
                        y: Array(12).fill(0),
                        name: "Expenses",
                        type: "bar",
                        width:0.4,
                        marker: {
                            color: "#ff7e80",
                            line: {
                            color: "#cc6466",
                            width: 2,
                            },
                        },
                        }]);
                    setYears([2023]);
                    setFetchTransactions(false);
                }
                else {
                    //If typeOfYear is civic then the first year is automatically the first year seen. If typeOfYear is academic we need to check if the month is lesser than 9 (september): if it is the first, academic year is firstYear-1/firstYear.
                    //if it isn't the first academic year, is firstYear/firstYear+1 (we only return the first year of the academic year). The same check is done for lastYear.
                    const firstYear = typeOfYear==="civic" ? parseInt(transactions[transactions.length-1].date.substring(0,4)) :
                        parseInt(transactions[transactions.length-1].date.substring(5,7)) < 9 ? parseInt(transactions[transactions.length-1].date.substring(0,4))-1 : parseInt(transactions[transactions.length-1].date.substring(0,4));
                    const lastYear=typeOfYear==="civic" ? parseInt(transactions[0].date.substring(0,4)) : 
                        parseInt(transactions[0].date.substring(5,7)) < 9 ? parseInt(transactions[0].date.substring(0,4))-1 : parseInt(transactions[0].date.substring(0,4));
                    const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => (firstYear + index)).reverse();
                    setYears(years);
                    let transaction_y = years.map((year)=>{
                        return [Array(12).fill(0), Array(12).fill(0)]
                    });
                    
                    const months= typeOfYear==="civic" ? [1,2,3,4,5,6,7,8,9,10,11,12] : [9,10,11,12,1,2,3,4,5,6,7,8];

                    transactions.forEach((transaction)=>{
                        const year_idx= typeOfYear==="civic" ? years.indexOf(parseInt(transaction.date.substring(0,4))) : 
                            parseInt(transaction.date.substring(5,7)) < 9 ? years.indexOf(parseInt(transaction.date.substring(0,4))-1) : years.indexOf(parseInt(transaction.date.substring(0,4)));
                        const month_idx=months.indexOf(parseInt(transaction.date.substring(5,7)));
                        if(transaction.value>=0){
                            transaction_y[year_idx][0][month_idx] = transaction_y[year_idx][0][month_idx] + transaction.value
                        } else {
                            transaction_y[year_idx][1][month_idx] = transaction_y[year_idx][1][month_idx] + Math.abs(transaction.value)
                        }
                    })

                    const histData=transaction_y.map((year_y,idx)=>{
                        return [{
                            x: months.map(String),
                            y: year_y[0],
                            name: "Earnings",
                            text: year_y[0].map(String),
                            type: "bar",
                            width:0.4,
                            //Only the most recent year with transactions is initially visible
                            visible: idx===0,
                            marker: {
                                color: "#6bba75",
                                line: {
                                color: "#0e9553",
                                width: 2,
                                },
                            },
                            }, {
                            x: months.map(String),
                            y: year_y[1],
                            text: year_y[1].map(String),
                            name: "Expenses",
                            type: "bar",
                            width:0.4,
                            visible: idx===0,
                            marker: {
                                color: "#ff7e80",
                                line: {
                                color: "#cc6466",
                                width: 2,
                                },
                            },
                            }]
                    }).flat();
                    setFetchTransactions(false);
                    setHistogramData(histData)
                }
            })
            .catch(error=>{
                console.error(error);
            });
        }}, [fetchTransactions]);
    
    return (
        <div className="chart-box">
            <div className="chartTitle">{title}</div>
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
                    barmode: "group",
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
                            const visibleArray=Array(years.length*2).fill(false);
                            visibleArray[index*2]=true;
                            visibleArray[index*2+1]=true;
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
export default MonthHistogram;