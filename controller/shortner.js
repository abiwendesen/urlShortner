import { db } from "../db/database.js"
import { encode ,decode} from "../utills/base62.js";
import client from "../db/cache.js";

const CACHE_TLL = 3600
export const urlshort = async(req,res)=>{
    const longUrl = req.body.url;
    const ip = req.ip; //to be removed

    const [result] = await db.query('INSERT INTO shorturl(long_url,ipAddress) VALUES(?,?)', [longUrl,ip]);
     console.log(result.insertId);
     const insertedId = result.insertId;
     const base = encode(insertedId);
     const shorturl = process.env.BASE_URL + base;
     try{
        await client.set(`short:${shorturl}`,longUrl,{
            EX:CACHE_TLL
        });

     }catch(err){
        console.warn("Warining Redis set failed");
     }

    const[insert] = await db.query("UPDATE shorturl SET short_code=? WHERE id=?", [shorturl,insertedId])
      

    return res.status(200).json({message: shorturl})
    
}


export const getUrl = async(req,res)=> {
    const url = req.originalUrl;
    const idLookUp = url.split('/');
    const decodedId  = decode(idLookUp);
    console.log(decodedId)
    const cachedUrl = await client.get(`short:${process.env.BASE_URL +url}`);

    if(!cachedUrl){
    const [result] = await db.query("SELECT long_url from shorturl where id = ?", [decodedId]);
     const longUrl = result[0].long_url;
        await client.set(`short:${process.env.BASE_URL +url}`,longUrl);
         res.status(302).json({message: result[0]})
        console.log('MISS Wrote on redis')
    }
   

    // console.log(result[0])

    
}