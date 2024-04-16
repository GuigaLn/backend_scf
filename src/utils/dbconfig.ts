import { Pool } from 'pg';
import { DB_SCF, DB_SENHAS } from '../config/config';

export const poolTickets = new Pool({
  max: 20,
  connectionString: DB_SENHAS,
  idleTimeoutMillis: 30000,
});

export const poolScp = new Pool({
  max: 20,
  connectionString: DB_SCF,
  idleTimeoutMillis: 30000,
});
