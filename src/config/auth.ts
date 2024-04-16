import { SECRET_KEY } from './config';

export default {
  jwt: {
    secret: SECRET_KEY,
    expiresIn: '3d',
  },
};
