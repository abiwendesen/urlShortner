import { db } from "../db/database.js"
import { encode ,decode} from "../utills/base62.js";

export const urlshort = async(req,res)=>{
    const longUrl = req.body.url;
    const ip = req.ip; //to be removed 
    const [result] = await db.query('INSERT INTO shorturl(long_url,ipAddress) VALUES(?,?)', [longUrl,ip]);
     console.log(result.insertId);
     const base = encode(result.insertId);



    return res.status(200).json({message: process.env.BASE_URL + base})
    
}


export const getUrl = async(req,res)=> {
    const url = req.originalUrl;
    const idLookUp = url.split('/');
    const deco  = decode(idLookUp);
    console.log(deco)
    const [result] = await db.query("SELECT long_url from shorturl where id = ?", [deco]);

    console.log(result[0])
}