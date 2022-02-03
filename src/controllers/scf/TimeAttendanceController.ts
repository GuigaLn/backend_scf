import { request, Request, response, Response } from 'express'
import { poolScp } from '../../utils/dbconfig';
import { TimeAttendanceInterface } from '../../interfaces/scf/TimeAttendance';
import moment from 'moment';

class TimeAttendanceController {
  public async index (req: Request, res: Response): Promise<Response> {
    let startDay;
    let endDay;

    if(req.body.startDay && req.body.endDay) {
      startDay = req.body.startDay;
      endDay = req.body.endDay;
    } else {
      startDay = moment().startOf('month');
      endDay = moment().endOf('month');
    }
    
    try {
      var sql = "SELECT p.id, f.nome as name, to_char(p.data , 'DD-MM-YYYY') as day, p.primeira_entrada as one, p.primeira_saida as oneout, p.segunda_entrada as two, p.segunda_saida as twoout, p.id_funcionario, po.descricao as obs FROM ponto p inner join funcionario f on f.id = p.id_funcionario inner join ponto_obs po on po.id = p.id_obs WHERE p.id_funcionario = $1 AND p.data >= $2 AND p.data <= $3 ORDER BY data asc";
     
      const { rows } = await poolScp.query(sql, [req.body.id, startDay, endDay]);

      if(rows[0] === null || rows[0] === undefined) {
 
        sql = "SELECT f.nome FROM funcionario f WHERE id = $1";
        var returning = await poolScp.query(sql, [req.body.id]);

        return res.send({customer: returning.rows[0].nome});
      }

      return res.send({times: getDates(startDay, endDay, req.body.id, rows), customer: rows[0].name});
    } catch (error) {

      return res.status(400).send(error);
    }
  }

  public async store (req: Request, res: Response): Promise<Response> {
    const timeAttedance: TimeAttendanceInterface = req.body;
   
    if(timeAttedance.registration !== undefined) {
      
      try {
        // insert into ponto (data, primeira_entrada, id_funcionario) values ('02/12/2021', '08:00:00', 1)
      
        var sql = "SELECT p.id, f.nome, p.data, p.primeira_entrada, p.primeira_saida, p.segunda_entrada, p.segunda_saida, p.id_funcionario, p.id_obs FROM ponto p inner join funcionario f on f.id = p.id_funcionario WHERE data = $1 AND matricula = $2 limit 1";

        const { rows } = await poolScp.query(sql, [moment().format('DD/MM/Y'), timeAttedance.registration]);
        
        if(rows.length > 0) {
          var name = rows[0].nome;
          if(rows[0].primeira_entrada === null) {
            sql = "UPDATE ponto SET primeira_entrada = $1 WHERE id = $2";
            await poolScp.query(sql, [moment().format('HH:mm:ss'),  rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `1º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}`});
          } else if(rows[0].primeira_saida === null) {
            sql = "UPDATE ponto SET primeira_saida = $1 WHERE id = $2";
            await poolScp.query(sql, [moment().format('HH:mm:ss'),  rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `1º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}`});
          } else if(rows[0].segunda_entrada === null) {
            sql = "UPDATE ponto SET segunda_entrada = $1 WHERE id = $2";
            await poolScp.query(sql, [moment().format('HH:mm:ss'),  rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `2º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}`});
          } else if(rows[0].segunda_saida === null) {
            sql = "UPDATE ponto SET segunda_saida = $1 WHERE id = $2";
            await poolScp.query(sql, [moment().format('HH:mm:ss'),  rows[0].id]);
            return res.json({ statusCode: 200, name, msg: `2º Saída Registrada com Sucesso! ${moment().format('HH:mm:ss')}`});
          } else {
            return res.json({ statusCode: 500, name, msg: "Já Foi Efetuado 4 Registros no Dia de Hoje!"});
          }
        } else {
          var sql = "SELECT f.nome, f.id FROM funcionario f WHERE matricula = $1 limit 1";

          const { rows } = await poolScp.query(sql, [timeAttedance.registration]);

          var name = rows[0].nome;
          var id = rows[0].id

          sql = "INSERT INTO ponto(data, primeira_entrada, id_funcionario, id_obs) VALUES($1, $2, $3, 1)";
          await poolScp.query(sql, [moment().format('DD/MM/Y'), moment().format('HH:mm:ss'), id]);
          return res.json({ statusCode: 200, name, msg: `1º Entrada Registrada com Sucesso! ${moment().format('HH:mm:ss')}`});
        }
      } catch (error) {
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({statusCode: 200, msg: "Falta de Dados!" });
  }
  
  public async update (req: Request, res: Response): Promise<Response> {
    const timeAttedance: TimeAttendanceInterface = req.body;
    if(timeAttedance.note !== undefined && timeAttedance.note) {
      try {
        var sql;
        if(timeAttedance.id !== undefined && timeAttedance.id) {
          sql = "UPDATE ponto set id_obs = $1 WHERE id = $2";
          return res.json(await poolScp.query(sql, [timeAttedance.note, timeAttedance.id]));
        } else {
          
          if(timeAttedance.idEmployee !== undefined && timeAttedance.idEmployee && timeAttedance.date && timeAttedance.date !== undefined) {
            sql = "INSERT INTO ponto(data, id_funcionario, id_obs) VALUES($1, $2, $3)";
            return res.json(await poolScp.query(sql, [timeAttedance.date, timeAttedance.idEmployee, timeAttedance.note]));
          }
        }
        
        return res.status(400).json("Error");
      } catch (error) {console.log(error)
        return res.status(400).json(error);
      }
    }

    return res.status(400).json({status: "400", msg: "Descrição ou ID não localizada!" });
  }
}



function getDates(startDate, stopDate, idEmployee, arrayDb) {
  var dateArray = [];
  var currentDate = moment(startDate);
  var endDate = moment(stopDate);
  let finDate = -1;
  let sumHours = 0;

  while (currentDate <= endDate) {
      finDate = arrayDb.findIndex((obj) => obj.day === moment(currentDate).format('DD-MM-YYYY'));

      if(finDate !== -1) {
        let seconds = 0;

        if(arrayDb[finDate].one && arrayDb[finDate].oneout) {
          /* PEGA A DIFERENÇA ENTRE OS HORARIOS EM SEGUNDOS */
          let diff = moment(arrayDb[finDate].oneout, "HH:mm:ss").diff(moment(arrayDb[finDate].one, "HH:mm:ss"));

          seconds = moment.duration(diff).asSeconds();

          sumHours = sumHours + seconds;

          if(arrayDb[finDate].two && arrayDb[finDate].twoout) {
            diff = moment(arrayDb[finDate].twoout, "HH:mm:ss").diff(moment(arrayDb[finDate].two, "HH:mm:ss"));
            seconds = seconds + moment.duration(diff).asSeconds();

            sumHours = sumHours + moment.duration(diff).asSeconds(); 
          }  

          if(arrayDb[finDate].two && !arrayDb[finDate].twoout) {
            seconds = 0;
          }
        }
        
        arrayDb[finDate].sum = seconds == 0 ? 'BATIDA INCORRETA' : hhmmss(seconds);
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
            obs: ''
          });
      }
      currentDate = moment(currentDate).add(1, 'days');
  }
  
  return {list: dateArray, sumHours: hhmmss(sumHours)};
}

function getWeek(dayWeek: number) {
  if(dayWeek === 0) return 'Dom';
  if(dayWeek === 1) return 'Seg';
  if(dayWeek === 2) return 'Ter';
  if(dayWeek === 3) return 'Qua';
  if(dayWeek === 4) return 'Qui';
  if(dayWeek === 5) return 'Sex';
  if(dayWeek === 6) return 'Sab';
}

function hhmmss(secs) {
  var minutes = Math.floor(secs / 60);
  secs = secs%60;
  var hours = Math.floor(minutes/60)
  minutes = minutes%60;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

function pad(num) {
    if(num > 100) {
      return num;
    }
    return ("0"+num).slice(-2);
}

export default new TimeAttendanceController();
