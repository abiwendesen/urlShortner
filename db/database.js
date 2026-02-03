import mysql from "mysql2/promise"
import dotenv from 'dotenv'

dotenv.config()
 const db =  mysql.createPool({
    host:"localhost",
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DBNAME
});

export  {db};