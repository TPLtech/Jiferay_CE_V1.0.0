var express = require('express');
var app = express.Router();
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var mysql = require('mysql');

console.log('entrato in /routes/users_mailer');



app.get('/mailer', function(req, res) {
    console.log("è entrato in app.get(/mailer");
    var id = req.query.id;
    var email = req.query.email;
    console.log("id= " + id + " email= " + email);
    return ("ok");

});




function generatePsw() { //Funzione per generare password casuale
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
} //Fine generatePsw



app.post('/recuperaPWD', function(req, res) { //Funzione per impostare nuova password e mandare email


    console.log("è entrato in app.post(/recuperaPWD");

    //Connessione a DB
    var mysqlDBconn = mysql.createConnection({
        host: global.mysqlHost,
        port: global.mysqlPort,
        user: global.mysqlUser,
        password: global.mysqlPassword,
        database: global.mysqlDatabase
    });

    //Connessione a mail
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: global.mailer_userMail,
            pass: global.mailer_userMailPw
        }
    });

    var id = req.body.id;
    var email = bcrypt.hashSync(req.body.email, null, null); //Password criptata da inviare
    var newpsw = generatePsw(); //Password casuale

    var cmdSql = "UPDATE users SET tmp_pwd = '" + bcrypt.hashSync(newpsw, null, null) + "' WHERE id = " + id + ";";
    console.log('cmdSql = ' + cmdSql);

    var promiseUpd = new Promise(function(resolveUpd, rejecteUpd) {

            mysqlDBconn.query(cmdSql, function(err) {
                if (err) {
                    var errDescr = "error in update: " + cmdSql + " . Error: " + err;
                    console.log(errDescr);
                    rejecteUpd(errDescr);
                    mysqlDBconn.end();
                    res.send(errDescr);
                }
                else {
                    console.log('Update:OK');
                    resolveUpd();
                }
            }); //mysql
        })
        .then(function() { //then promiseUpd

            mysqlDBconn.end();

            var urlBase = global.thisServerURL + "/ResetPWD";
            var text = 'La tua nuova password è: <h3>' + newpsw + '</h3> <br> Link per cambiare la Password <a href="' + urlBase + '?id=' + id + '&email=' + email + '">Clicca Qui</a>'; // necessario inviare ID
            console.log("text = " + text);

            var mailOptions = { //Contenuto Mail
                from: '"Jiferay APP "' + global.mailer_userMail, // sender address
                to: req.body.email,
                subject: 'Mail Ripristino Password ✔', // Subject line
                html: text
            };


            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);

            });

            res.send("OK eseguito correttamente");

        });



}); //app.post('/mailer'



app.post('/recuperaUser', function(req, res) { //Funzione per recupero username
    
    var email = req.body.email;

    //Connessione a DB
    var mysqlDBconn = mysql.createConnection({
        host: global.mysqlHost,
        port: global.mysqlPort,
        user: global.mysqlUser,
        password: global.mysqlPassword,
        database: global.mysqlDatabase
    });

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: global.mailer_userMail,
            pass: global.mailer_userMailPw
        }
    });

    //Seleziona username dall'email
    var cmdSql = "SELECT username FROM users WHERE email = '" + email + "';";
    console.log('cmdSql = ' + cmdSql);

    //Promise

    var promiseSelect = new Promise(function(resolveSelect, rejecteSelect) {

            mysqlDBconn.query(cmdSql, function(err, response) {
                if (err) {
                    var errDescr = "error in select: " + cmdSql + " . Error: " + err;
                    console.log(errDescr);
                    rejecteSelect(errDescr);
                    mysqlDBconn.end();
                    res.send(errDescr);
                }
                else {
                    console.log('Select:OK');
                    resolveSelect(response);
                }
            }); //mysql
        })
        .then(function(response) { //then promiseSelect

            var username = response[0].username;
            var text = 'Il tuo nome utente è: <h3>' + username + '</h3>';
            console.log("text = " + text);
            
            var mailOptions = {
                from: '"Jiferay APP "' + global.mailer_userMail, // sender address
                to: req.body.email,
                subject: 'Mail Ripristino Password ✔', // Subject line
                html: text
            };

            mysqlDBconn.end();

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);

            });
            //provamailer();
            res.send("OK eseguito correttamente");

        });


});



app.post('/infoMail', function(req, res) {
    console.log("è entrato in app.post(/infoMail");
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: global.mailer_userMail,
            pass: global.mailer_userMailPw
        }
    });

    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails
    // setup e-mail data with unicode symbols


    var mailOptions = {
        from: global.mailer_userMailPw, // sender address
        to: req.body.email,
        subject: req.body.subject, // Subject line
        html: req.body.text
    };
    console.log("text = " + req.body.text);
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);

    });

    //provamailer();

    res.send("OK eseguito correttamente");
}); //app.post('/mailer'



module.exports = app;
