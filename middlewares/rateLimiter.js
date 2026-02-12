import client from "../db/cache.js";
import { StatusCodes } from "http-status-codes";

const max_requests = 10;
const mx_window = 60;
export async function rateLimiter(req,res,next){
    const key = `rate:${req.ip}`;
    const request = await client.incr(key);
    if(request === 1){
        await client.expire(key,mx_window)
    }

    if(request > max_requests){
        return res.status(StatusCodes.TOO_MANY_REQUESTS).json({message: "Too many requests"})
    }

    return next();
    
}