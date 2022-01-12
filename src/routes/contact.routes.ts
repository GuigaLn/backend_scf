import { Router } from 'express';

import ContactController from '../controllers/scf/ContactController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const contactRouter = Router();

contactRouter.use(ensureAuthenticated);

contactRouter.get('/', ContactController.index);
contactRouter.post('/', ContactController.store);
contactRouter.get('/detail', ContactController.detail);

export default contactRouter;