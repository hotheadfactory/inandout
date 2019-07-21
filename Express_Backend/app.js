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

var port = 3000;
app.listen(port, function() {
  console.log("listening on port:" + port);
});
