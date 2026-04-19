// import mysql from 'mysql2/promise'

// const db = mysql.createPool({
//   host: 'localhost',              // your MySQL host
//   user: 'voteer_user',            // the MySQL user we created
//   password: '7186', // the MySQL password
//   database: 'voteer_management'   // your database name
// })

// export default db



import mysql from 'mysql2/promise'

import { DB_PASSWORD } from './secret.js'


const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

console.log("DB:", process.env.DB_NAME)
export default db


// import mysql from 'mysql2/promise'

// const db = mysql.createPool({
//   host: 'ls-eb67c5d636f96c2bd5a120810f3b9bb70803bd2f.c5s8qokmugr7.ap-south-1.rds.amazonaws.com',
//   user: 'dbmasteruser',
//   password: '-!$bGVHe{C30o#.RoDrMwS+<;F2d`3>u',   // replace with actual password
//   database: 'Voter_manage',    // or voteer_management (use the correct one)
//   port: 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// })

// export default db