const express = require ('express');
//const card = require('./rfid');
const app = express();
const rc522 = require("rc522");
/*const mysql      = require('mysql');
const connection = mysql.createConnection({
    host    : '168.131.35.102',
    user    : 'innout',
    password: 'ecnv2019',
    database: 'innout_users',
    port    :  43306
});*/
let cardno = '0';

const port = 80;

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log("Server is on (Port "+port+")");
});


//connection.connect();

app.get('/', function (req, res) {
      res.render("main.ejs",{ cardno : cardno } );
});
app.get('/entry', function (req, res) {
    res.render("entry.ejs", { cardno : cardno } ); // 카드 엔트리
});

function setCardNo(num) {
    cardno = num;
}

rc522(function(rfidSerialNumber){
	setCardNo(rfidSerialNumber);
	console.log(cardno);
	setTimeout(setCardNo, 5000, 0);
});
