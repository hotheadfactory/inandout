var express = require ('express');
var app = express();
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host    : '168.131.35.102',
    user    : 'innout',
    password: 'ecnv2019',
    database: 'innout_users',
    port    :  43306
});

const port = 80;

app.use(express.static('public'));

app.listen(port, () => {
    console.log("Server is on (Port "+port+")");
});

connection.connect();

connection.query('SELECT * from test', function(err, rows, fields) {
  if (!err) {
    console.log('The solution is: ', rows);
    app.get('/', (req, res) => {
      res.render("main.ejs");
    });
  }
  else {
  app.get('/', (req, res) => {
    res.render("error.ejs");
  });
  
}
});

connection.end();