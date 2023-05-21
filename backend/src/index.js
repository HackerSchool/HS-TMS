const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(require("./middleware/selectPool"));

app.use("/projects", require("./routes/projectRoutes"));
app.use("/reminders", require("./routes/reminderRoutes"));
app.use("/transactions", require("./routes/transactionRoutes"));
app.use("/users", require("./routes/userRoutes"));

app.get("/health", async (req, res) => {
	res.status(200).send("OK");
});

app.listen(process.env.PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});
