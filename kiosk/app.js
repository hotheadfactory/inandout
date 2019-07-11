let {PythonShell} = require ('python-shell');
const express = require ('express');
const app = express();
/*const mysql      = require('mysql');
const connection = mysql.createConnection({
    host    : '168.131.35.102',
    user    : 'innout',
    password: 'ecnv2019',
    database: 'innout_users',
    port    :  43306
});*/
let cardno = 0;
let pyshell = new PythonShell('Read.py');

const port = 80;

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log("Server is on (Port "+port+")");
});

//connection.connect();

app.get('/', (req, res, err) => {
      console.log(err);
      res.render("main.ejs", cardno); //DB 유지보수중 임시
});

var cardEntry = function (callback) {
    pyshell.on('message', function(message) {
        callback(message);
    });
    pyshell.end(function(err, code, signal) {
        if(err) throw (err);
    });
};

cardEntry(function(cardno) {
   console.log(cardno);
});
