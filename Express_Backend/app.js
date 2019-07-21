var express = require("express");
var path = (path = require("path"));
var bodyParser = require("body-parser");
var mysql = require("mysql");

var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "1lost5egg!",
  database: "moment",
  debug: false
});
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "content-type, x-access-token"); //1
  next();
});

app.post("/process/adduser", function(req, res) {
  console.log("/process/adduser 호출됨.");

  var paramEmail = req.param("inputEmail");
  var paramName = req.param("name");
  var paramPassword = req.param("inputPassword");
  var paramNick = req.param("Nick");

  if (pool) {
    addUser(paramEmail, paramNick, paramName, paramPassword, function(
      err,
      result
    ) {
      if (err) {
      }

      if (result) {
        console.dir(result);

        console.log("inserted " + result.affectedRows + " rows");

        var insertId = result.name;
        console.log("추가한 레코드의 아이디 : " + insertId);

        res.redirect("/Login/join.html");
        res.end();
      } else {
        res.redirect("/");
        res.end();
      }
    });
  } else {
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.redirect("/");
    res.end();
  }
});
//로그인

app.post("/process/login", function(req, res) {
  console.log("/process/login 호출됨.");

  var paramEmail = req.param("inputEmail");
  var paramPassword = req.param("inputPassword");
  console.log("이미로그인 되어있음");
  if (pool) {
    if (req.session.user) {
      console.log("이미로그인 되어있음");
    } else {
      authUser(paramEmail, paramPassword, function(err, rows) {
        if (err) {
          throw err;
        }

        if (rows) {
          console.dir(rows[0].Nick);

          req.session.user = {
            id: paramEmail,
            pw: paramPassword,
            name: rows[0].Nick,
            authorized: true
          };
          res.redirect("/");
          res.end();
        } else {
          res.redirect("/Login/login.html");
          res.end();
        }
      });
    }
  } else {
    res.writeHead("200", { "Content-Type": "text/html;charset=utf8" });
    res.end();
  }
});

//사용자를 등록하는 함수
var addUser = function(email, Nick, name, password, callback) {
  console.log("addUser 호출됨.");

  // 커넥션 풀에서 연결 객체를 가져옵니다.
  pool.getConnection(function(err, conn) {
    if (err) {
      conn.release(); // 반드시 해제해야 합니다.
      return;
    }
    console.log("데이터베이스 연결 스레드 아이디 : " + conn.threadId);

    // 데이터를 객체로 만듭니다.
    var data = { email: email, name: name, password: password, Nick: Nick };

    // SQL 문을 실행합니다.
    var exec = conn.query("insert into users set ?", data, function(
      err,
      result
    ) {
      conn.release(); // 반드시 해제해야 합니다.
      console.log("실행 대상 SQL : " + exec.sql);

      if (err) {
        console.log("SQL 실행 시 에러 발생함.");
        console.dir(err);

        callback(err, null);

        return;
      }

      callback(null, result);
    });

    conn.on("error", function(err) {
      console.log("데이터베이스 연결 시 에러 발생함.");
      console.dir(err);

      callback(err, null);
    });
  });
};

// 로그인 처리 함수
var authUser = function(email, password, callback) {
  console.log("authUser 호출됨 : " + email + "," + password);

  pool.getConnection(function(err, conn) {
    if (err) {
      if (conn) {
        conn.release();
      }
      callback(err, null);
      return;
    }
    console.log("데이어베이스 연결 스레드 아이디 : " + conn.threadId);
    var tablename = "users";
    var culumns = ["email", "name", "Nick"];
    var exec = conn.query(
      "select ?? from ?? where email = ? and password = ?",
      [culumns, tablename, email, password],
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
