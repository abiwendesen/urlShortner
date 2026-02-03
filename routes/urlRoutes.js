import express from 'express'
import { urlshort,getUrl } from '../controller/shortner.js';

const route = express.Router();

route.post('/short',urlshort);
route.get('/:id',getUrl)

export default route;