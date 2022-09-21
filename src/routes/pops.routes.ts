import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';

import POPsController from '../controllers/scf/POPsController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const popsRouter = Router();

popsRouter.get('/', ensureAuthenticated, POPsController.index);
popsRouter.get('/public', POPsController.public);
popsRouter.post('/', ensureAuthenticated, multer(uploadConfig).single('file'), POPsController.store);
popsRouter.put('/confirm', ensureAuthenticated, POPsController.confirm);
popsRouter.put('/reject', ensureAuthenticated, POPsController.reject);

export default popsRouter;
