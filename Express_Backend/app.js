const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const SECRET_KEY = require("./config/secret");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "168.131.35.102",
  user: "innout",
  password: "innout0512!",
  database: "innoutdb",
  debug: false
});
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "content-type, x-access-token");
  next();
});

//로그인
const successTrue = function(data) {
  return {
    success: true,
    message: null,
    errors: null,
    data: data
  };
};

const successFalse = function(err, message) {
  if (!err && !message) message = "data not found";
  return {
    success: false,
    message: message,
    errors: err ? util.parseError(err) : null,
    data: null
  };
};

app.post("/process/login", async function(req, res) {
  const paramId = req.body["id"];
  const paramPassword = req.body["password"];
  const paramType = req.body["type"];
  if (!pool)
    res.status(500).send({ status: 500, message: "데이터베이스에 연결되어 있지 않습니다." });
  try {
    const rows = await authUser(paramId, paramPassword, paramType);
    if (!rows) throw new Error("사용자가 존재하지 않습니다.");
    if (!rows[0]["asigned"]) throw new Error("아직 가입승인이 이루어지지 않았습니다.");
    const payload = {
      id: rows[0][`${paramType}id`],
      username: rows[0].username
    };
    jwt.sign(payload, SECRET_KEY.jwt, { expiresIn: 86400 }, (err, token) => {
      if (err) res.status(200).json(successFalse(err));
      res.status(200).json(successTrue(token));
    });
  } catch (e) {
    res.status(500).send({ status: 500, message: e.message });
  }
});

// 로그인 처리 함수
const authUser = function(id, password, type) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        if (connection) connection.release();
        return reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : ", connection.threadId);
      const tableName = type;
      const culumns = [`${type}id`, "username"];
      const executeSql = connection.query(
        `select ?? from ?? where ${type}id = ? and pin = ?`,
        [culumns, tableName, id, password],
        (err, rows) => {
          console.log(`실행한 sql : ${executeSql.sql}`);
          connection.release();
          if (err) return reject(err);
          if (rows.length > 0) return resolve(rows);
          resolve(null);
        }
      );
    });
  });
};

//member 가입
app.post("/process/join/member", async function(req, res) {
  let paramId = req.body.memberid;
  let parampin = req.body.pin;
  let paramName = req.body.username;
  if (!pool)
    res.status(500).send({ status: 500, message: "데이터베이스에 연결되어 있지 않습니다." });
  try {
    const result = await joinUser(paramId, parampin, paramName);
    res.status(200).send({ status: 200, message: "success" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
});

const joinUser = function(id, pin, name) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        if (connection) connection.release();
        return reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : ", connection.threadId);
      const tableName = "member";
      const culumns = ["memberid", "pin", "username"];
      const executeSql = connection.query(
        `insert into ${tableName}(??) values("${id}","${pin}","${name}")`,
        [culumns],
        (err, rows) => {
          console.log("실행된 sql : ", executeSql.sql);
          connection.release();
          if (err) return reject(err);
          if (rows.affectedRows > 0) return resolve(rows.affectedRows);
        }
      );
    });
  });
};

app.post("/card/reservation", async function(req, res) {
  let paramDate = req.body.date;
  let paramCard = req.body.card;
  let paramMemberid = await findUserByCard(paramCard);
});
const findUserData = memberid => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        if (conn) conn.release();
        reject(err);
      }
      const tablename = "member";
      const culums = ["organizationId", "organizationName"];
      const exec = conn.query(``);
    });
  });
};
const findUserByCard = card => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        if (conn) {
          conn.release();
        }
        reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : " + conn.threadId);
      const tablename = "card";
      const culumns = ["memberid"];
      let exec = conn.query(`select (??) from ${tablename} where ${card}`, [culumns], function(
        err,
        rows
      ) {
        conn.release();
        console.log("실행된 SQL : " + exec.sql);
        if (err) reject(err);
        if (rows.affectedRows > 0) {
          console.log("성공");
          resolve(rows);
        }
        console.log("찾지못함");
        reject(null);
      });
    });
  });
};

app.post("/process/reservation/day", async function(req, res) {
  let paramDate = req.body.date;
  let paramMemberId = req.body.memberid;
  let paramUsername = req.body.username;
  if (!pool)
    res.status(500).send({ status: 500, message: "데이터베이스에 연결되어 있지 않습니다." });
  try {
    const result = await reservationOfDay(paramDate, paramMemberId, paramUsername);
    if (!result) throw new Error("이미 예약이 되어있습니다.");
    res.status(200).send({ status: 200, message: "success" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
});

const reservationOfDay = function(date, memberid, username) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        if (conn) connection.release();
        return reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : ", connection.threadId);
      const tablename = "reservation";
      const culumns = ["memberid", "username", "resday", "resintime"];
      const executeSql = connection.query(
        `insert into ${tablename}(??) values("${memberid}","${username}","${date}","${date} 20:00:00")`,
        [culumns],
        (err, rows) => {
          console.log("실행한 sql : ", executeSql.sql);
          connection.release();
          if (err) return reject(err);
          if (rows.affectedRows > 0) return resolve(rows);
          resolve(null);
        }
      );
    });
  });
};
app.post("/process/reservation/holyday", async function(req, res) {
  let paramDate = req.body.date;
  let paramMemberId = req.body.memberid;
  let paramUsername = req.body.username;
  let paramResInTime = req.body.resintime;
  let paramResOutTime = req.body.resouttime;
  if (!pool)
    res.status(500).send({ status: 500, message: "데이터베이스에 연결되어 있지 않습니다." });
  try {
    const result = await reservationOfHolyday(
      paramDate,
      paramMemberId,
      paramUsername,
      paramResInTime,
      paramResOutTime
    );
    if (!result) throw new Error("이미 예약이 되어있습니다.");
    res.status(200).send({ status: 200, message: "success" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
});

const reservationOfHolyday = function(date, memberid, username, resInTime, resOutTime) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        if (conn) connection.release();
        return reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : ", connection.threadId);
      const tablename = "reservation";
      const culumns = ["memberid", "username", "resday", "resintime", "resouttime"];
      const executeSql = connection.query(
        `insert into ${tablename}(??) values("${memberid}","${username}","${date}","${resInTime}","${resOutTime}")`,
        [culumns],
        (err, rows) => {
          console.log("실행한 sql : ", executeSql.sql);
          connection.release();
          if (err) return reject(err);
          if (rows.affectedRows > 0) return resolve(rows);
          resolve(null);
        }
      );
    });
  });
};

app.post("/process/reservation/out", function(req, res) {
  let paramMemberId = req.body.memberid;
  let paramDate = req.body.date;
  if (pool) {
    outRoom(paramMemberId, paramDate, function(err, result) {
      if (err) {
        console.log("errer", err);
        res.send({
          code: 400,
          success: false
        });
      } else {
        console.log("errer", result);
        res.send({
          code: 200,
          success: true
        });
      }
    });
  }
});

const outRoom = function(memberid, organizationId, callback) {
  pool.getConnection(function(err, conn) {
    if (err) {
      if (conn) {
        conn.release();
      }
      callback(err, null);
      return;
    }
    console.log("데이어베이스 연결 스레드 아이디 : " + conn.threadId);
    const tablename = "reservation";
    let exec = conn.query(
      `update ${tablename} set isout = 1 where isout=0 and memberid= ? and organizationId = ?`,
      [memberid, organizationId],
      function(err, rows) {
        conn.release();
        console.log("실행된 SQL : " + exec.sql);
        if (err) {
          callback(err, null);
          return;
        }
        if (rows.affectedRows > 0) {
          console.log("성공");
          callback(null, rows);
        } else {
          console.log("찾지못함");
          callback(null, null);
        }
      }
    );
  });
};

var port = 3000;
app.listen(port, function() {
  console.log("listening on port:" + port);
});
