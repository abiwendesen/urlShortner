
export const validateUrl = (req,res,next)=>{
    const url  = req.body.url;
    try{
      new URL(url)
      next();
    }
    catch(err){
        return res.status(400).json({message: "Invalid URL please use the correct format (eg. https://google.com)"})
    }

}