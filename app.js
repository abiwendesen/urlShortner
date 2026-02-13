import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { db } from './db/database.js';
import urlRoutes from './routes/urlRoutes.js';
import dotenv  from 'dotenv';
import fs, { access } from 'fs';
import path from 'path';

export const app = express();
const __dirname = import.meta.dirname
dotenv.config()
let accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'})
app.use(morgan('combined', {stream: accessLogStream}))

app.use(bodyParser.json());

const port = 5000;

 app.use('/', urlRoutes)
// Add this AFTER all your routes in app.js
app.use((err, req, res, next) => {
    console.error("EXACT ERROR:", err.stack); // This will print the real error in your terminal
    res.status(500).json({ error: err.message });
});


