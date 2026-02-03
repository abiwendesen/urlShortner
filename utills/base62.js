const base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

export const encode = (num)=>{
    let result = "";
    if(num == 0){
        return base62[0];
    }
    while(num>0){
        result = base62[ num%62 ] + result;
        num = Math.floor(num/62)
    }
    return result;
}


export const decode = (str)=>{
 let result = 0;

 for(let char of str){
    result = result*62 + base62.indexOf(char);
 }
 
 return result;
}