var express = require ('express');
var app = express();
const port = 80;

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.render("main.ejs");
});

app.listen(port, () => {
    console.log("Server is on (Port "+port+")");
});