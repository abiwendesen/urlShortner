import { app } from "./app.js";


app.listen(process.env.PORT,(req,res)=>{
    console.log("server running")
})
