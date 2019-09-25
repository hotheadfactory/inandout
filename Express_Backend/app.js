const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
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
app.use(cookieParser());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "content-type, x-access-token");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/token", function(req, res) {
  const token = req.query.token;
  if (!token) res.status(401).send("Unauthorized: No token provided");
  jwt.verify(token, SECRET_KEY.jwt, function(err, decoded) {
    if (err) res.status(401).send("Unauthorized: Invalid token");
    res.status(200).send({ memberid: decoded.id, username: decoded.username });
  });
});

app.post("/process/reservation/user", isLogined, async function(req, res) {
  const data = req.body.payload;
  const memberid = data.id;
  const date = req.body.date;
  try {
    if (!pool) throw new Error("error");
    const result = await findReservationByUser(memberid, date);
    if (result.length > 0)
      res.status(200).send({ isBooked: true, data: result });
    res.status(200).send({ isBooked: false, data: null });
  } catch (e) {
    const code = e.code || 500;
    res.status(code).send({ isBooked: null, message: e.message });
  }
});

const findReservationByUser = function(id, date) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        if (connection) connection.release();
        return reject({ code: 500, message: err.message });
      }
      const executeSql = connection.query(
        `select * from reservation where memberid = "${id}" and resday = "${date}"`,
        (err, rows) => {
          console.log("실행한 sql : ", executeSql.sql);
          console.log(rows);
          connection.release();
          if (err) return reject({ code: 400, message: err.message });
          resolve(rows);
        }
      );
    });
  });
};

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
    res
      .status(500)
      .send({ status: 500, message: "데이터베이스에 연결되어 있지 않습니다." });
  try {
    const rows = await authUser(paramId, paramPassword, paramType);
    if (!rows) throw new Error("사용자가 존재하지 않습니다.");
    if (!rows[0]["asigned"])
      throw new Error("아직 가입승인이 이루어지지 않았습니다.");
    const payload = {
      id: rows[0][`${paramType}id`],
      username: rows[0].username
    };
    jwt.sign(
      payload,
      SECRET_KEY.jwt,
      { expiresIn: 60 * 60 * 24 },
      (err, token) => {
        if (err) res.status(200).json(successFalse(err));
        res.cookie("token", token, { maxAge: 60 * 60 * 24 * 1000 });
        res.status(200).json(successTrue(token));
      }
    );
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
      const culumns = [`${type}id`, "username", "asigned"];
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
    res
      .status(500)
      .send({ status: 500, message: "데이터베이스에 연결되어 있지 않습니다." });
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

app.post("/process/card/login", async function(req, res) {
  let paramCardNumber = req.body.cardnumber;
  if (!pool)
    res
      .status(500)
      .send({ status: 500, message: "데이터베이스에 연결되어 있지 않습니다." });
  try {
    const result1 = await findMemberid(paramCardNumber);
    if (!result1) throw new Error("등록되지 않은 카드입니다.");
    const memberid = result1[0]["memberid"];
    const result2 = await findUsername(memberid);
    if (!result2) throw new Error("일치하는 회원정보가 존재하지 않습니다.");
    if (!result2[0]["asigned"])
      throw new Error("아직 승인되지 않은 회원입니다.");
    const username = result2[0]["username"];
    const payload = {
      id: memberid,
      username: username
    };
    jwt.sign(
      payload,
      SECRET_KEY.jwt,
      { expiresIn: 60 * 60 * 24 },
      (err, token) => {
        if (err) res.status(200).json(successFalse(err));
        res.cookie("token", token, {
          maxAge: 60 * 60 * 24 * 1000,
          httpOnly: false
        });
        res.status(200).json(successTrue(token));
      }
    );
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
});

const findMemberid = function(cardnumber) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        if (connection) connection.release();
        return reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : ", connection.threadId);
      const tableName = "card";
      const executeSql = connection.query(
        `select memberid from ${tableName} where cardnumber="${cardnumber}"`,
        (err, rows) => {
          console.log("실행된 sql : ", executeSql.sql);
          connection.release();
          if (err) return reject(err);
          if (rows.length > 0) return resolve(rows);
          resolve(null);
        }
      );
    });
  });
};

const findUsername = function(memberid) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        if (connection) connection.release();
        return reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : ", connection.threadId);
      const tableName = "member";
      const executeSql = connection.query(
        `select username, asigned from ${tableName} where memberid="${memberid}"`,
        (err, rows) => {
          console.log("실행된 sql : ", executeSql.sql);
          connection.release();
          if (err) return reject(err);
          if (rows.length > 0) return resolve(rows);
          resolve(null);
        }
      );
    });
  });
};

app.post("/process/logout", isLogined, function(req, res) {
  if (req.cookies.token) {
    res.clearCookie("token");
    res.status(200).send({ status: 200, message: "success" });
  }
  res.status(400).send({ status: 400, message: "fail" });
});

app.post("/process/card/register", isLogined, async function(req, res) {
  const data = req.body.payload;
  let paramMemberId = data.id;
  let paramCardNumber = req.body.cardnumber;
  if (!pool)
    res
      .status(500)
      .send({ status: 500, message: "데이터베이스에 연결되어 있지 않습니다." });
  try {
    const result = await registCard(paramMemberId, paramCardNumber);
    if (!result) throw new Error("이미 등록된 카드입니다.");
    res.status(200).send({ status: 200, message: "success" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
});

const registCard = function(memberid, cardnumber) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        if (connection) connection.release();
        return reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : ", connection.threadId);
      const tableName = "card";
      const culumns = ["memberid", "cardnumber"];
      const executeSql = connection.query(
        `insert into ${tableName}(??) values("${memberid}","${cardnumber}")`,
        [culumns],
        (err, rows) => {
          console.log("실행된 sql : ", executeSql.sql);
          connection.release();
          if (err) return reject(err);
          if (rows.affectedRows > 0) return resolve(rows);
          resolve(null);
        }
      );
    });
  });
};

function isLogined(req, res, next) {
  const token =
    req.headers["x-access-token"] ||
    req.query.token ||
    req.body.token ||
    req.cookies.token;
  console.log(token);
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "not logged in"
    });
  }
  jwt.verify(token, SECRET_KEY.jwt, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(403).json({
        success: false,
        message: "만료"
      });
    }
    req.body.payload = decoded;
    next();
  });
}

app.post("/process/reservation/day", isLogined, async function(req, res) {
  let paramDate = req.body.date;
  let paramOptions = req.body.option;
  const data = req.body.payload;
  let paramMemberId = data.id;
  let paramUsername = data.username;

  if (!pool)
    res
      .status(500)
      .send({ status: 500, message: "데이터베이스에 연결되어 있지 않습니다." });
  try {
    const result = await reservationOfDay(
      paramDate,
      paramMemberId,
      paramUsername,
      paramOptions
    );
    if (!result) throw new Error("이미 예약이 되어있습니다.");
    res.status(200).send({ status: 200, message: "success" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
});

const reservationOfDay = function(date, memberid, username, options) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        if (conn) connection.release();
        return reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : ", connection.threadId);
      const tablename = "reservation";
      const culumns = [
        "memberid",
        "username",
        "resday",
        "resintime",
        "options"
      ];
      const executeSql = connection.query(
        `insert into ${tablename}(??) values("${memberid}","${username}","${date}","${date} 20:00:00","${options}")`,
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
app.post("/process/reservation/holyday", isLogined, async function(req, res) {
  let paramDate = req.body.date;
  let paramOptions = req.body.option;
  const data = req.body.payload;
  let paramMemberId = data.id;
  let paramUsername = data.username;
  let paramResInTime = req.body.resintime;
  if (!pool)
    res
      .status(500)
      .send({ status: 500, message: "데이터베이스에 연결되어 있지 않습니다." });
  try {
    const result = await reservationOfHolyday(
      paramDate,
      paramMemberId,
      paramUsername,
      paramResInTime,
      paramOptions
    );
    if (!result) throw new Error("이미 예약이 되어있습니다.");
    res.status(200).send({ status: 200, message: "success" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
});

const reservationOfHolyday = function(
  date,
  memberid,
  username,
  resInTime,
  options
) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        if (conn) connection.release();
        return reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : ", connection.threadId);
      const tablename = "reservation";
      const culumns = [
        "memberid",
        "username",
        "resday",
        "resintime",
        "options"
      ];
      const executeSql = connection.query(
        `insert into ${tablename}(??) values("${memberid}","${username}","${date}","${date} ${resInTime}","${options}")`,
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

app.post("/process/reservation/out", isLogined, async function(req, res) {
  const data = req.body.payload;
  let paramMemberId = data.id;
  let paramDate = req.body.date;
  if (!pool)
    res
      .status(500)
      .send({ status: 500, message: "데이터베이스에 문제가 있습니다." });
  try {
    const result = await outRoom(paramDate, paramMemberId);
    if (!result) throw new Error("퇴실가능한 예약이 존재하지 않습니다.");
    res.status(200).send({ status: 200, message: "success" });
  } catch (e) {
    res.status(400).send({ status: 400, message: e.message });
  }
});

const outRoom = function(date, memberid) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        if (connection) connection.release();
        return reject(err);
      }
      console.log("데이어베이스 연결 스레드 아이디 : ", connection.threadId);
      const tablename = "reservation";
      let executeSql = connection.query(
        `update ${tablename} set isout = 1 where isout=0 and memberid=? and resday=?`,
        [memberid, date],
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

var port = 3000;
app.listen(port, function() {
  console.log("listening on port:" + port);
});
