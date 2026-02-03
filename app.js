import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { db } from './db/database.js';
import urlRoutes from './routes/urlRoutes.js';
import dotenv  from 'dotenv';
const app = express();

dotenv.config()

app.use(bodyParser.json());

const port = 5000;

 app.use('/', urlRoutes)

app.listen(port,(req,res)=>{
    console.log("server running")
})


