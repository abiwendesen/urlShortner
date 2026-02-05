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
      
   if(insert){
    return res.status(200).json({message: shorturl})
   }
}


export const getUrl = async(req,res)=> {
    const url = req.originalUrl;

    const idLookUp = url.split('/');
    console.log("h"+url)
  
    const decodedId  = decode(idLookUp[1]);
  
   try{
    const cachedUrl = await client.get(`short:${process.env.BASE_URL +idLookUp[1]}`);
   // console.log(cachedUrl)
    if(cachedUrl){
        res.status(302).json({message: cachedUrl})
    }
    const [result] = await db.query("SELECT long_url from shorturl where id=?",[decodedId]);
    
    await client.set(`short:${process.env.BASE_URL +idLookUp[1]}`,result[0].long_url,{
        EX: CACHE_TLL
    })
   // console.log(result[0])
   }
   catch(err){
    console.log("Warning? " + err)
   }

    
}