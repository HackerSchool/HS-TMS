const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT
});

const app = express();

app.get("/", async (req, res) => {
	res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});
