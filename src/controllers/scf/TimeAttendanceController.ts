import { Request, response, Response } from 'express';
import moment from 'moment';
import { poolScp } from '../../utils/dbconfig';
import { TimeAttendanceInterface } from '../../interfaces/scf/TimeAttendance';
import { checkPermision } from '../../utils/checkPermision';
import { TOKEN_PONTO } from '../../config/config';

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
      let sql = `SELECT p.id, f.nome as name, to_char(p.data , 'DD-MM-YYYY') as day, p.primeira_entrada as one, 
        p.primeira_saida as oneout, p.segunda_entrada as two, p.segunda_saida as twoout, p.id_funcionario,
        po.descricao as obs, po.id as idobs, p.validado as valided, p.horas as hours, f.carga_horaria as workload,
        p.primeira_entrada, p.primeira_saida, p.segunda_entrada, p.segunda_saida,
        p.terceira_entrada, p.terceira_saida, p.quarta_entrada, p.quarta_saida, p.quinta_entrada, 
        p.quinta_saida, p.sexta_entrada, p.sexta_saida, p.setima_entrada, p.setima_saida, p.oitava_entrada, p.oitava_saida, 
        p.nona_entrada, p.nona_saida, p.decima_entrada, p.decima_saida 
        FROM ponto p inner join funcionario f on f.id = p.id_funcionario inner join ponto_obs po on po.id = p.id_obs 
        WHERE p.id_funcionario = $1 AND p.data >= $2 AND p.data <= $3 AND (f.id_ubs = $4 OR 9 = $5) ORDER BY data asc
      `;

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
    const { access_token: ACCESS_TOKEN } = req.headers;

    if (ACCESS_TOKEN !== TOKEN_PONTO) {
      return res.status(401).json({ statusCode: 401, msg: 'Token não fornecido!' });
    }

    var sql;
    var name;

    if (timeAttedance.registration !== undefined) {
      try {
        // insert into ponto (data, primeira_entrada, id_funcionario) values ('02/12/2021', '08:00:00', 1)

        sql = `
          SELECT p.id, f.nome, p.data, p.primeira_entrada, p.primeira_saida, p.segunda_entrada, p.segunda_saida, 
          p.id_funcionario, p.id_obs, p.terceira_entrada, p.terceira_saida, p.quarta_entrada, p.quarta_saida, p.quinta_entrada, 
          p.quinta_saida, p.sexta_entrada, p.sexta_saida, p.setima_entrada, p.setima_saida, p.oitava_entrada, p.oitava_saida, 
          p.nona_entrada, p.nona_saida, p.decima_entrada, p.decima_saida
          FROM ponto p inner join funcionario f on f.id = p.id_funcionario WHERE data = $1 AND matricula = $2 limit 1;
        `;

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
          } else if (rows[0].terceira_entrada === null) {
            sql = 'UPDATE ponto SET terceira_entrada = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `3º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].terceira_saida === null) {
            sql = 'UPDATE ponto SET terceira_saida = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `3º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].quarta_entrada === null) {
            sql = 'UPDATE ponto SET quarta_entrada = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `4º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].quarta_saida === null) {
            sql = 'UPDATE ponto SET quarta_saida = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `4º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].quinta_entrada === null) {
            sql = 'UPDATE ponto SET quinta_entrada = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `5º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].quinta_saida === null) {
            sql = 'UPDATE ponto SET quinta_saida = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `5º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].sexta_entrada === null) {
            sql = 'UPDATE ponto SET sexta_entrada = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `6º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].sexta_saida === null) {
            sql = 'UPDATE ponto SET sexta_saida = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `6º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].setima_entrada === null) {
            sql = 'UPDATE ponto SET setima_entrada = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `7º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].setima_saida === null) {
            sql = 'UPDATE ponto SET setima_saida = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `7º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].oitava_entrada === null) {
            sql = 'UPDATE ponto SET oitava_entrada = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `8º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].oitava_saida === null) {
            sql = 'UPDATE ponto SET oitava_saida = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `8º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].nona_entrada === null) {
            sql = 'UPDATE ponto SET nona_entrada = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `9º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].nona_saida === null) {
            sql = 'UPDATE ponto SET nona_saida = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `9º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].decima_entrada === null) {
            sql = 'UPDATE ponto SET decima_entrada = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `10º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          } else if (rows[0].decima_saida === null) {
            sql = 'UPDATE ponto SET decima_saida = $1 WHERE id = $2';
            await poolScp.query(sql, [moment().format('HH:mm:ss'), rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `10º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}` });
          }

          return res.json({ statusCode: 500, name, msg: 'Já foi efetuado 10 registros no dia de hoje!' });
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

      if (req.body.one === null || req.body.oneout === null || req.body.two === null || req.body.twoout === null) {
        return res.status(400).json('Falta de Dados');
      }

      if (timeAttedance.id !== undefined && timeAttedance.id && timeAttedance.hours !== undefined && timeAttedance.hours) {
        sql = 'UPDATE ponto set validado = $1, horas = $2, primeira_entrada = $3, primeira_saida = $4, segunda_entrada = $5, segunda_saida = $6 WHERE id = $7';
        return res.json(await poolScp.query(sql, [true, timeAttedance.hours, req.body.one, req.body.oneout, req.body.two, req.body.twoout, timeAttedance.id]));
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
      if (arrayDb[finDate].hours !== null && arrayDb[finDate].idobs !== 2 && arrayDb[finDate].idobs !== 5) {
        sumHours += moment.duration(arrayDb[finDate].hours).asSeconds();
        arrayDb[finDate].sum = arrayDb[finDate].hours;
      } else {
        // VERIFICA SE É ATESTADO MÉDICO
        // eslint-disable-next-line no-lonely-if
        if (arrayDb[finDate].idobs === 2 || arrayDb[finDate].idobs === 5 || arrayDb[finDate].idobs === 11) {
          sumHours += wordkload * 60 * 60;
        } else {
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

            sumHours += seconds;

            if (arrayDb[finDate].two && arrayDb[finDate].twoout) {
              diff = moment(arrayDb[finDate].twoout, 'HH:mm:ss').diff(moment(arrayDb[finDate].two, 'HH:mm:ss'));
              seconds += moment.duration(diff).asSeconds();

              sumHours += moment.duration(diff).asSeconds();
            }

            if (arrayDb[finDate].two && !arrayDb[finDate].twoout) {
              if (arrayDb[finDate].day !== moment().format('DD-MM-YYYY')) {
                const timeTwo = arrayDb[finDate].two;
                if (timeTwo > '14:30:00') {
                  arrayDb[finDate].twoout = timeTwo;
                  arrayDb[finDate].two = '13:00:00';
                  diff = moment(timeTwo, 'HH:mm:ss').diff(moment('13:00:00', 'HH:mm:ss'));
                  seconds += moment.duration(diff).asSeconds();

                  sumHours += moment.duration(diff).asSeconds();
                } else {
                  arrayDb[finDate].twoout = '17:00:00';
                  diff = moment('17:00:00', 'HH:mm:ss').diff(moment(arrayDb[finDate].two, 'HH:mm:ss'));
                  seconds += moment.duration(diff).asSeconds();

                  sumHours += moment.duration(diff).asSeconds();
                }
              }
            }

            // ATRIBUI O TOTAL DE HORAS DIARIAS
            if (moment(currentDate).weekday() === 6) {
              // SABADO 1.5X
              arrayDb[finDate].sum = seconds === 0 ? 'BATIDA INCORRETA' : hhmmss(seconds * 1.5);
              sumHours += seconds / 2;
            } else if (moment(currentDate).weekday() === 0) {
              arrayDb[finDate].sum = seconds === 0 ? 'BATIDA INCORRETA' : hhmmss(seconds * 2);
              sumHours += seconds;
            } else {
              arrayDb[finDate].sum = seconds === 0 ? 'BATIDA INCORRETA' : hhmmss(seconds);
            }
          } else {
            arrayDb[finDate].sum = seconds === 0 ? '' : hhmmss(seconds);
          }
        }
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
