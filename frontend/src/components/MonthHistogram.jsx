import React, {useEffect,useState} from "react";
import axios_instance from "../Axios";
import Plot from "react-plotly.js";

function MonthHistogram({title}){
    const [histogramData, setHistogramData] = useState({});
    const [year, setYear]=useState("2023");
    const [fetchTransactions, setFetchTransactions] = useState(true);
    //Fetches data for a specific month, year, and type of transaction (Earning/Expense)
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
                return 0;
            }
            else {
                //Sum of the transactions values
                return Math.abs(transactions.reduce((accumulator, transaction) => {
                    return accumulator + transaction.value;
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
                    const firstYear=parseInt(transactions[transactions.length-1].date.substring(0,4));
                    const lastYear=parseInt(transactions[0].date.substring(0,4));
                    setYear(lastYear)
                    return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => (firstYear + index).toString());
                }
            })
            .catch(error=>{
                console.error(error);
            });
            return res;
    }

    const generateHistogramDataForYear = () => {
        return histogramData[year] || []; // Returns the data for the selected year or an empty array if it's not available
      };

    useEffect(() => {
        if(fetchTransactions){

            const months=[1,2,3,4,5,6,7,8,9,10,11,12];
            const years_promise = fetchYears();
            Promise.all([years_promise])
                .then((result)=> {
                    const years = result[0];

                    const y_earn_promises = months.flatMap((month) => 
                         years.map((year)=>fetchTransactionData(month,year,true))
                    );

                    const y_exp_promises = months.flatMap((month) => 
                         years.map((year)=>fetchTransactionData(month,year,false))
                    );

                    Promise.all([...y_earn_promises, ...y_exp_promises])
                        .then((results) => {
                            const y_earn = results.slice(0,results.length/2);
                            const y_exp = results.slice(results.length/2);
                            let data = {}
                            years.forEach((year)=>{
                                const year_index = years.indexOf(year);
                                const y_year_earn=y_earn.filter((value, index) => index % years.length === year_index);
                                const y_year_exp=y_exp.filter((value, index) => index % years.length === year_index);
                                const earnings = {
                                    x: months,
                                    y: y_year_earn,
                                    name: "Earnings",
                                    text: y_year_earn.map(String),
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
                                    y: y_year_exp,
                                    text: y_year_exp.map(String),
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
                                const year_data={[year]:[earnings,expenses],};
                                data = {...data, ...year_data};
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
            <div className="chartTitle">{title}</div>
            <div className="chart">
            <Plot
                data={histogramData[year]}
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
                    //Dropdown menu for choosing the desired year
                    updatemenus:[{
                        buttons:[
                            //Object.keys(histogramData).map((year) => ({
                            //    method:"restyle",
                            //    args: [["data"], [histogramData[year]]],
                            //    label: year,
                            //  }))

                        ],
                        type:"dropdown",
                        xanchor:"left",
                        yanchor:"top",
                        showactive: true,
                    }]
                }}
            />
            </div>
        </div>
    );
}
export default MonthHistogram;