import { Request, Response } from 'express';
import { CityInterface } from '../../interfaces/scf/City';
import { ContactInterface } from '../../interfaces/scf/Contact';
import { HistoricMessageInterface } from '../../interfaces/scf/HistoricMessage';
import { checkPermision } from '../../utils/checkPermision';
import { poolScp } from '../../utils/dbconfig';

class ContactController {
  /* FUNÇÃO LISTAR CONTATOS - PERMISSÃO NECESSARIO NENHUMA */
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const sql = 'SELECT id, nome as name, telefone as phone FROM contato ORDER BY nome ASC';
      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO PARA GRAVAR CIDADE - PERMISSÃO NECESSARIO 1 */
  public async store(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(7, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const contact: ContactInterface = req.body;

    if (contact.name !== undefined && contact.phone !== undefined) {
      try {
        const sql = 'INSERT INTO contato(nome, telefone) VALUES($1, $2)';
        const returning = await poolScp.query(sql, [contact.name.toLocaleUpperCase(), contact.phone.replace(/[^0-9]/g, '')]);

        return res.json({ rows: returning.rows });
      } catch (error) {
        return res.status(500).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Nome ou telefone não fornecidos!' });
  }

  /* FUNÇÃO PARA ALTERAR CIDADE - PERMISSÃO NECESSARIO 1 */
  public async update(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(7, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const contact: ContactInterface = req.body;

    if (contact.name !== undefined && contact.id !== undefined && contact.phone) {
      try {
        const sql = 'UPDATE contato SET nome = $1, telefone = $2 WHERE id = $3';
        const returning = await poolScp.query(sql, [contact.name.toLocaleUpperCase(), contact.phone.replace(/[^0-9]/g, ''), contact.id]);

        return res.json(returning);
      } catch (error) {
        return res.status(500).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Nome ou telefone não fornecidos!' });
  }

  /* FUNÇÃO PARA DELETAR CIDADE - PERMISSÃO NECESSARIO 1 */
  public async delete(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(7, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const city: CityInterface = req.body;

    if (city.id && city.id !== undefined) {
      try {
        const sql = 'DELETE FROM cidade WHERE id = $1';
        const returning = await poolScp.query(sql, [city.id]);

        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'ID não localizado!' });
  }

  /* FUNÇÃO PARA ARAMAZENAR O HISTORICO DE MENSAGENS - PERMISSÃO NECESSARIO NENHUMA */
  public async storeHistoricMessage(req: Request, res: Response): Promise<Response> {
    const msg: HistoricMessageInterface = req.body;

    if (msg.message !== undefined && msg.message !== '' && msg.phone !== '' && msg.phone !== undefined) {
      try {
        const sql = 'INSERT INTO historico_mensagens(mensagem, telefone, usuario_login_id) VALUES($1, $2, $3)';
        await poolScp.query(sql, [msg.message, msg.phone, req.user]);

        return res.json('Mensagem armazenada');
      } catch (error) {
        return res.status(500).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Nome ou telefone não fornecidos!' });
  }
}

export default new ContactController();
