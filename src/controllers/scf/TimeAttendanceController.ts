import { Request, response, Response } from 'express';
import moment from 'moment';
import { poolScp } from '../../utils/dbconfig';
import { TimeAttendanceInterface } from '../../interfaces/scf/TimeAttendance';
import { checkPermision } from '../../utils/checkPermision';

class TimeAttendanceController {
  /* FUNÇÃO PARA LISTAR BATIDAS - PERMISSÃO NECESSARIO 2 */
  public async index(req: Request, res: Response): Promise<Response> {
    if (!checkPermision(2, req.userPermissions)) {
      return res.status(403).json({ status: ' Not Permision ' });
    }

    let startDay;
    let endDay;

    if (req.body.startDay && req.body.endDay) {
      startDay = req.body.startDay;
      endDay = req.body.endDay;
    } else {
      startDay = moment().startOf('month');
      endDay = moment().endOf('month');
    }

    try {
      let sql = "SELECT p.id, f.nome as name, to_char(p.data , 'DD-MM-YYYY') as day, p.primeira_entrada as one, p.primeira_saida as oneout, p.segunda_entrada as two, p.segunda_saida as twoout, p.id_funcionario, po.descricao as obs, po.id as idobs, p.validado as valided, f.carga_horaria as workload FROM ponto p inner join funcionario f on f.id = p.id_funcionario inner join ponto_obs po on po.id = p.id_obs WHERE p.id_funcionario = $1 AND p.data >= $2 AND p.data <= $3 AND (f.id_ubs = $4 OR 9 = $5) ORDER BY data asc";

      const { rows } = await poolScp.query(sql, [req.body.id, startDay, endDay, req.idUbs, req.idUbs]);

      if (rows[0] === null || rows[0] === undefined) {
        sql = 'SELECT f.nome FROM funcionario f WHERE id = $1';
        const returning = await poolScp.query(sql, [req.body.id]);

        return res.send({ customer: returning.rows[0].nome });
      }

      return res.send({ times: await getDates(startDay, endDay, req.body.id, rows), customer: rows[0].name });
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  /* FUNÇÃO USADA PARA BATER O PONTO - PERMISSÃO NECESSARIA - NENHUMA */
  public async store(req: Request, res: Response): Promise<Response> {
    const timeAttedance: TimeAttendanceInterface = req.body;
    var sql;
    var name;

    if (timeAttedance.registration !== undefined) {
      try {
        // insert into ponto (data, primeira_entrada, id_funcionario) values ('02/12/2021', '08:00:00', 1)

        sql = 'SELECT p.id, f.nome, p.data, p.primeira_entrada, p.primeira_saida, p.segunda_entrada, p.segunda_saida, p.id_funcionario, p.id_obs FROM ponto p inner join funcionario f on f.id = p.id_funcionario WHERE data = $1 AND matricula = $2 limit 1';

        const { rows } = await poolScp.query(sql, [moment().format('DD/MM/Y'), timeAttedance.registration]);

        if (rows.length > 0) {
          name = rows[0].nome;
          if (rows[0].primeira_entrada === null) {
            sql = 'UPDATE ponto SET primeira_entrada = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `1º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } if (rows[0].primeira_saida === null) {
            sql = 'UPDATE ponto SET primeira_saida = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `1º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } if (rows[0].segunda_entrada === null) {
            sql = 'UPDATE ponto SET segunda_entrada = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `2º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } if (rows[0].segunda_saida === null) {
            sql = 'UPDATE ponto SET segunda_saida = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `2º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          }
          return res.json({ statusCode: 500, name, msg: 'Já Foi Efetuado 4 Registros no Dia de Hoje!' });
        } else {
          sql = 'SELECT f.nome, f.id FROM funcionario f WHERE matricula = $1 limit 1';

          const { rows } = await poolScp.query(sql, [timeAttedance.registration]);

          name = rows[0].nome;
          const { id } = rows[0];

          sql = 'INSERT INTO ponto(data, primeira_entrada, id_funcionario, id_obs) VALUES($1, $2, $3, 1)';
          await poolScp.query(sql, [moment().format('DD/MM/Y'), moment().format('HH:mm:ss'), id]);
          return res.json({ statusCode: 200, name, msg: `1º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
        }
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({ statusCode: 200, msg: 'Falta de Dados!' });
  }

  /* FUNÇÃO PARA LANÇAR ATESTADOS BATIDAS - PERMISSÃO NECESSARIO 2 */
  public async update(req: Request, res: Response): Promise<Response> {
    const timeAttedance: TimeAttendanceInterface = req.body;
    if (timeAttedance.note !== undefined && timeAttedance.note) {
      try {
        let sql;
        if (timeAttedance.id !== undefined && timeAttedance.id) {
          sql = 'UPDATE ponto set id_obs = $1 WHERE id = $2';
          return res.json(await poolScp.query(sql, [timeAttedance.note, timeAttedance.id]));
        }

        if (timeAttedance.idEmployee !== undefined && timeAttedance.idEmployee && timeAttedance.date && timeAttedance.date !== undefined) {
          sql = 'INSERT INTO ponto(data, id_funcionario, id_obs) VALUES($1, $2, $3)';
          return res.json(await poolScp.query(sql, [timeAttedance.date, timeAttedance.idEmployee, timeAttedance.note]));
        }

        return res.status(400).json('Error');
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({ status: '400', msg: 'Descrição ou ID não localizada!' });
  }

  /* FUNÇÃO PARA VALIDAR BATIDAS - PERMISSÃO NECESSARIO 2 */
  public async valided(req: Request, res: Response): Promise<Response> {
    const timeAttedance: TimeAttendanceInterface = req.body;
    try {
      let sql;
      if (timeAttedance.id !== undefined && timeAttedance.id) {
        sql = 'UPDATE ponto set validado = $1 WHERE id = $2';
        return res.json(await poolScp.query(sql, [true, timeAttedance.id]));
      }

      return res.status(400).json('Error');
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}

/* RETONAR LISTA FILTRADA E INCREMENTADA DE BATIDAS */
async function getDates(startDate: any, stopDate: any, idEmployee: any, arrayDb: any) {
  const dateArray = [];
  let currentDate = moment(startDate);
  const endDate = moment(stopDate);
  let finDate = -1;
  // HORAS TRABALHADAS NO MES
  let sumHours = 0;

  let wordkload = 8;
  // TOTAL MINIMO DE HORAS NO MES A FAZER
  let sumWorkload = 0;

  if (arrayDb[0].workload !== undefined && arrayDb[0].workload !== null) {
    wordkload = arrayDb[0].workload;
  }

  while (currentDate <= endDate) {
    finDate = arrayDb.findIndex((obj: any) => obj.day === moment(currentDate).format('DD-MM-YYYY'));

    if (moment(currentDate).weekday() === 1
        || moment(currentDate).weekday() === 2
        || moment(currentDate).weekday() === 3
        || moment(currentDate).weekday() === 4
        || moment(currentDate).weekday() === 5) {
      sumWorkload += 1;
    }

    if (finDate !== -1) {
      // VERIFICA SE É ATESTADO MÉDICO
      if (arrayDb[finDate].idobs === 2 || arrayDb[finDate].idobs === 5 || arrayDb[finDate].valided === true) {
        sumHours += wordkload * 60 * 60;
      }

      let seconds = 0;
      if (arrayDb[finDate].one && arrayDb[finDate].oneout) {
        /* PEGA A DIFERENÇA ENTRE OS HORARIOS EM SEGUNDOS */
        let diff = moment(arrayDb[finDate].oneout, 'HH:mm:ss').diff(moment(arrayDb[finDate].one, 'HH:mm:ss'));
        seconds = moment.duration(diff).asSeconds();
        if (!arrayDb[finDate].two && !arrayDb[finDate].twoout) {
          if (seconds >= wordkload * 60 * 60) {
            const { oneout } = arrayDb[finDate];
            arrayDb[finDate].oneout = '12:00:00';
            arrayDb[finDate].two = '13:00:00';
            arrayDb[finDate].twoout = oneout;

            diff = moment(arrayDb[finDate].oneout, 'HH:mm:ss').diff(moment(arrayDb[finDate].one, 'HH:mm:ss'));
            seconds = moment.duration(diff).asSeconds();
          }
        }

        if (arrayDb[finDate].valided !== true) {
          sumHours += seconds;
        }

        if (arrayDb[finDate].two && arrayDb[finDate].twoout) {
          diff = moment(arrayDb[finDate].twoout, 'HH:mm:ss').diff(moment(arrayDb[finDate].two, 'HH:mm:ss'));
          seconds += moment.duration(diff).asSeconds();

          if (arrayDb[finDate].valided !== true) {
            sumHours += moment.duration(diff).asSeconds();
          }
        }

        if (arrayDb[finDate].two && !arrayDb[finDate].twoout) {
          if (arrayDb[finDate].day !== moment().format('DD-MM-YYYY')) {
            const timeTwo = arrayDb[finDate].two;
            if (timeTwo > '14:30:00') {
              arrayDb[finDate].twoout = timeTwo;
              arrayDb[finDate].two = '13:00:00';
              diff = moment(timeTwo, 'HH:mm:ss').diff(moment('13:00:00', 'HH:mm:ss'));
              seconds += moment.duration(diff).asSeconds();

              if (arrayDb[finDate].valided !== true) {
                sumHours += moment.duration(diff).asSeconds();
              }
            } else {
              arrayDb[finDate].twoout = '17:00:00';
              diff = moment('17:00:00', 'HH:mm:ss').diff(moment(arrayDb[finDate].two, 'HH:mm:ss'));
              seconds += moment.duration(diff).asSeconds();

              if (arrayDb[finDate].valided !== true) {
                sumHours += moment.duration(diff).asSeconds();
              }
            }
          }
        }

        // ATRIBUI O TOTAL DE HORAS DIARIAS
        if (moment(currentDate).weekday() === 6) {
          // SABADO 1.5X
          arrayDb[finDate].sum = seconds === 0 ? 'BATIDA INCORRETA' : hhmmss(seconds * 1.5);
          arrayDb[finDate].valided = true;
          sumHours += seconds / 2;
        } else if (moment(currentDate).weekday() === 0) {
          arrayDb[finDate].sum = seconds === 0 ? 'BATIDA INCORRETA' : hhmmss(seconds * 2);
          arrayDb[finDate].valided = true;
          sumHours += seconds;
        } else {
          arrayDb[finDate].sum = seconds === 0 ? 'BATIDA INCORRETA' : hhmmss(seconds);
        }
      } else {
        arrayDb[finDate].sum = seconds === 0 ? '' : hhmmss(seconds);
      }

      arrayDb[finDate].week = getWeek(moment(currentDate).weekday());
      dateArray.push(arrayDb[finDate]);
    } else {
      dateArray.push(
        {
          day: moment(currentDate).format('DD-MM-YYYY'),
          week: getWeek(moment(currentDate).weekday()),
          one: '-',
          oneout: '-',
          two: '-',
          twoout: '-',
          sum: '-',
          id_funcionario: idEmployee,
          obs: '',
        },
      );
    }
    currentDate = moment(currentDate).add(1, 'days');
  }

  return { list: dateArray, sumHours: hhmmss(sumHours), minWorkTime: sumWorkload * wordkload };
}

/* RETORNA O NOME DO DIA DA SEMANA */
function getWeek(dayWeek: number) {
  if (dayWeek === 0) return 'Dom';
  if (dayWeek === 1) return 'Seg';
  if (dayWeek === 2) return 'Ter';
  if (dayWeek === 3) return 'Qua';
  if (dayWeek === 4) return 'Qui';
  if (dayWeek === 5) return 'Sex';
  if (dayWeek === 6) return 'Sab';
  return 'Error';
}

/* RETORNA O SEGUNDOS EM HH:MM:SS */
function hhmmss(secs: number) {
  let minutes = Math.floor(secs / 60);
  secs %= 60;
  const hours = Math.floor(minutes / 60);
  minutes %= 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(Math.round(secs))}`;
}

/* FORMATA O NUMERO */
function pad(num: any) {
  if (num > 100) {
    return num;
  }
  return (`0${num}`).slice(-2);
}

export default new TimeAttendanceController();
