import express from 'express';
import cors from 'cors';

import routes from './routes/index';
import { poolTickets, poolScp } from './utils/dbconfig';

// eslint-disable-next-line no-array-constructor
export const clients : Array<any> = new Array();

class App {
  public app: express.Application;

  public constructor() {
    this.app = express();

    this.middlewares();
    this.database();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(express.json());
    this.app.use(cors());
  }

  private database(): void {
    poolTickets.connect((err: Error, client, done) => {
      if (err) {
        console.log('Database Tickets Error!');
      } else {
        console.log('Database Tickets Connected!');
      }
    });

    poolScp.connect((err: Error, client, done) => {
      if (err) {
        console.log('Database SCP Error!');
      } else {
        console.log('Database SCP Connected!');
      }
    });
  }

  private routes(): void {
    this.app.use(routes);
  }
}

export default new App().app;
