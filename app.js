"use strict";
const express = require ('express');
const app = express();
const Mfrc522 = require("mfrc522-rpi");
const SoftSPI = require("rpi-softspi");
const beep = require('beepbeep');

/*const mysql      = require('mysql');
const connection = mysql.createConnection({
    host    : '168.131.35.102',
    user    : 'innout',
    password: 'ecnv2019',
    database: 'innout_users',
    port    :  43306
});*/

//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log("scanning...");
console.log("Please put chip or keycard in the antenna inductive zone!");
console.log("Press Ctrl-C to stop.");

const softSPI = new SoftSPI({
  clock: 23, // pin number of SCLK
  mosi: 19, // pin number of MOSI
  miso: 21, // pin number of MISO
  client: 24 // pin number of CS
});

let cardno = '0';
let cardSensed = false;

const port = 80;

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.listen(port, () => {
    console.log("Server is on (Port "+port+")");
});


//connection.connect();


// GPIO 24 can be used for buzzer bin (PIN 18), Reset pin is (PIN 22).
// I believe that channing pattern is better for configuring pins which are optional methods to use.
const mfrc522 = new Mfrc522(softSPI).setResetPin(22).setBuzzerPin(18);

setInterval(function() {
  if (cardSensed == true) {
	  return;
  }
  //# reset card
  mfrc522.reset();

  //# Scan for cards
  let response = mfrc522.findCard();
  if (!response.status) {
    return;
  }
  //console.log("Card detected, CardType: " + response.bitSize);

  //# Get the UID of the card
  response = mfrc522.getUid();
  if (!response.status) {
    console.log("UID Scan Error");
    return;
  }
  //# If we have the UID, continue
  const uid = response.data;
  beep();
  cardno = ('00000000' + uid[0].toString(16)+uid[1].toString(16)+uid[2].toString(16)+uid[3].toString(16)).substr(-8);
  console.log("UID: "+cardno);
  cardSensed = true;
  setTimeout(function() {
    cardno = '0';
    cardSensed = false;
  }, 5000);

  //# Stop
  mfrc522.stopCrypto();
}, 1000);


app.get('/', function (req, res) {
      res.render("main.ejs");
});
app.get('/entry', function (req, res) {
    res.render("entry.ejs", { cardno : cardno } ); // 카드 엔트리
});

