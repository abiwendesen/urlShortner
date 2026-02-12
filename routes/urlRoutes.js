import express from 'express'
import { validateUrl } from '../middlewares/urlValidator.js';
import { urlshort,getUrl } from '../controller/shortner.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const route = express.Router();

route.post('/short',validateUrl,rateLimiter,urlshort);
route.get('/:id',getUrl)

export default route;