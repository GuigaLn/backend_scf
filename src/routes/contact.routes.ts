import { Router } from 'express';

import ContactController from '../controllers/scf/ContactController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const contactRouter = Router();

contactRouter.use(ensureAuthenticated);

contactRouter.get('/', ContactController.index);
contactRouter.post('/', ContactController.store);
contactRouter.post('/delete', ContactController.delete);
contactRouter.put('/', ContactController.update);

export default contactRouter;
