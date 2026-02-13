import { app } from '../app'
import request from 'supertest'

describe("Should check valid url",()=>{
   test("should return 400 invalid url",async()=>{
    const response = await request(app).post('/short').send(({url: "no-url"}))
    expect(response.status).toBe(400)
    expect(response.body.message).toMatch('Invalid URL please use the correct format (eg. https://google.com)')
   });
   test("should return 201 valid url",async()=>{
    const response = await request(app).post('/short').send(({url:"https://systemdesignschool.io/problems/url-shortener/solution"}));
    expect(response.status).toBe(201)
    expect(response.body.message).toMatch('http://localhost:5000/1y')
   })
})