import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';

import POPsController from '../controllers/scf/POPsController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const popsRouter = Router();

popsRouter.use(ensureAuthenticated);

popsRouter.get('/', POPsController.index);
popsRouter.post('/', multer(uploadConfig).single('file'), POPsController.store);
popsRouter.put('/confirm', POPsController.confirm);
popsRouter.put('/reject', POPsController.reject);

export default popsRouter;
