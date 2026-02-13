import { decode,encode } from "../utills/base62.js";

describe("Should encode and decode base62",()=>{
    test("should encode 91 to 1t",()=>{
        expect(encode(91)).toBe('1t')
    });

    test("should decode 1t to 91",()=>{
        expect(decode('1t')).toBe(91)
    })

})