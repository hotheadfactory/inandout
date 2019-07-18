let {PythonShell} = require ('python-shell');
//let cardno = 0;
let pyshell = new PythonShell('Read.py');

exports.entry = function() {
    pyshell.on('message', function(message) {
        console.log("카드번호 "+message);
        return(message);
    });
    /*pyshell.end(function(err, code, signal) {
        if(err) throw (err);
    });*/
};
