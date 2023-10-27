const mysql = require("mysql2");
// const client = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   database: "nus",
// });

// const client = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   database: process.env.DB_PASS,
// });

const client = mysql.createConnection(process.env.DATABASE_URL)


module.exports = client;
