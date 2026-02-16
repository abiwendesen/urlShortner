import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { app } from "../app.js";

const arr= ['https://github.com',"https://telegram.com","https://google.com","https://git.com","https://openai.com","https://cisco.com"]
describe("Test the rate limiter",()=>{
    test("Should allow five requests and block the sixth",async()=>{
        for(let i =0; i<5; i++){
            const response = await request(app).post('/short').send(({ url: arr[i]}))
         
            expect(response.status).toBe(201)
        }

      const blockedResponse = await request(app).post('/short').send(({ url: arr[5] } ));
      expect(blockedResponse.status).toBe(StatusCodes.TOO_MANY_REQUESTS);
      expect(blockedResponse.body.message).toBe("Too many requests");


    });

})