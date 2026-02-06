import { db } from "../db/database.js"
import { encode ,decode} from "../utills/base62.js";
import client from "../db/cache.js";
import { normalizeUrl } from "../utills/urlTrim.js";


const CACHE_TLL = 3600



export const urlshort = async(req,res)=>{
    const longUrl = normalizeUrl(req.body.url);

    if(!longUrl){
        return res.status(400).json({message: "Please ensert the URL"})
    }
    const ip = req.ip; //to be removed


    const [result] = await db.query('INSERT INTO shorturl(long_url,ipAddress) VALUES(?,?)', [longUrl,ip]);
     console.log(result.insertId);
     const insertedId = result.insertId;
     const code= encode(insertedId);
     const shorturl = process.env.BASE_URL + code;
    
     try{
        await client.set(`short:${code}`,longUrl,{
            EX:CACHE_TLL
        });

     }catch(err){
        console.warn("Warining Redis set failed");
     }

    const[insert] = await db.query("UPDATE shorturl SET short_code=? WHERE id=?", [code,insertedId])
      
   if(insert){
    return res.status(200).json({message: shorturl})
   }
}


export const getUrl = async(req,res)=> {
    const {id} = req.params;
    const decodedId = decode(id);
  

    try{
       const cachedUrl = await client.get(`short:${id}`);
       
       if(cachedUrl){
        return res.redirect(302,cachedUrl)
       }
       const [result] = await db.query('SELECT long_url FROM shorturl where short_code=?', [id])
       console.log(result)
       if(result.length === 0){
        return  res.status(404).json({message: "URL NOT FOUND"});
       }
      const longUrl = result[0].long_url
       await client.set(`short:${id}`,longUrl,{
        EX: CACHE_TLL
       });

       return res.redirect(302, longUrl)

    }catch(error){
        console.warn("WARNING : "+ error)
    }

//     const idLookUp = url.split('/');
//     console.log("h"+url)
  
//     const decodedId  = decode(idLookUp[1]);
  
//    try{
//     const cachedUrl = await client.get(`short:${process.env.BASE_URL +idLookUp[1]}`);
// //    console.log(cachedUrl+"/")
//     if(cachedUrl){
//       return  res.redirect(302,cachedUrl)
//     }
//     const [result] = await db.query("SELECT long_url from shorturl where id=?",[decodedId]);
//     console.log(result[0].long_url)
//     await client.set(`short:${process.env.BASE_URL +idLookUp[1]}`,result[0].long_url,{
//         EX: CACHE_TLL
//     })
//      return res.redirect(302,result[0].long_url)

//    // console.log(result[0])
//    }
//    catch(err){
//     console.log("Warning? " + err)
//    }

    
}
