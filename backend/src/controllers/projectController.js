const Project = require("../models/Project");
const { emailLoggerFn, logInfo } = require("../modules/logging");

async function createProject(req, res) {
  const pool = req.pool;
  const { name, active, symbolic } = req.body;

  // input validation
  try {
    if (name === undefined || typeof name !== "string" || name === "") {
      throw new Error(`invalid name '${JSON.stringify(name)}' (${typeof name})`);
    }
    if (active === undefined || typeof active !== "boolean") {
      throw new Error(`invalid active flag '${JSON.stringify(active)}' (${typeof active})`);
    }
    if (symbolic === undefined || typeof symbolic !== "boolean") {
      throw new Error(`invalid symbolic flag '${JSON.stringify(symbolic)}' (${typeof symbolic})`);
    }
    if ((await Project.exists(pool, name)) === true) {
      throw new Error(`duplicate name '${name}'`);
    }
  } catch (error) {
    res.status(400).send("Invalid params");
    logInfo("projectController/createProject", error.message, "Validation");
    return;
  }

  const project = await Project.createOne(pool, name, active, symbolic);
  res.status(201).send(project);

  emailLoggerFn(req.user.name, "Project", req.method, null, project);
}

async function getProject(req, res) {
  const pool = req.pool;
  const { id } = req.params;

  // input validation
  if (!Number.isInteger(parseFloat(id))) {
    // assure id is an integer
    res.status(400).send("Invalid params");
    logInfo("projectController/getProject", `invalid id '${id}'`, "Validation");
    return;
  }

  const project = await Project.getOne(pool, parseInt(id));

  if (project === undefined) return res.status(404).send("Project not found");

  res.status(200).send(project);
}

async function updateProject(req, res) {
  const pool = req.pool;
  const { id } = req.params;
  const { name, active } = req.body;

  // input validation
  try {
    if (!Number.isInteger(parseFloat(id))) {
      throw new Error(`invalid id '${id}'`);
    }
    if (name === undefined || typeof name !== "string" || name === "") {
      throw new Error(`invalid name '${JSON.stringify(name)}' (${typeof name})`);
    }
    if (active === undefined || typeof active !== "boolean") {
      throw new Error(`invalid active flag '${JSON.stringify(active)}' (${typeof active})`);
    }
    if ((await Project.exists(pool, name)) === true) {
      throw new Error(`duplicate name '${name}'`);
    }
  } catch (error) {
    res.status(400).send("Invalid params");
    logInfo("projectController/updateProject", error.message, "Validation");
    return;
  }

  const oldProject = await Project.getOne(pool, parseInt(id));
  const project = await Project.updateOne(pool, parseInt(id), name, active);

  if (project === undefined) return res.status(404).send("Project not found");

  res.status(200).send(project);

  emailLoggerFn(req.user.name, "Project", req.method, oldProject, project);
}

async function deleteProject(req, res) {
  const pool = req.pool;
  const { id } = req.params;

  // input validation
  if (!Number.isInteger(parseFloat(id))) {
    // assure id is an integer
    res.status(400).send("Invalid params");
    logInfo("projectController/deleteProject", `invalid id '${id}'`, "Validation");
    return;
  }

  const deletedProject = await Project.deleteOne(pool, parseInt(id));

  if (deletedProject === undefined) return res.status(404).send("Project not found");

  res.status(204).end();

  emailLoggerFn(req.user.name, "Project", req.method, deletedProject, null);
}

async function getAllProjects(req, res) {
  const pool = req.pool;

  const { initialBalance, finalBalance, active, symbolic, orderBy, order } = req.query;

  // input validation
  try {
    if (initialBalance !== undefined && isNaN(parseFloat(initialBalance))) {
      throw Error(`invalid initialBalance '${initialBalance}'`);
    }
    if (finalBalance !== undefined && isNaN(parseFloat(finalBalance))) {
      throw Error(`invalid finalBalance '${finalBalance}'`);
    }
    if (active !== undefined && active !== "true" && active !== "false") {
      throw Error(`invalid active flag '${active}'`);
    }
    if (symbolic !== undefined && symbolic !== "true" && symbolic !== "false") {
      throw Error(`invalid symbolic flag '${symbolic}'`);
    }
    if (orderBy !== undefined && !(orderBy === "name" || orderBy === "balance")) {
      throw Error(`invalid orderBy '${orderBy}'`);
    }
    if (order !== undefined && !(order === "ASC" || order === "DESC")) {
      throw Error(`invalid order '${order}'`);
    }
  } catch (error) {
    res.status(400).send("Invalid params");
    logInfo("projectController/getAllProjects", error.message, "Validation");
    return;
  }

  res
    .status(200)
    .send(
      await Project.getAll(
        pool,
        initialBalance && parseFloat(initialBalance),
        finalBalance && parseFloat(finalBalance),
        active && JSON.parse(active),
        symbolic && JSON.parse(symbolic),
        orderBy,
        order,
      ),
    );
}

module.exports = {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getAllProjects,
};
