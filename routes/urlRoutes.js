import express from 'express'
import { validateUrl } from '../middlewares/urlValidator.js';
import { urlshort,getUrl } from '../controller/shortner.js';

const route = express.Router();

route.post('/short',validateUrl,urlshort);
route.get('/:id',getUrl)

export default route;