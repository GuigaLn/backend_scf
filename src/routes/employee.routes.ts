import { Router } from 'express';

import EmployeeController from '../controllers/scf/EmployeeController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const employeeRouter = Router();

employeeRouter.use(ensureAuthenticated);

employeeRouter.get('/', EmployeeController.index);
employeeRouter.post('/', EmployeeController.store);
employeeRouter.put('/', EmployeeController.update);
employeeRouter.get('/shortlist', EmployeeController.shortList);
employeeRouter.get('/detail', EmployeeController.detail);

export default employeeRouter;