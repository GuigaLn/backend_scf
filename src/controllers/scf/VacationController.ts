import { Request, Response } from 'express';
import moment from 'moment';
import { VacationInterface } from '../../interfaces/scf/Vacation';
import { checkPermision } from '../../utils/checkPermision';
import { poolScp } from '../../utils/dbconfig';

class VacationController {
  /* FUNÇÃO LISTAR FUNCIONÁRIOS DE FÉRIAS - PERMISSÃO NECESSARIO 4 */
  public async index(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    try {
      const startDay = moment().format('DD-MM-Y');
      const sql = `SELECT f.id, f.ferias as vacation, f.quitacao as discharge, f.periodo_aquisitivo as vestingPeriod, 
      f.quantidade_dias as daysPeriod, CASE WHEN f.data_inicial <= $1 THEN 'true' ELSE 'false' END AS started, 
      to_char(f.data_inicial , 'DD/MM/YYYY') as dateInitial, to_char(f.data_final , 'DD/MM/YYYY') as dateEnd, fu.nome as name, 
      funcao.descricao as occupation, f.autorizado_por as autorizedby, f2.nome as autorizedbyname, f.gozo as enjoyment 
      FROM ferias f INNER JOIN funcionario fu ON f.id_funcionario = fu.id 
      INNER JOIN funcao ON f.id_funcao = funcao.id 
      LEFT JOIN usuario_login ul on ul.id = f.autorizado_por 
      LEFT JOIN funcionario f2 on f2.id = ul.id_funcionario 
      WHERE f.regeitado_por is null AND f.cancelamento_motivo is null AND f.data_final >= $2 
      AND (fu.id_ubs = $3 OR 9 = $4) ORDER BY f.autorizado_por is null ASC, f.data_inicial, f.data_final ASC`;

      const { rows } = await poolScp.query(sql, [startDay, startDay, req.idUbs, req.idUbs]);
      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO LISTAR FÉRIAS POR FUNCIONÁRIO - PERMISSÃO NECESSARIO 4 */
  public async listByEmployee(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    try {
      const vacation: VacationInterface = req.body;

      if (!vacation.idEmployee || vacation.idEmployee === undefined) { return res.status(400).json('ID Not Defined!'); }

      const sql = `SELECT f.id, f.ferias as vacation, f.quitacao as discharge,f.gozo as enjoyment, 
      f.periodo_aquisitivo as vestingPeriod, f.quantidade_dias as daysPeriod, to_char(f.data_inicial , 'DD/MM/YYYY') as dateInitial, 
      to_char(f.data_final , 'DD/MM/YYYY') as dateEnd, fu.nome as name, funcao.descricao as occupation, 
      f.autorizado_por as autorizedby, f2.nome as autorizedbyname, f.regeitado_por as rejectby, 
      f.cancelamento_motivo as cancellationreason FROM ferias f 
      INNER JOIN funcionario fu ON f.id_funcionario = fu.id 
      INNER JOIN funcao ON f.id_funcao = funcao.id 
      LEFT JOIN usuario_login ul on ul.id = f.autorizado_por 
      LEFT JOIN funcionario f2 on f2.id = ul.id_funcionario 
      WHERE fu.id = $1 AND (fu.id_ubs = $2 OR 9 = $3)`;

      const { rows } = await poolScp.query(sql, [vacation.idEmployee, req.idUbs, req.idUbs]);

      const returning = rows;

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO GERAR ARQUIVO FÉRIAS FUNCIONÁRIO - PERMISSÃO NECESSARIO 4 */
  public async detail(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    try {
      const vacation: VacationInterface = req.body;

      if (!vacation.id || vacation.id === undefined) { return res.status(400).json('ID Not Defined!'); }

      const sql = `SELECT f.id, f.ferias as vacation, f.quitacao as discharge, f.gozo as enjoyment, 
      f.periodo_aquisitivo as vestingPeriod, f.quantidade_dias as daysPeriod, to_char(f.data_inicial , 'DD-MM-YYYY') as dateInitial, 
      to_char(f.data_final , 'DD-MM-YYYY') as dateEnd, f.gerado as created_at, fu.nome as name, fu.cpf, fu.numero_carteira as numberct, 
      fu.serie_carteira as seriesct, funcao.descricao as occupation, funcao.id as idoccupation, f.autorizado_por as autorizedby 
      FROM ferias f INNER JOIN funcionario fu ON f.id_funcionario = fu.id 
      INNER JOIN funcao ON f.id_funcao = funcao.id WHERE f.autorizado_por is not null AND f.id = $1 
      AND (fu.id_ubs = $2 OR 9 = $3) limit 1`;

      const { rows } = await poolScp.query(sql, [vacation.id, req.idUbs, req.idUbs]);
      // Cruz Machado, 12 de janeiro de 2022.
      const month = getMonth(moment(rows[0].created_at).month());
      const day = moment(rows[0].created_at).format('D');
      const year = moment(rows[0].created_at).year();

      const returning = rows;

      const text = getText(returning[0]);

      return res.send({
        text, name: rows[0].name, autorizedBy: rows[0].autorizedby, dateNow: `Cruz Machado, ${day} de ${month} de ${year}.`,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO GRAVAR FÉRIAS FUNCIONÁRIO - PERMISSÃO NECESSARIO 4 */
  public async store(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const vacation: VacationInterface = req.body;
    let dataEnd;

    if (vacation.vacation === undefined) { return res.status(400).json('Type Not Defined!'); }
    if (vacation.discharge === undefined) { return res.status(400).json('Discharge Not Defined!'); }
    if (!vacation.vestingPeriod || vacation.vestingPeriod === undefined) { return res.status(400).json('Vesting Period Not Defined!'); }
    if (vacation.daysPeriod === null || vacation.daysPeriod === undefined) { return res.status(400).json('Days Period Not Defined!'); }
    if (!vacation.dateInitial || vacation.dateInitial === undefined) { return res.status(400).json('Date Initial Not Defined!'); }
    if (!vacation.idEmployee || vacation.idEmployee === undefined) { return res.status(400).json('ID Employee Not Defined!'); }
    if (!vacation.idOccupation || vacation.idOccupation === undefined) { return res.status(400).json('ID Occupation Not Defined!'); }

    if (vacation.enjoyment === undefined) { vacation.enjoyment = true; }

    // LICENÇA PRÊMIO SEMPRE TERÁ GOZO E NÃO TERA QUITAÇÃO
    if (vacation.vacation === false) { vacation.enjoyment = true; vacation.discharge = false; }

    try {
      // CASO NÃO POSSUA GOZO, NÃO VAI TER DATA FINAL DEFINIDA
      if (vacation.enjoyment === false) {
        dataEnd = vacation.dateInitial;
        vacation.daysPeriod = 0;
      } else {
        dataEnd = moment(vacation.dateInitial, 'YYYY-MM-DD').add(vacation.daysPeriod - 1, 'days');
      }

      const sql = 'INSERT INTO ferias(ferias, quitacao, gozo, periodo_aquisitivo, quantidade_dias, id_funcionario, id_funcao, gerado_por, data_inicial, data_final)'
      + ' VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id';
      const returning = await poolScp.query(sql, [vacation.vacation, vacation.discharge, vacation.enjoyment, vacation.vestingPeriod, vacation.daysPeriod, vacation.idEmployee, vacation.idOccupation, req.user, vacation.dateInitial, dataEnd]);

      return res.json(returning);
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  /* FUNÇÃO DELETAR FÉRIAS FUNCIONÁRIO - PERMISSÃO NECESSARIO 4 */
  public async delete(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    const vacation: VacationInterface = req.body;

    if (vacation.id || vacation.id !== undefined) {
      try {
        const sql = 'DELETE FROM ferias WHERE id = $1';
        const returning = await poolScp.query(sql, [vacation.id]);

        return res.json(returning);
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'ID não localizado!' });
  }

  /* FUNÇÃO AUTORIZAR FÉRIAS - PERMISSÃO NECESSARIO 1 */
  public async confirm(req: Request, res: Response): Promise<Response> {
    // APENAS - SMS
    if (req.idUbs !== 9 && req.idUbs !== 12) { return res.status(401).send(' Access for administrators only '); }

    if (!checkPermision(5, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    try {
      const vacation: VacationInterface = req.body;

      if (!vacation.id || vacation.id === undefined) { return res.status(400).json('ID Not Defined!'); }

      const sql = 'UPDATE ferias SET autorizado_por = $1 WHERE id = $2 RETURNING id';

      const returning = await poolScp.query(sql, [req.user, vacation.id]);

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO REJEITAR FÉRIAS - PERMISSÃO NECESSARIO 1 */
  public async reject(req: Request, res: Response): Promise<Response> {
    // APENAS - SMS
    if (req.idUbs !== 9) { return res.status(401).send('Access for administrators only'); }

    if (!checkPermision(5, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    try {
      const vacation: VacationInterface = req.body;

      if (!vacation.id || vacation.id === undefined) { return res.status(400).json('ID Not Defined!'); }

      const sql = 'UPDATE ferias SET regeitado_por = $1 WHERE id = $2 RETURNING id';

      const returning = await poolScp.query(sql, [req.user, vacation.id]);

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO REJEITAR CANCELAR - PERMISSÃO NECESSARIO 1 */
  public async cancel(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(4, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    try {
      const vacation: VacationInterface = req.body;

      if (!vacation.id || vacation.id === undefined) { return res.status(400).json('ID Not Defined!'); }
      if (!vacation.cancellationReason || vacation.cancellationReason.length < 5) { return res.status(400).json(' Reason Not Defined!'); }

      const sql = 'UPDATE ferias SET cancelamento_motivo = $1 WHERE id = $2 RETURNING id';

      const returning = await poolScp.query(sql, [vacation.cancellationReason, vacation.id]);

      return res.send(returning);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

/* FUNÇÃO OBTER NOME DO MÊS */
function getMonth(month: number) {
  if (month === 0) return 'Janeiro';
  if (month === 1) return 'Fevereiro';
  if (month === 2) return 'Março';
  if (month === 3) return 'Abril';
  if (month === 4) return 'Maio';
  if (month === 5) return 'Junho';
  if (month === 6) return 'Julho';
  if (month === 7) return 'Agosto';
  if (month === 8) return 'Setembro';
  if (month === 9) return 'Outubro';
  if (month === 10) return 'Novembro';
  if (month === 11) return 'Dezembro';
  return 'Error';
}

/* FUNÇÃO OBTER TEXTO */
function getText(data: any) {
  var preText;
  // VERIFICA SE REQUER GOZO DE FÉRIAS
  if (data.idoccupation === 9) {
    preText = `Eu ${data.name}, `
      + `portador(a) do CPF nº ${data.cpf} , exercendo a função de ${data.occupation}, `
      + `venho mui respeitosamente solicitar férias no  período de ${data.daysperiod} dias `
      + `a contar do dia ${data.dateinitial.replaceAll('-', '/')} ao ${data.dateend.replaceAll('-', '/')}.`;
  } else if (data.enjoyment === true) {
    if (data.vacation === true) {
      preText = `Eu ${data.name}, portador(a) do CPF nº ${data.cpf}, `
      + `servidor Público desta Municipalidade, exercendo a função de ${data.occupation}, `
      + 'em conformidade com a Lei Complementar nº 001/2006, Capítulo IV. Art 94, venho mui '
      + `respeitosamente requerer ${data.discharge ? 'gozo e quitação' : 'gozo'} das Férias referente ao período aquisitivo ${data.vestingperiod} no `
      + `período de ${data.daysperiod} dias a contar do dia ${data.dateinitial.replaceAll('-', '/')} ao ${data.dateend.replaceAll('-', '/')}.`;
    } else {
      preText = `Eu ${data.name}, portador(a) do CPF nº ${data.cpf}, `
      + `servidor Público desta Municipalidade, exercendo a função de ${data.occupation}, `
      + 'em conformidade com a Lei Complementar nº 001/2006, Capítulo IV. Art 94, venho mui '
      + `respeitosamente requerer Licença Especial a Título Prêmio referente ao período aquisitivo ${data.vestingperiod} no `
      + `período de ${data.daysperiod} dias a contar do dia ${data.dateinitial.replaceAll('-', '/')} ao  ${data.dateend.replaceAll('-', '/')}.`;
    }
  } else {
    preText = `Eu ${data.name}, portador(a) do CPF nº ${data.cpf}, `
    + `servidor Público desta Municipalidade, exercendo a função de ${data.occupation}, `
    + 'em conformidade com a Lei Complementar nº 001/2006, Capítulo IV. Art 94, venho mui '
    + `respeitosamente requerer quitação das Férias referente ao período aquisitivo ${data.vestingperiod}.`;
  }

  return preText;
}

export default new VacationController();
