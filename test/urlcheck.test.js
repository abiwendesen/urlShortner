import { app } from '../app';
import request from 'supertest';

describe("Should check valid url",()=>{
   test("should return 400 invalid url",async()=>{
    const response = await request(app).post('/short').send(({url: "no-url"}))
    expect(response.status).toBe(400)
    expect(response.body.message).toMatch('Invalid URL please use the correct format (eg. https://google.com)')
   });

  

   test("Should redirect to given url and return 302",async()=>{
      const response = await request(app).get('/1q');
      expect(response.headers.location).toBe("https://systemdesignschool.io/problems/url-shortener/solution")
      expect(response.status).toBe(302);
   });

   test("Should return 404 given incorrect code", async()=>{
      const response = await request(app).get('/1Z');
      expect(response.body.message).toBe("URL NOT FOUND")
      expect(response.status).toBe(404);
   })

})