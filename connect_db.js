const mysql = require("mysql2");
const host = "0.0.0.0";
const client = mysql.createConnection({
  host: host || "localhost",
  user: "root",
  database: "nus",
});

// const client = mysql.createConnection(process.env.DATABASE_URL)

module.exports = client;
