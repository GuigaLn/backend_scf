import express from 'express';
import cors from 'cors';

import routes from './routes/index';
import { poolTickets, poolScp } from './utils/dbconfig';
import socket from 'socket.io';
import http from 'http';

export const clients : Array<any>  = new Array();

class App {
  
  public app: express.Application;
  public httpServer: http.Server;
  private io: socket.Server;

  public constructor () {
    this.app = express();

    this.middlewares();
    this.database();
    this.routes();
    this.sockets();
    this.listen();
  }

  private middlewares (): void {
    this.app.use(express.json());
    this.app.use(cors());
  }

  private sockets(): void {
    this.httpServer = http.createServer(this.app);
    this.io = new socket.Server (this.httpServer, {
      cors: {
        origin: '*'
      }
    });
  }

  private database (): void {
    poolTickets.connect(function (err: Error, client, done) {
      if(err) {
        console.log("Database Tickets Error!");
      } else {
        console.log('Database Tickets Connected!');
      }
    }); 

    poolScp.connect(function (err: Error, client, done) {
      if(err) {
        console.log("Database SCP Error!");
      } else {
        console.log('Database SCP Connected!');
      }
    }); 
  }

  private routes (): void {
    this.app.use(routes);
  }

  private listen(): void {
    this.io.on('connection', (client) => {
      var sectorId = Number(client.handshake.headers.sectorid); 
      
      /* SE NÃO EXISTIR CLIENTE COM O MESMO SETOR ID, ENTÃO CRIA, SE NÃO DEVOLVE ERRO */
      if(clients[sectorId] === undefined) {
        clients[Number(sectorId)] = {client};
        console.log(`Client connected ${client.handshake.headers.sectorid }`);
        client.emit('sucess', 'Client Connected!');
      } else {
        client.emit("error", "Client has Connected!")
        console.log(`Client Error`);
      }

      client.on('disconnect', () => {
        /* SE DESCONECTAR, VERIFICA SE O ID É O MESMO E REMOVE PELO INDEX */
        if(clients[sectorId] !== undefined && clients[sectorId].client.id === client.id) {
          console.log(`${client.id} Disconnected`);
          clients.splice(clients.indexOf(sectorId), 1);
        } else {
          console.log(`Client Not Connected`);
        }
      });
    });
  }
}

export default new App().httpServer
