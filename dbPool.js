require('dotenv').config()
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0
});

// const connection = mysql.createConnection({
//     host: 'ocstaskdb.cgp141nuobar.ap-south-1.rds.amazonaws.com',
//     user: 'root',
//     password: 'qHXrJTOYftK8rZTAuSpP',
//     database: 'usersDB',
// });

// function makeConnection() {
//     connection.connect(err => {
//         if (err) {
//             console.error('Error connecting to the database: ' + err.stack);
//             return;
//         }
//         console.log('Connected to the database as id ' + connection.threadId);
//     });
// }

// function endConnection() {
//     connection.end(err => {
//         if (err) {
//             console.error('Error ending the connection: ' + err.stack);
//             return;
//         }
//         console.log('Connection ended.');
//     });
// }

module.exports = pool 