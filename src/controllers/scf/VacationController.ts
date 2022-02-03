import { Request, RequestHandler, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { VacationInterface } from '../../interfaces/scf/Vacation';
import moment from 'moment';

class VacationController {
  // LISTA TODOS
  public async index (req: Request, res: Response): Promise<Response> {
    try {
      console.log(req.idUbs)
      let startDay = moment().format("DD-MM-Y");
      const sql = "SELECT f.id, f.ferias as vacation, f.quitacao as discharge, f.periodo_aquisitivo as vestingPeriod, f.quantidade_dias as daysPeriod, CASE WHEN f.data_inicial <= $1 THEN 'true' ELSE 'false' END AS started, to_char(f.data_inicial , 'DD/MM/YYYY') as dateInitial, to_char(f.data_final , 'DD/MM/YYYY') as dateEnd, fu.nome as name, funcao.descricao as occupation FROM ferias f INNER JOIN funcionario fu ON f.id_funcionario = fu.id INNER JOIN funcao ON f.id_funcao = funcao.id where f.data_final >= $2 AND fu.id_ubs = $3 ORDER BY f.data_inicial";
      const { rows } = await poolScp.query(sql, [startDay, startDay, req.idUbs]);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  // LISTA FERIAS E LICENÇAS DE UM USUARIO
  public async listByEmployee (req: Request, res: Response): Promise<Response> {
    try {
      const vacation: VacationInterface = req.body;

      if(!vacation.idEmployee || vacation.idEmployee === undefined) { return res.status(400).json('ID Not Defined!'); }

      const sql = "SELECT f.id, f.ferias as vacation, f.quitacao as discharge, f.periodo_aquisitivo as vestingPeriod, f.quantidade_dias as daysPeriod, to_char(f.data_inicial , 'DD/MM/YYYY') as dateInitial, to_char(f.data_final , 'DD/MM/YYYY') as dateEnd, fu.nome as name, funcao.descricao as occupation, f.autorizado_por as autorizedby FROM ferias f INNER JOIN funcionario fu ON f.id_funcionario = fu.id INNER JOIN funcao ON f.id_funcao = funcao.id WHERE fu.id = $1 AND fu.id_ubs = $2";

      const { rows } = await poolScp.query(sql, [vacation.idEmployee, req.idUbs]);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  // PARA IMPRIMIR
  public async detail (req: Request, res: Response): Promise<Response> {
    try {
      const vacation: VacationInterface = req.body;

      if(!vacation.id || vacation.id === undefined) { return res.status(400).json('ID Not Defined!'); }

      const sql = "SELECT f.id, f.ferias as vacation, f.quitacao as discharge, f.periodo_aquisitivo as vestingPeriod, f.quantidade_dias as daysPeriod, to_char(f.data_inicial , 'DD-MM-YYYY') as dateInitial, to_char(f.data_final , 'DD-MM-YYYY') as dateEnd, f.gerado as created_at, fu.nome as name, fu.numero_carteira as numberct, fu.serie_carteira as seriesct, funcao.descricao as occupation FROM ferias f INNER JOIN funcionario fu ON f.id_funcionario = fu.id INNER JOIN funcao ON f.id_funcao = funcao.id WHERE f.autorizado_por is not null AND f.id = $1 AND fu.id_ubs = $2 limit 1";

      const { rows } = await poolScp.query(sql, [ vacation.id, req.idUbs ]);
      // Cruz Machado, 12 de janeiro de 2022.
      let month = getMonth(moment(rows[0].created_at).month());
      let day = moment(rows[0].created_at).format('D');
      let year = moment(rows[0].created_at).year();

      let returning = rows;
      
      let text = getText(returning[0]);
      
      return res.send({ text, name: rows[0].name, dateNow: `Cruz Machado, ${day} de ${month} de ${year}.`});
    } catch (error) {
      
      return res.status(400).send(error);
    }
  }

  public async store (req: Request, res: Response): Promise<Response> {
    const vacation: VacationInterface = req.body;

    if(vacation.vacation === undefined) { return res.status(400).json('Type Not Defined!'); }
    if(vacation.discharge === undefined) { return res.status(400).json('Discharge Not Defined!'); }
    if(!vacation.vestingPeriod || vacation.vestingPeriod === undefined) { return res.status(400).json('Vesting Period Not Defined!'); }
    if(!vacation.daysPeriod || vacation.daysPeriod === undefined) { return res.status(400).json('Days Period Not Defined!'); }
    if(!vacation.dateInitial || vacation.dateInitial === undefined) { return res.status(400).json('Date Initial Not Defined!'); }
    if(!vacation.idEmployee || vacation.idEmployee === undefined) { return res.status(400).json('ID Employee Not Defined!'); }
    if(!vacation.idOccupation || vacation.idOccupation === undefined) { return res.status(400).json('ID Occupation Not Defined!'); }
    if(!vacation.idSystemUser || vacation.idSystemUser === undefined) { return res.status(400).json('ID System User Not Defined!'); }

    try {

      let dataEnd = moment(vacation.dateInitial, "YYYY-MM-DD").add(vacation.daysPeriod - 1, 'days');
      
      const sql = "INSERT INTO ferias(ferias, quitacao, periodo_aquisitivo, quantidade_dias, id_funcionario, id_funcao, usuario_sistema, data_inicial, data_final)" + 
      " VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id";
      const returning = await poolScp.query(sql, [vacation.vacation, vacation.discharge, vacation.vestingPeriod, vacation.daysPeriod, vacation.idEmployee, vacation.idOccupation, vacation.idSystemUser, vacation.dateInitial, dataEnd]);
  
      return res.json(returning);
    } catch (error) {
      return res.status(400).json(error);
    }

  }

  public async delete (req: Request, res: Response): Promise<Response> {
    const vacation: VacationInterface = req.body;

    if(vacation.id || vacation.id !== undefined) {
      try {
  
        const sql = "DELETE FROM ferias WHERE id = $1";
        const returning = await poolScp.query(sql, [vacation.id]);
  
        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "ID não localizado!" });
  }

}

function getMonth(month: number) {
  if(month === 0) return 'Janeiro';
  if(month === 1) return 'Fevereiro';
  if(month === 2) return 'Março';
  if(month === 3) return 'Abril';
  if(month === 4) return 'Maio';
  if(month === 5) return 'Junho';
  if(month === 6) return 'Julho';
  if(month === 7) return 'Agosto';
  if(month === 8) return 'Setembro';
  if(month === 9) return 'Outubro';
  if(month === 10) return 'Novembro';
  if(month === 11) return 'Dezembro';
}

export default new VacationController();

function getText(data: any) {
  if(data.vacation === true) {
    var preText = `Eu ${data.name} Número: ${data.numberct} Série: ${data.seriesct}, ` +
    `servidor Público desta Municipalidade, exercendo a função de ${data.occupation}, ` +
    "em conformidade com a Lei Complementar nº 001/2006, Capítulo IV. Art 94, venho mui " +
    `respeitosamente requerer ${data.discharge ? 'gozo e quitação' : 'gozo'} das Férias referente ao período aquisitivo ${data.vestingperiod} no ` + 
    `período de ${data.daysperiod} dias a contar do dia ${data.dateinitial.replaceAll('-', '/')} ao ${data.dateend.replaceAll('-', '/')}.`;
  } else {
    var preText = `Eu ${data. name} Número: ${data.numberct} Série: ${data.seriesct}, ` +
    `servidor Público desta Municipalidade, exercendo a função de ${data.occupation}, ` +
    "em conformidade com a Lei Complementar nº 001/2006, Capítulo IV. Art 94, venho mui " +
    `respeitosamente requerer Licença Especial a Título Prêmio referente ao período aquisitivo ${data.vestingperiod} no ` + 
    `período de ${data.daysperiod} dias a contar do dia ${data.dateinitial.replaceAll('-', '/')} ao  ${data.dateend.replaceAll('-', '/')}.`;
  }

  return preText;
}
