import { Router } from 'express';
import { healthCheck } from './middlewares/health';
import profile from './routes/profile';
import auth from './routes/auth';
import insured from './routes/insured';
import policy from './routes/policy';
import contractor from './routes/contractor';
import file from './routes/file';
import denounce from './routes/denounce';
import cors from 'cors';
import common from './routes/common';
import holding from './routes/holding';
import administration from './routes/administration';
import payroll from './routes/payroll';
import collection from './routes/collection';
import commission from './routes/commission';
import config from '../../config';

export default (): Router => {
  const app: Router = Router();
  app.get('/health', healthCheck);
  app.options(config.cors, cors(), async () => {
    return '';
  });

  profile(app);
  auth(app);
  insured(app);
  policy(app);
  contractor(app);
  file(app);
  denounce(app);
  common(app);
  administration(app);
  holding(app); //TODO: ELIMINAR
  payroll(app);
  collection(app);
  commission(app);
  return app;
};
