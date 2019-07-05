var express = require("express");
var app = express();

app.get("/", function(req, res) {
  res.send("Hello!!!");
});

app.get("/login", function(req, res) {
  res.redirect("/");
});

var server = app.listen(8081, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});
