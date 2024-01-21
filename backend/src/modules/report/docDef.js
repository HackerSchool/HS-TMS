/**
 *
 * @param {Object} filters
 * @param {Array<Transaction>} transactions
 * @param {boolean} [fakeCredentials=false]
 * @param {boolean} [drawFooter=false]
 * @param {(value: int) => void} [storePageCount=null]
 * @param {Map<integer, integer[]>} [receiptPagesMap=null]
 * @returns The report document definition (pdfmake docDef)
 */
function getDocDef(
  filters,
  transactions,
  fakeCredentials = false,
  drawFooter = false,
  storePageCount = null,
  receiptPagesMap = null,
) {
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
  const posBalance = transactions.filter((t) => t.value > 0).reduce((acc, t2) => acc + t2.value, 0);
  const negBalance = transactions.filter((t) => t.value < 0).reduce((acc, t2) => acc + t2.value, 0);

  // Map filters into text
  let filterRows = [];
  if (filters.initialValue !== undefined)
    filterRows.push(["Valor mínimo", `${filters.initialValue.toFixed(2)} €`]);
  if (filters.finalValue !== undefined)
    filterRows.push(["Valor máximo", `${filters.finalValue.toFixed(2)} €`]);
  if (filters.hasNif !== undefined)
    filterRows.push(["Com NIF?", filters.hasNif === true ? "Sim" : "Não"]);
  if (filters.hasFile !== undefined)
    filterRows.push(["Com comprovativo?", filters.hasFile === true ? "Sim" : "Não"]);
  if (filters.projects !== undefined) filterRows.push(["Projetos incluídos", filters.projects]);
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
    // There will be no actual footer, this is the easiest way to grab the pageCount
    footer: function (currentPage, pageCount) {
      // Store the page count of the doc
      if (storePageCount) storePageCount(pageCount);
      if (!drawFooter) return {};
      return {
        text: `${currentPage.toString()} / ${pageCount}`,
        alignment: "right",
        marginRight: 20,
        marginTop: 10,
      };
    },
    content: [
      header(fakeCredentials, iDate, fDate, posBalance, negBalance, filterRows),
      transactionsTable(transactions, filters.hasNif === undefined, receiptPagesMap),
    ],
    defaultStyle: {
      fontSize: 12,
      font: "Times",
    },
    styles: {
      link: {
        decoration: "underline",
        color: "blue",
      },
    },
    images: {
      logo: "hs_logo.png",
    },
  };
}

/* pdfmake document definition */

const header = (fakeCredentials, initialDate, finalDate, posBalance, negBalance, filters) => [
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
              {
                text: `NIPC: ${fakeCredentials ? "999999999" : "513491821"}`,
                alignment: "right",
              },
              {
                text: fakeCredentials
                  ? "Sede da HackerSchool, [REDACTED]"
                  : "Av. Rovisco Pais, Nº1 1049-001, Lisboa",
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
            text: `${initialDate ?? "---"}  a  ${finalDate ?? "---"}`,
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

const transactionsTable = (transactions, displayNIF, receiptPagesMap) => {
  // ID | Date | Desc | Value | Balance
  const widths = ["auto", "auto", "*", "auto", "auto"];

  const header = [
    { text: "ID", alignment: "center", noWrap: true },
    {
      text: "Data",
      alignment: "center",
      noWrap: true,
    },
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
  ];

  // NIF
  if (displayNIF) {
    widths.push("auto");
    header.push({
      text: "NIF",
      alignment: "center",
      noWrap: true,
    });
  }
  // Receipt pages
  const displayReceiptsColumn = receiptPagesMap && receiptPagesMap.size > 0;
  if (displayReceiptsColumn) {
    widths.push("auto");
    header.push({
      text: "#",
      alignment: "center",
      noWrap: true,
    });
  }

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
      body[0].push({
        text: "--",
        alignment: "center",
      });
  } else {
    body = transactions.map((t) => {
      const row = [
        { text: t.id, alignment: "center", noWrap: true },
        { text: t.date, alignment: "center", noWrap: true },
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
      ];

      if (displayNIF)
        row.push({
          text: t.has_nif ? "S" : "N",
          alignment: "center",
          noWrap: true,
        });

      if (displayReceiptsColumn) {
        const pagesList = receiptPagesMap.get(t.id);
        row.push({
          text: pagesList ? pagesList[0] : "--",
          alignment: "center",
          noWrap: true,
          linkToPage: pagesList ? pagesList[0] : null,
          style: pagesList ? "link" : "",
        });
      }

      return row;
    });
  }

  return [
    // Table
    {
      layout: "dashedLines",
      table: {
        headerRows: 1,
        widths: widths,
        body: [header, ...body],
      },
      marginTop: 40,
    },
  ];
};

const tableLayouts = {
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
