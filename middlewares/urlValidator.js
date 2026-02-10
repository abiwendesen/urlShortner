
export const validateUrl = (req,res,next)=>{
    const url  = req.body.url;
    try{
      const check = new URL(url)
      if(!check.hostname.includes(".")){
        throw new Error("Host Name must contain TLD  eg., .com")
      }

      next();
    }
    catch(err){
        return res.status(400).json({message: "Invalid URL please use the correct format (eg. https://google.com)"})
    }

}