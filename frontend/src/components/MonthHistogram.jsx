import React, {useEffect,useState} from "react";
import axios_instance from "../Axios";
import Plot from "react-plotly.js";

function MonthHistogram({title}){
    const [histogramData, setHistogramData] = useState([]);
    const [monthEarnings, setMonthEarnings] = useState(Array(12).fill(0))
    const [monthExpenses, setMonthExpenses] = useState(Array(12).fill(0))
    const [year, setYear]=useState(2023)
    const [fetchTransactions, setFetchTransactions] = useState(true);

    useEffect(() => {
        const fetchTransactionData = (month, year, earning_bool) => {
            const res = axios_instance.get("transactions", {
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
                        setMonthEarnings(tempEarn);
                        tempEarn[month-1]=0;
                        return tempEarn[month-1];
                    } else {
                        const tempExp = [...monthExpenses];
                        tempExp[month-1]=0;
                        setMonthExpenses(tempExp);
                        return tempExp[month-1];
                    }
                }
                else{
                    if(earning_bool){
                        const tempEarn = [...monthEarnings];
                        tempEarn[month-1] = Math.abs(transactions.reduce((accumulator, transaction) => {
                            return accumulator + transaction.value;
                        }, 0));
                        setMonthEarnings(tempEarn);
                        console.log
                        return tempEarn[month-1];
                    } else {
                        const tempExp = [...monthExpenses];
                        tempExp[month-1] = Math.abs(transactions.reduce((accumulator, transaction) => {
                            return accumulator + transaction.value;
                        }, 0));
                        setMonthExpenses(tempExp);
                        return tempExp[month-1];
                    }
                }
            })
            .catch(error=>{
                console.error(error);
            });
            return res;
        };
        console.log(fetchTransactions)
        if(fetchTransactions){
            const months=[1,2,3,4,5,6,7,8,9,10,11,12];
            const y_earn_promises=months.map((month)=>fetchTransactionData(month,year,true))
            const y_exp_promises=months.map((month)=>fetchTransactionData(month,year,false))
            
            Promise.all([...y_earn_promises, ...y_exp_promises])
            .then((results) => {
                const y_earn = results.slice(0, months.length);
                const y_exp = results.slice(months.length);
                console.log(y_exp);

                const earnings = {
                x: months,
                y: y_earn,
                name: "Earnings",
                text: y_earn.map(String),
                type: "bar",
                marker: {
                    color: "#6bba75",
                    line: {
                    color: "#0e9553",
                    width: 1.5,
                    },
                },
                };

                const expenses = {
                x: months,
                y: y_exp,
                text: y_exp.map(String),
                name: "Expenses",
                type: "bar",
                marker: {
                    color: "#ff7e80",
                    line: {
                    color: "#cc6466",
                    width: 1.5,
                    },
                },
                };
                setHistogramData([earnings, expenses]);
                setFetchTransactions(false)
            })
            .catch((error) => {
                console.error(error);
            });
    }}, [fetchTransactions]);

    return (
        <div className="chart-box">
            <div className="chartTitle">{title}</div>
            <div className="chart">
            <Plot
                data={histogramData}
                layout = {{
                    legend: {
                        x: 1,
                        xanchor: 'right',
                        y: 1,
                        bgcolor: 'rgba(0,0,0,0)'
                      },
                    barmode: "group",
                    yaxis: {
                        showgrid: false,
                        showline:true,
                        zeroline: true,
                        zerolinecolor: "#6BBA75",
                        hoverformat:".2f",
                        color: "#6BBA75",
                    },
                    xaxis: {
                        range:[1,12],
                        tickvals:[1,2,3,4,5,6,7,8,9,10,11,12],
                        ticktext:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                        showgrid: false,
                        zeroline: true,
                        zerolinecolor: "#6BBA75",
                        color: "#6BBA75",
                    },
                    plot_bgcolor: "#333333",
                    paper_bgcolor: "#333333",
                    font: {
                        color: "#ffffff"
                    },
                    updatemenus:{

                    }

                }}
            />
            </div>
        </div>
    );
}
export default MonthHistogram;