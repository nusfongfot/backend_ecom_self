const mysql = require("mysql2");
// const client = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   database: "nus",
// });
//
const client = mysql.createConnection(process.env.DATABASE_URL)


module.exports = client;
