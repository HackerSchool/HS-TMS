const fs = require("fs");
const Transaction = require("../models/Transaction");
const Project = require("../models/Project");
const fileUtils = require("../utils/fileUtils");
const { isValidDate } = require("../utils/dateUtils");
const report = require("../modules/report");
const { emailLoggerFn, logInfo } = require("../modules/logging");

async function createTransaction(req, res) {
  const pool = req.pool;
  const { date, description, value, hasNif, projects } = req.body;

  // input validation
  try {
    if (!isValidDate(date)) {
      throw new Error(`invalid date '${JSON.stringify(date)}' (${typeof date})`);
    }
    if (value === undefined || typeof value !== "number") {
      throw new Error(`invalid value '${JSON.stringify(value)}' (${typeof value})`);
    }
    if (hasNif === undefined || typeof hasNif !== "boolean") {
      throw new Error(`invalid hasNif flag '${JSON.stringify(hasNif)}' (${typeof hasNif})`);
    }
    if (description === undefined || typeof description !== "string" || description.trim() === "") {
      throw new Error(
        `invalid description '${JSON.stringify(description)}' (${typeof description})`,
      );
    }
    if (projects !== undefined) {
      if (!Array.isArray(projects) || !projects.every((v) => Number.isInteger(parseFloat(v)))) {
        throw new Error(`invalid project id's '${JSON.stringify(projects)}' (${typeof projects})`);
      }
      if (!(await Project.assertAllExist(pool, projects))) {
        throw new Error(`there's at least one bad ID in the array '${JSON.stringify(projects)}'`);
      }
      // symbolic projects transactions can only be associated with 1 project
      if (
        (await Project.getAll(pool, undefined, undefined, undefined, true)).some((proj) =>
          projects.some((id) => id === proj.id),
        ) &&
        projects.length > 1
      ) {
        throw new Error(
          `Symbolic projects can't be combined with other projects in a single transaction` +
            ` (project id's: ${JSON.stringify(projects)})`,
        );
      }
    }
  } catch (error) {
    res.status(400).send("Invalid params");
    logInfo("transactionController/createTransaction", error.message, "Validation");
    return;
  }

  if (req.files && Object.keys(req.files).length !== 0) {
    const uploadedFile = req.files.receipt;

    // Assure receipt file type is pdf
    if (uploadedFile.mimetype !== "application/pdf" || !uploadedFile.name.endsWith(".pdf")) {
      res.status(400).send("Invalid params");
      logInfo(
        "transactionController/createTransaction",
        `the uploaded receipt is not a PDF ('${uploadedFile.name}')`,
        "Validation",
      );
      return;
    }

    const transaction = await Transaction.createOne(
      pool,
      date,
      description,
      value,
      true,
      hasNif,
      projects,
    );

    const receiptPath = fileUtils.generateReceiptPath(transaction.id, req.user.username === "demo");

    uploadedFile.mv(receiptPath, async function (err) {
      if (err) {
        await Transaction.deleteOne(pool, transaction.id);
        fs.unlink(receiptPath, (err) => {});
        res.status(500).send("Receipt upload failed");
        logInfo(
          "transactionController/createTransaction",
          `could not store the given receipt ('${uploadedFile.name}') in '${receiptPath}'`,
        ); // FIXME
      } else {
        res.status(201).send(transaction);

        emailLoggerFn(req.user.name, "Transaction", req.method, null, transaction);
      }
    });
  } else {
    const transaction = await Transaction.createOne(
      pool,
      date,
      description,
      value,
      false,
      hasNif,
      projects,
    );
    res.status(201).send(transaction);

    emailLoggerFn(req.user.name, "Transaction", req.method, null, transaction);
  }
}

async function getTransaction(req, res) {
  const pool = req.pool;
  const { id } = req.params;

  // input validation
  if (!Number.isInteger(parseFloat(id))) {
    // assure id is an integer
    res.status(400).send("Invalid params");
    logInfo("transactionController/getTransaction", `invalid id '${id}'`, "Validation");
    return;
  }

  const transaction = await Transaction.getOne(pool, parseInt(id));

  if (transaction === undefined) return res.status(404).send("Transaction not found");

  res.status(200).send(transaction);
}

async function downloadReceipt(req, res) {
  const { id } = req.params;

  // input validation
  if (!Number.isInteger(parseFloat(id))) {
    // assure id is an integer
    res.status(400).send("Invalid params");
    logInfo("transactionController/downloadReceipt", `invalid id '${id}'`, "Validation");
    return;
  }

  const receiptPath = fileUtils.generateReceiptPath(parseInt(id), req.user.username === "demo");

  res.download(receiptPath, function (err) {
    if (err) {
      res.status(404).end();
      logInfo("transactionController/downloadReceipt", `receipt "${receiptPath}" doesn't exist`); // FIXME
    }
  });
}

async function updateTransaction(req, res) {
  const pool = req.pool;
  const { id } = req.params;
  const { date, description, value, hasFile, hasNif, projects } = req.body;

  // input validation
  try {
    if (!Number.isInteger(parseFloat(id))) {
      throw new Error(`invalid id '${id}'`);
    }
    if (!isValidDate(date)) {
      throw new Error(`invalid date '${JSON.stringify(date)}' (${typeof date})`);
    }
    if (value === undefined || typeof value !== "number") {
      throw new Error(`invalid value '${JSON.stringify(value)}' (${typeof value})`);
    }
    if (hasNif === undefined || typeof hasNif !== "boolean") {
      throw new Error(`invalid hasNif flag '${JSON.stringify(hasNif)}' (${typeof hasNif})`);
    }
    if (hasFile === undefined || typeof hasFile !== "boolean") {
      throw new Error(`invalid hasFile flag '${JSON.stringify(hasFile)}' (${typeof hasFile})`);
    }
    if (description === undefined || typeof description !== "string" || description.trim() === "") {
      throw new Error(
        `invalid description '${JSON.stringify(description)}' (${typeof description})`,
      );
    }

    if (projects !== undefined) {
      if (!Array.isArray(projects) || !projects.every((v) => Number.isInteger(parseFloat(v)))) {
        throw new Error(`invalid project id's '${JSON.stringify(projects)}' (${typeof projects})`);
      }
      if (!(await Project.assertAllExist(pool, projects))) {
        throw new Error(`there's at least one bad ID in the array '${JSON.stringify(projects)}'`);
      }
      // symbolic projects transactions can only be associated with 1 project
      if (
        (await Project.getAll(pool, undefined, undefined, undefined, true)).some((proj) =>
          projects.some((id) => id === proj.id),
        ) &&
        projects.length > 1
      ) {
        throw new Error(
          `Symbolic projects can't be combined with other projects in a single transaction` +
            ` (project id's: ${JSON.stringify(projects)})`,
        );
      }
    }
  } catch (error) {
    res.status(400).send("Invalid params");
    logInfo("transactionController/updateTransaction", error.message, "Validation");
    return;
  }

  const oldTransaction = await Transaction.getOne(pool, parseInt(id));
  const transaction = await Transaction.updateOne(
    pool,
    parseInt(id),
    date,
    description,
    value,
    hasFile,
    hasNif,
    projects,
  );

  if (transaction === undefined) return res.status(404).send("Transaction not found");

  res.status(200).send(transaction);

  emailLoggerFn(req.user.name, "Transaction", req.method, oldTransaction, transaction);
}

async function deleteTransaction(req, res) {
  const pool = req.pool;
  const { id } = req.params;

  // input validation
  if (!Number.isInteger(parseFloat(id))) {
    // assure id is an integer
    res.status(400).send("Invalid params");
    logInfo("transactionController/deleteTransaction", `invalid id '${id}'`, "Validation");
    return;
  }

  const deletedTransaction = await Transaction.deleteOne(pool, parseInt(id));

  if (deletedTransaction === undefined) return res.status(404).send("Transaction not found");

  fs.unlink(fileUtils.generateReceiptPath(id, req.user.username === "demo"), (err) => {});

  res.status(204).end();

  emailLoggerFn(req.user.name, "Transaction", req.method, deletedTransaction, null);
}

async function getAllTransactions(req, res) {
  const pool = req.pool;

  const {
    initialDate,
    finalDate,
    initialMonth,
    finalMonth,
    initialValue,
    finalValue,
    hasNif,
    hasFile,
    projects,
    balanceBy,
    orderBy,
    order,
    limit,
  } = req.query;

  // input validation
  try {
    if (initialDate !== undefined && !isValidDate(initialDate)) {
      throw new Error(`invalid initialDate '${initialDate}'`);
    }
    if (finalDate !== undefined && !isValidDate(finalDate)) {
      throw new Error(`invalid finalDate '${finalDate}'`);
    }
    if (initialMonth !== undefined && !isValidDate(initialMonth, true)) {
      throw new Error(`invalid initialMonth '${initialMonth}'`);
    }
    if (finalMonth !== undefined && !isValidDate(finalMonth, true)) {
      throw new Error(`invalid finalMonth '${finalMonth}'`);
    }
    if (initialValue !== undefined && isNaN(parseFloat(initialValue))) {
      throw new Error(`invalid initialValue '${initialValue}'`);
    }
    if (finalValue !== undefined && isNaN(parseFloat(finalValue))) {
      throw new Error(`invalid finalValue '${finalValue}'`);
    }
    if (hasNif !== undefined && hasNif !== "true" && hasNif !== "false") {
      throw new Error(`invalid hasNif flag '${hasNif}'`);
    }
    if (hasFile !== undefined && hasFile !== "true" && hasFile !== "false") {
      throw new Error(`invalid hasFile flag '${hasFile}'`);
    }
    if (projects !== undefined) {
      if (
        !Array.isArray(JSON.parse(projects)) ||
        !JSON.parse(projects).every((v) => Number.isInteger(parseFloat(v)))
      ) {
        throw new Error(`invalid project id's '${projects}'`);
      }
      if (!(await Project.assertAllExist(pool, JSON.parse(projects)))) {
        throw new Error(`there's at least one bad ID in the array '${projects}'`);
      }
    }
    if (balanceBy !== undefined && !Number.isInteger(parseFloat(balanceBy))) {
      throw new Error(`invalid balanceBy '${balanceBy}'`);
    }
    if (orderBy !== undefined && !(orderBy === "date" || orderBy === "value")) {
      throw new Error(`invalid orderBy '${orderBy}'`);
    }
    if (order !== undefined && !(order === "ASC" || order === "DESC")) {
      throw new Error(`invalid order '${order}'`);
    }
    if (limit !== undefined && !Number.isInteger(parseFloat(limit))) {
      throw new Error(`invalid limit '${limit}'`);
    }
  } catch (error) {
    res.status(400).send("Invalid params");
    logInfo("transactionController/getAllTransactions", error.message, "Validation");
    return;
  }

  res
    .status(200)
    .send(
      await Transaction.getAll(
        pool,
        initialDate,
        finalDate,
        initialMonth,
        finalMonth,
        initialValue && parseFloat(initialValue),
        finalValue && parseFloat(finalValue),
        hasNif && JSON.parse(hasNif),
        hasFile && JSON.parse(hasFile),
        projects && JSON.parse(projects),
        balanceBy && parseInt(balanceBy),
        orderBy,
        order,
        limit && parseInt(limit),
      ),
    );
}

async function generateReport(req, res) {
  const pool = req.pool;

  let queryParams = ({
    initialMonth,
    finalMonth,
    initialValue,
    finalValue,
    hasNif,
    hasFile,
    projects,
    orderBy,
    order,
    includeReceipts,
  } = req.query);

  // input validation
  try {
    if (initialMonth !== undefined && !isValidDate(initialMonth, true)) {
      throw new Error(`invalid initialMonth '${initialMonth}'`);
    }
    if (finalMonth !== undefined && !isValidDate(finalMonth, true)) {
      throw new Error(`invalid finalMonth '${finalMonth}'`);
    }
    if (initialValue !== undefined && isNaN(parseFloat(initialValue))) {
      throw new Error(`invalid initialValue '${initialValue}'`);
    }
    if (finalValue !== undefined && isNaN(parseFloat(finalValue))) {
      throw new Error(`invalid finalValue '${finalValue}'`);
    }
    if (hasNif !== undefined && hasNif !== "true" && hasNif !== "false") {
      throw new Error(`invalid hasNif flag '${hasNif}'`);
    }
    if (hasFile !== undefined && hasFile !== "true" && hasFile !== "false") {
      throw new Error(`invalid hasFile flag '${hasFile}'`);
    }
    if (projects !== undefined) {
      if (
        !Array.isArray(JSON.parse(projects)) ||
        !JSON.parse(projects).every((v) => Number.isInteger(parseFloat(v)))
      ) {
        throw new Error(`invalid project id's '${projects}'`);
      }
      if (!(await Project.assertAllExist(pool, JSON.parse(projects)))) {
        throw new Error(`there's at least one bad ID in the array '${projects}'`);
      }
    }
    if (orderBy !== undefined && !(orderBy === "date" || orderBy === "value")) {
      throw new Error(`invalid orderBy '${orderBy}'`);
    }
    if (order !== undefined && !(order === "ASC" || order === "DESC")) {
      throw new Error(`invalid order '${order}'`);
    }
    if (
      includeReceipts !== undefined &&
      includeReceipts !== "true" &&
      includeReceipts !== "false"
    ) {
      throw new Error(`invalid includeReceipts flag '${includeReceipts}'`);
    }
  } catch (err) {
    res.status(400).send("Invalid params");
    logInfo("transactionController/generateReport", error.message, "Validation");
    return;
  }

  // Parse the params
  queryParams = {
    ...queryParams,
    includeReceipts: includeReceipts && JSON.parse(includeReceipts),
    initialValue: initialValue && parseFloat(initialValue),
    finalValue: finalValue && parseFloat(finalValue),
    hasNif: hasNif && JSON.parse(hasNif),
    hasFile: hasFile && JSON.parse(hasFile),
    projects: projects && JSON.parse(projects),
  };

  const transactions = await Transaction.getAll(
    pool,
    undefined,
    undefined,
    queryParams.initialMonth,
    queryParams.finalMonth,
    queryParams.initialValue,
    queryParams.finalValue,
    queryParams.hasNif,
    queryParams.hasFile,
    queryParams.projects,
    undefined,
    queryParams.orderBy,
    queryParams.order,
    undefined,
  );

  // map project id's to their corresponding names to display in the report
  if (queryParams.projects !== undefined)
    queryParams.projects = await Project.getNamesByIds(pool, queryParams.projects);

  const pathToReport = await report(
    transactions,
    queryParams.includeReceipts,
    queryParams,
    req.user.username === "demo",
  );

  res.download(pathToReport, function (err) {
    if (err) {
      res.status(500).send("Report download failed");
      logInfo("transactionController/generateReport", `couldn't download report "${pathToReport}"`); // FIXME
    }

    if (req.user.username === "demo") {
      fs.unlink(pathToReport, (err) => {});
    }
  });
}

module.exports = {
  createTransaction,
  getTransaction,
  downloadReceipt,
  updateTransaction,
  deleteTransaction,
  getAllTransactions,
  generateReport,
};
