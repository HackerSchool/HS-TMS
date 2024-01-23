const express = require("express");
const { asyncHandler } = require("../middleware/error");
const { readLogFile } = require("../utils/fileUtils");
const { demoUserRestriction } = require("../middleware/demoUserRestriction");

const router = express.Router();
router.use(demoUserRestriction);

router.get(
  "/combined",
  asyncHandler(async (req, res) => {
    res.status(200).send(await readLogFile(__dirname + "/../../storage/logs/combined.log"));
  }),
);

router.get(
  "/error",
  asyncHandler(async (req, res) => {
    res.status(200).send(await readLogFile(__dirname + "/../../storage/logs/error.log"));
  }),
);

module.exports = router;
