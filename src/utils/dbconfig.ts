import { Pool } from 'pg';

export const poolTickets = new Pool ({
    max: 20,
    connectionString: 'postgres://postgres:p@ss7469Word@localhost:5432/senhas',
    idleTimeoutMillis: 30000
});

export const poolScp = new Pool ({
    max: 20,
    connectionString: 'postgres://postgres:p@ss7469Word@localhost:5432/scf',
    idleTimeoutMillis: 30000
});
