import { Request, response, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { LoginInterface } from '../../interfaces/scf/Login';
import { compare, hash } from 'bcryptjs';

class AuthenticateController {
  public async login (req: Request, res: Response) {
    const loginReq: LoginInterface = req.body;

    if(loginReq.login !== undefined && loginReq.login && loginReq.password, loginReq.password) {
      try {
        
        var sql = "SELECT id, login, senha FROM usuario_login WHERE login = $1";

        const { rows } = await poolScp.query(sql, [loginReq.login]);
        
        if(rows.length > 0) {
          //compara a senha
          const passwordMatched = await compare(loginReq.password, rows[0].senha);

          if ( !passwordMatched ) {
            return res.status(401).json({status: "401", msg: "Login ou Senha Incorretas!" });
          } 
          rows[0].senha = null;
          return res.json({user: rows[0]});
        }

        return res.status(401).json({status: "401", msg: "Login ou Senha Incorretas!" });
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Falta de Dados!" });
  }

  public async store (req: Request, res: Response) {
    const loginReq: LoginInterface = req.body;

    if(loginReq.login !== undefined && loginReq.login && loginReq.password && loginReq.idEmployee && loginReq.idEmployee !== undefined) {
      try {
        
        var sql = "SELECT id, login, senha FROM usuario_login WHERE login = $1";

        const { rows } = await poolScp.query(sql, [loginReq.login]);
        
        if(rows.length > 0) {
          return res.status(401).json({status: "401", msg: "Login Já Cadastrado!" });
        }

        const hashedPassowrd = await hash(loginReq.password, 8);

        sql = "INSERT INTO usuario_login(login, senha, id_funcionario) VALUES ($1, $2, $3)";

        const returning = await poolScp.query(sql, [loginReq.login, hashedPassowrd, loginReq.idEmployee]);

        return res.json(returning);
      } catch(error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Falta de Dados!" });
  }
  
}


export default new AuthenticateController();