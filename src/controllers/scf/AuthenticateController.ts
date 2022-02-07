import { Request, response, Response } from 'express';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { poolScp } from '../../utils/dbconfig';
import { LoginInterface } from '../../interfaces/scf/Login';
import authConfig from '../../config/auth';
import { checkPermision } from '../../utils/checkPermision';

class AuthenticateController {
  /* FUNÇÃO DE LOGIN - PERMISSÃO NECESSARIO NENHUMA */
  public async login(req: Request, res: Response) {
    const loginReq: LoginInterface = req.body;
    let token;

    if (loginReq.login !== undefined && loginReq.login && loginReq.password) {
      try {
        let sql = 'SELECT id, login, senha, id_setor, id_unidade_de_saude FROM usuario_login WHERE login = $1';

        const { rows } = await poolScp.query(sql, [loginReq.login.toUpperCase()]);

        if (rows.length > 0) {
          // compara a senha
          const passwordMatched = await compare(loginReq.password, rows[0].senha);

          if (!passwordMatched) {
            return res.status(401).json({ status: '401', msg: 'Login ou Senha Incorretas!' });
          }

          sql = 'SELECT usuario_permisao.permisao_id as permisionid FROM usuario_permisao WHERE usuario_login_id = $1';
          const userPermissions = await poolScp.query(sql, [rows[0].id]);

          token = sign({
            id: rows[0].id, login: rows[0].login, userPermissions: userPermissions.rows, idSector: rows[0].id_setor, idUbs: rows[0].id_unidade_de_saude,
          }, authConfig.jwt.secret, {
            expiresIn: authConfig.jwt.expiresIn,
          });

          rows[0].senha = null;
          rows[0].userPermissions = userPermissions.rows;

          return res.json({ user: rows[0], token });
        }

        return res.status(401).json({ status: '401', msg: 'Login ou Senha Incorretas!' });
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Falta de Dados!' });
  }

  /* FUNÇÃO PARA CADASTRAR USUARIO - PERMISSÃO NECESSARIO 1 */
  public async store(req: Request, res: Response) {
    // APENAS - SMS
    if (req.idUbs !== 9) { return res.status(401).send('Access for administrators only'); }

    if (!checkPermision(1, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const loginReq: LoginInterface = req.body;

    if (loginReq.login !== undefined && loginReq.login && loginReq.password && loginReq.idEmployee && loginReq.idEmployee !== undefined) {
      try {
        let sql = 'SELECT id, login, senha FROM usuario_login WHERE login = $1';

        const { rows } = await poolScp.query(sql, [loginReq.login]);

        if (rows.length > 0) {
          return res.status(401).json({ status: '401', msg: 'Login Já Cadastrado!' });
        }

        const hashedPassowrd = await hash(loginReq.password, 8);

        sql = 'INSERT INTO usuario_login(login, senha, id_funcionario, id_setor, id_unidade_de_saude) VALUES ($1, $2, $3, $4, $5)';

        const returning = await poolScp.query(sql, [loginReq.login, hashedPassowrd, loginReq.idEmployee, 1, 9]);

        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Falta de Dados!' });
  }
}

export default new AuthenticateController();
