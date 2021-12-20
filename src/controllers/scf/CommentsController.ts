import { Request, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { CommentsInterface } from '../../interfaces/scf/Comments';

class CommentsController {
  public async index (req: Request, res: Response): Promise<Response> {
    try {

      const sql = "SELECT id, id as idpontoobs, descricao as description FROM ponto_obs WHERE descricao IS NOT null";
      const { rows } = await poolScp.query(sql);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  public async store (req: Request, res: Response): Promise<Response> {
    const comments: CommentsInterface = req.body;

    if(comments.description && comments.description !== undefined) {
      try {
  
        const sql = "INSERT INTO ponto_obs(descricao) VALUES($1) returning id";
        const returning = await poolScp.query(sql, [comments.description]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Descrição não localizada!" });
  }

  public async update (req: Request, res: Response): Promise<Response> {
    const comments: CommentsInterface = req.body;

    if(comments.description && comments.description !== undefined) {
      try {

        const sql = "UPDATE ponto_obs set descricao = $1 WHERE id = $2";
        const returning = await poolScp.query(sql, [comments.description, comments.id]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Descrição ou ID não localizada!" });
  }
  
  public async delete (req: Request, res: Response): Promise<Response> {
    const comments: CommentsInterface = req.body;

    if(comments.id || comments.id !== undefined) {
      try {
  
        const sql = "DELETE FROM ponto_obs WHERE id = $1";
        const returning = await poolScp.query(sql, [comments.id]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "ID não localizado!" });
  }

}

export default new CommentsController();
