const express = require("express");
const loginsql = require("../sql/login.sql.js");
var router = express.Router();
var jwt = require("jsonwebtoken");

//auth/login
router.post("/login/:usertype", async function(req, res, next) {
  var memberid = req.body.memberid;
  var PIN = req.body.PIN;
  var sql = `select * from ${req.params.usertype} where memberid = ${memberid}`;
  loginsql.select(sql, function(err, data) {
    if (err) console.log(err);
    if (data.pin == PIN) {
      var payload = {
        memberid: memberid,
        username: data.username
      };
      var secretOrPrivateKey = process.env.JWT_SECRET;
      jwt.sign(payload, secretOrPrivateKey, options, function(err, token) {
        if (err) return res.json(util.successFalse(err));
        res.json(util.successTrue(token));
      });
    }

    loginsql.pool.end(function(err) {
      if (err) console.log(err);
      else {
        console.log("Connection pool has closed");
        console.log("app.js finished");
      }
    });
  });
});

module.exports = router;
