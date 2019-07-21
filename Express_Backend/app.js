var express = require("express");
var path = (path = require("path"));
var bodyParser = require("body-parser");
var mysql = require("mysql");
var jwt = require("jsonwebtoken");

var pool = mysql.createPool({
  connectionLimit: 10,
  host: "168.131.35.102",
  user: "innout",
  password: "innout0512!",
  database: "innoutdb",
  debug: false
});
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "content-type, x-access-token");
  next();
});

//로그인
var successTrue = function(data) {
  //
  return {
    success: true,
    message: null,
    errors: null,
    data: data
  };
};

var successFalse = function(err, message) {
  if (!err && !message) message = "data not found";
  return {
    success: false,
    message: message,
    errors: err ? util.parseError(err) : null,
    data: null
  };
};
app.post("/process/login", function(req, res) {
  console.log("/process/login 호출됨.");
  console.log(req.body);
  var paramId = req.body["id"];
  var paramPassword = req.body["password"];
  var paramType = req.body["type"];

  if (pool) {
    authUser(paramId, paramPassword, paramType, function(err, rows) {
      if (err) {
        throw err;
      }

      if (rows) {
        var id = rows[0][`${paramType}id`];
        console.dir(rows);
        var payload = {
          id: id,
          username: rows[0].username
        };
        var secretOrPrivateKey = "innout";
        jwt.sign(payload, secretOrPrivateKey, function(err, token) {
          if (err) return res.json(successFalse(err));
          res.json(successTrue(token));
          res.end();
        });
      }
    });
  } else {
    res.writeHead("500");
    res.end();
  }
});
// 로그인 처리 함수
var authUser = function(id, password, type, callback) {
  pool.getConnection(function(err, conn) {
    if (err) {
      if (conn) {
        conn.release();
      }
      callback(err, null);
      return;
    }
    console.log("데이어베이스 연결 스레드 아이디 : " + conn.threadId);
    var tablename = type;
    var culumns = [`${type}id`, "username"];
    var exec = conn.query(
      `select ?? from ?? where ${type}id = ? and pin = ?`,
      [culumns, tablename, id, password],
      function(err, rows) {
        conn.release();
        console.log("실행된 SQL : " + exec.sql);
        if (err) {
          callback(err, null);
          return;
        }
        if (rows.length > 0) {
          console.log("사용자 찾음..");
          callback(null, rows);
        } else {
          console.log("사용자 찾지못함");
          callback(null, null);
        }
      }
    );
    conn.on("error", function(err) {
      console.log("데이터베이스 연결 시 에러 발생함.");
      console.dir(err);

      callback(err, null);
    });
  });
};
//member 가입
app.post("/process/join/member", function(req, res) {
  let paramId = req.body.memberid;
  let parampin = req.body.pin;
  let paramName = req.body.username;
  if (pool) {
    joinUser(paramId, parampin, paramName, function(err, result) {
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

const joinUser = function(id, pin, name, callback) {
  pool.getConnection(function(err, conn) {
    if (err) {
      if (conn) {
        conn.release();
      }
      callback(err, null);
      return;
    }
    console.log("데이어베이스 연결 스레드 아이디 : " + conn.threadId);
    const tablename = "member";
    const culumns = ["memberid", "pin", "username"];
    var exec = conn.query(
      `insert into ${tablename}(??) values("${id}","${pin}","${name}")`,
      [culumns],
      function(err, rows) {
        console.log(rows);
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
          console.log("사용자 찾지못함");
          callback(null, null);
        }
      }
    );
    conn.on("error", function(err) {
      console.log("데이터베이스 연결 시 에러 발생함.");
      console.dir(err);

      callback(err, null);
    });
  });
};

app.post("/process/reservation", function(req, res) {
  let paramDate = req.body.date;
  let paramMemberId = req.body.memberid;
  let paramUsername = req.body.username;
  let paramORID = req.body.organizationId;
  let paramORNAME = req.body.organizationName;
  if (pool) {
    reservation(
      paramDate,
      paramMemberId,
      paramUsername,
      paramORID,
      paramORNAME,
      function(err, result) {
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
      }
    );
  }
});

const reservation = function(
  date,
  memberid,
  username,
  organizationId,
  organizationName,
  callback
) {
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
    const culumns = [
      "memberid",
      "username",
      "organizationId",
      "organizationName",
      "intime"
    ];
    let exec = conn.query(
      `insert into ${tablename}(??) values("${memberid}","${username}",${organizationId},"${organizationName}",DATE "${date}")`,
      [culumns],
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
