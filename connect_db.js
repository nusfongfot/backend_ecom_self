const mysql = require("mysql2");
const client = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "nus",
});

module.exports = client;
