import { Request, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { CityInterface } from '../../interfaces/scf/City';

class CityController {
  public async index (req: Request, res: Response): Promise<Response> {
    try {

      const sql = "SELECT id, id as idCity, descricao as description FROM cidade ORDER BY descricao ASC";
      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async store (req: Request, res: Response): Promise<Response> {
    if(req.idUbs !== 9) { return res.status(401).send('Access for administrators only') };

    const city: CityInterface = req.body;

    if(city.description !== null && city.description !== undefined && city.description) {
      try {
        console.log(city.description)
        const sql = "INSERT INTO cidade(descricao) VALUES($1) returning id";
        const returning = await poolScp.query(sql, [city.description]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Descrição não localizada!" });
  }

  public async update (req: Request, res: Response): Promise<Response> {
    if(req.idUbs !== 9) { return res.status(401).send('Access for administrators only') };

    const city: CityInterface = req.body;

    if(city.description !== undefined && city.id !== undefined && city.id && city.description) {
      try {
  
        const sql = "UPDATE cidade set descricao = $1 WHERE id = $2";
        const returning = await poolScp.query(sql, [city.description, city.id]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Descrição ou Id não localizado!" });
  }

  public async delete (req: Request, res: Response): Promise<Response> {
    if(req.idUbs !== 9) { return res.status(401).send('Access for administrators only') };

    const city: CityInterface = req.body;

    if(city.id && city.id !== undefined) {
      try {
  
        const sql = "DELETE FROM cidade WHERE id = $1";
        const returning = await poolScp.query(sql, [city.id]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "ID não localizado!" });
  }
  
}


export default new CityController();
