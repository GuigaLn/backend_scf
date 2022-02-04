import { Request, Response } from 'express';
import { poolScp } from '../../utils/dbconfig';
import { AddressInterface } from '../../interfaces/scf/Address';

class AddressController {
  public async index(req: Request, res: Response): Promise<Response> {
    try {
      const sql = 'SELECT * FROM endereco';
      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async detail(req: Request, res: Response): Promise<Response> {
    const address: AddressInterface = req.body;
    if (address.idEmployee !== undefined) {
      try {
        const sql = 'SELECT * FROM endereco WHERE id_funcionario = $1';
        const { rows } = await poolScp.query(sql, [address.idEmployee]);
        const returning = rows;

        return res.send(returning);
      } catch (error) {
        return res.status(400).send(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Falta o ID do Funcionário!' });
  }

  public async store(req: Request, res: Response): Promise<Response> {
    if (req.idUbs !== 9) { return res.status(401).send('Access for administrators only'); }

    const address: AddressInterface = req.body;

    if (address.idEmployee !== undefined && address.district && address.street && address.idCity) {
      try {
        if (address.number === undefined) { address.number = 'SN'; }

        const sql = 'INSERT INTO endereco(rua, bairro, numero, complemento, id_cidade, id_funcionario)'
        + 'VALUES($1, $2, $3, $4, $5, $6) returning id';

        const returning = await poolScp.query(sql, [address.street, address.district, address.number, address.complement, address.idCity, address.idEmployee]);

        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Falta de Dados!' });
  }
}

export default new AddressController();
