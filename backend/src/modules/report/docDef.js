/**
 *
 * @param {Object} filters
 * @param {Array<Transaction>} transactions
 * @returns The report document definition (pdfmake docDef)
 */
function getDocDef(filters, transactions) {
    // Get sample period
    let iDate, fDate;
    const sortedTransactions = transactions
        .map((x) => x)
        .sort((t1, t2) => {
            const date1 = new Date(t1.date);
            const date2 = new Date(t2.date);

            return date1 - date2;
        });

    if (filters.initialMonth !== undefined) {
        iDate = filters.initialMonth;
    } else {
        iDate = sortedTransactions[0]?.date;
    }

    if (filters.finalMonth !== undefined) {
        fDate = filters.finalMonth;
    } else {
        fDate = sortedTransactions[sortedTransactions.length - 1]?.date;
    }

    // Get positive and negative balance
    const posBalance = transactions
        .filter((t) => t.value > 0)
        .reduce((acc, t2) => acc + t2.value, 0);
    const negBalance = transactions
        .filter((t) => t.value < 0)
        .reduce((acc, t2) => acc + t2.value, 0);

    // Map filters into text
    let filterRows = [];
    if (filters.initialValue !== undefined)
        filterRows.push([
            "Valor mínimo",
            `${filters.initialValue.toFixed(2)} €`,
        ]);
    if (filters.finalValue !== undefined)
        filterRows.push(["Valor máximo", `${filters.finalValue.toFixed(2)} €`]);
    if (filters.hasNif !== undefined)
        filterRows.push(["Com NIF?", filters.hasNif === true ? "Sim" : "Não"]);
    if (filters.hasFile !== undefined)
        filterRows.push([
            "Com comprovativo?",
            filters.hasFile === true ? "Sim" : "Não",
        ]);
    if (filters.projects !== undefined)
        filterRows.push(["Projetos incluídos", filters.projects]);
    if (
        (filters.orderBy === "date" || filters.orderBy === "value") &&
        (filters.order === "ASC" || filters.order === "DESC")
    ) {
        filterRows.push([
            "Ordenado por",
            `${filters.orderBy === "date" ? "Data" : "Valor"} ${
                filters.order === "ASC" ? "ascendente" : "descendente"
            }`,
        ]);
    }
    // Map filters into table rows
    filterRows = filterRows.map((filter) => [
        {
            ul: [filter[0]],
            alignment: "left",
            fontSize: 12,
            marginLeft: 15,
        },
        {
            text: filter[1],
            alignment: "right",
            fontSize: 12,
        },
    ]);

    return {
        content: [
            header(iDate, fDate, posBalance, negBalance, filterRows),
            transactionsTable(transactions, filters.hasNif === undefined),
        ],
        defaultStyle: {
            fontSize: 12,
            font: "Times",
        },
        images: {
            logo: "hs_logo.png",
        },
    };
}

/* pdfmake document definition */

const header = (initialDate, finalDate, posBalance, negBalance, filters) => [
    // Header info (image + address)
    {
        table: {
            widths: ["*", "*"], // Two columns with equal width
            body: [
                [
                    { image: "logo", width: 50, alignment: "left" },
                    {
                        stack: [
                            {
                                text: "Associação HackerSchool",
                                alignment: "right",
                            },
                            { text: "NIPC: 513491821", alignment: "right" },
                            {
                                text: "Av. Rovisco Pais, Nº1 1049-001, Lisboa",
                                alignment: "right",
                            },
                        ],
                        marginTop: 10,
                    },
                ],
            ],
        },
        layout: "noBorders",
    },
    // Horizontal line (separator)
    {
        stack: [
            {
                canvas: [
                    {
                        type: "line",
                        x1: 0,
                        y1: 5,
                        x2: 595.28 - 80,
                        y2: 5,
                        lineWidth: 1,
                        lineColor: "#000",
                    },
                ],
                alignment: "center",
            },
        ],
    },
    // Title
    {
        text: "Associação HackerSchool",
        alignment: "center",
        marginTop: 25,
        fontSize: 20,
    },
    // Sub-title
    {
        text: "Relatório de contas",
        alignment: "center",
        fontSize: 16,
    },
    // Período em amostra e respectivo balanço
    {
        table: {
            widths: ["*", "*"], // Two columns with equal width
            body: [
                [
                    {
                        text: "Período em amostra:",
                        alignment: "left",
                        fontSize: 14,
                    },
                    {
                        text: `${initialDate ?? "---"}  a  ${
                            finalDate ?? "---"
                        }`,
                        alignment: "right",
                        fontSize: 14,
                    },
                ],
                [
                    {
                        ul: ["Balanço positivo"],
                        alignment: "left",
                        fontSize: 12,
                        marginLeft: 15,
                    },
                    {
                        text: `+ ${posBalance.toFixed(2)} €`,
                        alignment: "right",
                        fontSize: 12,
                    },
                ],
                [
                    {
                        ul: ["Balanço negativo"],
                        alignment: "left",
                        fontSize: 12,
                        marginLeft: 15,
                    },
                    {
                        text: `- ${Math.abs(negBalance).toFixed(2)} €`,
                        alignment: "right",
                        fontSize: 12,
                    },
                ],
            ],
        },
        layout: "noBorders", // Remove table borders
        marginTop: 30,
    },
    // Filtros
    filters.length === 0
        ? {}
        : {
              text: "Filtros aplicados:",
              alignment: "left",
              fontSize: 14,
              marginTop: 10,
          },
    filters.length === 0
        ? {}
        : {
              table: {
                  widths: ["*", "*"], // Two columns with equal width
                  body: filters,
              },
              layout: "noBorders", // Remove table borders
              marginTop: 0,
          },
];

const transactionsTable = (transactions, displayNIF) => [
    // Table
    {
        layout: "dashedLines",
        table: {
            headerRows: 1,
            widths: displayNIF
                ? ["auto", "auto", "*", "auto", "auto", "auto"]
                : ["auto", "auto", "*", "auto", "auto"],
            body: [
                displayNIF
                    ? [
                          { text: "ID", alignment: "center", noWrap: true },
                          { text: "Data", alignment: "center", noWrap: true },
                          { text: "Descrição", alignment: "center" },
                          {
                              text: "Valor (€)",
                              alignment: "center",
                              noWrap: true,
                          },
                          {
                              text: "Balanço (€)",
                              alignment: "center",
                              noWrap: true,
                          },
                          { text: "NIF", alignment: "center", noWrap: true },
                      ]
                    : [
                          { text: "ID", alignment: "center", noWrap: true },
                          { text: "Data", alignment: "center", noWrap: true },
                          { text: "Descrição", alignment: "center" },
                          {
                              text: "Valor (€)",
                              alignment: "center",
                              noWrap: true,
                          },
                          {
                              text: "Balanço (€)",
                              alignment: "center",
                              noWrap: true,
                          },
                      ],
                ...(() => {
                    let body;
                    if (transactions.length === 0) {
                        body = [
                            [
                                { text: "--", alignment: "center" },
                                { text: "--", alignment: "center" },
                                {
                                    text: "Não foram encontradas transações",
                                    alignment: "center",
                                },
                                { text: "--", alignment: "center" },
                                { text: "--", alignment: "center" },
                            ],
                        ];

                        if (displayNIF)
                            body[0].push({ text: "--", alignment: "center" });
                    } else {
                        if (displayNIF) {
                            body = transactions.map((t) => [
                                { text: t.id, noWrap: true },
                                { text: t.date, noWrap: true },
                                t.description,
                                {
                                    text: t.value.toFixed(2),
                                    alignment: "right",
                                    noWrap: true,
                                },
                                {
                                    text: t.balance.toFixed(2),
                                    alignment: "right",
                                    noWrap: true,
                                },
                                {
                                    text: t.has_nif ? "S" : "N",
                                    alignment: "center",
                                    noWrap: true,
                                },
                            ]);
                        } else {
                            body = transactions.map((t) => [
                                { text: t.id, noWrap: true },
                                { text: t.date, noWrap: true },
                                t.description,
                                {
                                    text: t.value.toFixed(2),
                                    alignment: "right",
                                    noWrap: true,
                                },
                                {
                                    text: t.balance.toFixed(2),
                                    alignment: "right",
                                    noWrap: true,
                                },
                            ]);
                        }
                    }

                    return body;
                })(),
            ],
        },
        marginTop: 40,
    },
];

tableLayouts = {
    dashedLines: {
        hLineWidth: function (i, node) {
            return i === 0 || i === 1 || i === node.table.body.length ? 1.2 : 1;
        },
        vLineWidth: function (i, node) {
            return i === 0 || i === node.table.widths.length ? 1.2 : 0.8;
        },
        hLineColor: function (i, node) {
            return "black";
        },
        vLineColor: function (i, node) {
            return "black";
        },
        hLineStyle: function (i, node) {
            return null;
        },
        vLineStyle: function (i, node) {
            if (i === 0 || i === node.table.widths.length) {
                return null;
            }
            return { dash: { length: 4 } };
        },
    },
};

module.exports = {
    getDocDef,
    tableLayouts,
};
