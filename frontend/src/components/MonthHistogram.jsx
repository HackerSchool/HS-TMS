import React, {useEffect,useState} from "react";
import axios_instance from "../Axios";
import Plot from "react-plotly.js";

function MonthHistogram(props){
    const [histogramData, setHistogramData] = useState([]);
    const [monthEarnings, setMonthEarnings] = useState(Array(12).fill(0))
    const [monthExpenses, setMonthExpenses] = useState(Array(12).fill(0))
    const [fetchTransactions, setFetchTransactions] = useState(true);

    //Corrigir isto, o fetch está mal falta mudar o else e corrigir o fetchAllTransactions
    useEffect(() => {
        const fetchTransactionData = (month, year, earning_bool) => {
            if(fetchTransactions){
                axios_instance.get("transactions", {
                    params:{
                        initialMonth:`${year}-${month}`,
                        finalMonth:`${year}-${month}`,
                        ...
                        earning_bool ? {initialValue:0} : {finalValue:0}
                    },
                })
                    .then( response => {
                        const transactions=response.data;
                        if(transactions.length===0){
                            if(earning_bool){
                                const tempEarn = [...monthEarnings];
                                tempEarn[month-1]=0;
                                setMonthEarnings(tempEarn)
                            } else {
                                const tempExp = [...monthExpenses];
                                tempExp[month-1]=0;
                                setMonthEarnings(tempExp)
                            }
                        }
                        else{
                            return Math.abs(transactions.reduce((accumulator, transaction) => {
                                return accumulator + transaction.value;
                              }, 0));
                        }
                    })
                    .catch(error=>{
                        console.error(error);
                    });
            };
        };

        const fetchAllTransactions = () => {
            const months=[1,2,3,4,5,6,7,8,9,10,11,12];
            const year=2023;
            const y_earn = months.map((month)=> fetchTransactionData(month,year,true));
            const y_exp = months.map((month)=> fetchTransactionData(month,year,false));
            const earnings = {
                x: months,
                y: y_earn,
                name: "Earnings",
                text: y_earn.map(String),
                type: "bar",
                marker: {
                    color:"#6bba75",
                    line: {
                        color: "#0e9553",
                        width: 1.5
                    }
                }
            };
            const expenses = {
                x: months,
                y: y_exp,
                text: y_exp.map(String),
                name: "Expenses",
                type: "bar",
                marker: {
                    color:"#ff7e80",
                    line: {
                        color: "#cc6466",
                        width: 1.5
                    }
                }
            };
            setHistogramData([earnings, expenses]);
        }

        fetchAllTransactions();

    }, [fetchTransactions]);

    return (
        <div className="chart-box">
            <div className="chartTitle">{props.title}</div>
            <div className="chart">
            <Plot
                data={histogramData}
                layout = {{
                    barmode: "group",
                    yaxis: {
                        ticks: "outside",
                        showgrid: false,
                        zeroline: true,
                        zerolinecolor: "#6BBA75",
                        color: "#6BBA75",
                    },
                    xaxis: {
                        ticks: "outside",
                        showgrid: false,
                        color: "#6BBA75",
                    },
                    plot_bgcolor: "#333333",
                    paper_bgcolor: "#333333",
                }}
            />
            </div>
        </div>
    );
}
export default MonthHistogram;