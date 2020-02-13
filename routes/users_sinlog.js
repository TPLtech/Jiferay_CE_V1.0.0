var express = require('express');
var app = express.Router();
var mysql = require('mysql');
var dateFormat = require('dateformat');
var Promise = require("promise");
var bcrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');

global.thisServerURL = "www.jiferay.com";

console.log('entrato in /routes/users_sinlog');

var login_mobile = false;



app.post("/postloginV2", function(req, res) { //Senza passport.js
    console.log("postloginV2");

    var mysqlDBconn = mysql.createConnection({
        host: global.mysqlHost,
        port: global.mysqlPort,
        user: global.mysqlUser,
        password: global.mysqlPassword,
        database: global.mysqlDatabase
    });
    var cmdSql = " call sp_tpl_usersGroupMenu_V2('" + req.body.username + "');";
    console.log('cmdSql = ' + cmdSql);

    var promiseCall = new Promise(function(resolveCall, rejecteCall) {

            mysqlDBconn.query(cmdSql, function(err, UserGroup) {
                if (err) {
                    var errDescr = "error in call: " + cmdSql + " . Error: " + err;
                    console.log(errDescr);
                    rejecteCall(errDescr);
                    res.send(errDescr);
                }
                else {
                    console.log('Call:OK');
                    // resolveCall();
                    resolveCall(UserGroup);
                }
            }); //mysql
        })
        .then(function(UserGroup) { //then promiseCall
            mysqlDBconn.end();
            console.log("JSON.stringify(UserGroup): " + JSON.stringify(UserGroup));

            console.log("UserGroup " + JSON.stringify(UserGroup));
            console.log("UserGroup[0] " + JSON.stringify(UserGroup[0]));
            console.log("UserGroup[1] " + JSON.stringify(UserGroup[1]));
            console.log("UserGroup[2] " + JSON.stringify(UserGroup[2]));

            console.log("UserGroup[0].length : " + UserGroup[0].length);

            if (UserGroup[0].length == 0) { //username errato
                console.log("Username errato");
                res.send('Login Fallito');
            }
            else {

                if (!bcrypt.compareSync(req.body.password, UserGroup[0][0].passwordCrittataDB)) { //pwd errata
                    console.log("Password errata");
                    res.send('Login Fallito');
                }
                else {
                    console.log("Login riuscito");
                    //if (UserGroup[1].length() == 1) { // L'utente selezionato ha un solo gruppo
                    res.send(JSON.stringify(UserGroup)); // menu di un gruppo, già tradotto
                    //}
                    //else {
                    //if (UserGroup[2].length() > 1) {
                    // res.send(JSON.stringify(UserGroup)); //lista   menu gruppi già tradotta
                    // }

                    // }
                }
            }
        });
});



app.post('/signupV2', function(req, res) { //Senza passport.js
    console.log('signupV2');
    var mysqlDBconn = mysql.createConnection({
        host: global.mysqlHost,
        port: global.mysqlPort,
        user: global.mysqlUser,
        password: global.mysqlPassword,
        database: global.mysqlDatabase
    });
    console.log("users_passport.js local-signup: " + req.body.username + " " + req.body.password);
    console.log(req.body); //in Ios arrivano in BODY
    console.log(req.query); // In android arrivano in QUERY

    var cmdSql = "SELECT * FROM users WHERE username = '" + req.body.username +
        "' OR email = '" + req.body.email + "';"; //per controllare se esiste gia
    console.log("cmdSql: " + cmdSql);
    mysqlDBconn.query(cmdSql, function(err, rows) {
        if (err) { //errore
            var error = cmdSql + " err: " + err;
            console.log(error);
            res.send(error);
        }
        if (rows.length) { //se esiste gia
            console.log("utente gia esistente");
            var error = " That username is already taken.";

            res.send(error);
        }
        else {
            console.log("creo un nuovo account STANDARD");

            if (req.body.IMEI == "0") {
                console.log("accesso da desktop");
                var newUserMysql = {
                    username: "" + req.body.username + "", //fare test sugli apici 
                    password: bcrypt.hashSync(req.body.password, null, null), // use the generateHash function in our user model
                    email: req.body.email,
                    number: req.body.number,
                    IMEI: req.body.IMEI
                };

            }
            else {
                console.log("accesso da mobile");
                if (Object.keys(req.query).length === 0) {
                    console.log("accesso da IOS");
                    var newUserMysql = {
                        username: req.body.username,
                        password: bcrypt.hashSync(req.body.password, null, null), // use the generateHash function in our user model
                        email: req.body.email,
                        number: req.body.number,
                        IMEI: req.body.IMEI
                    }; //mettere IMEIb
                } //if
                else {
                    console.log("accesso da Android");
                    var newUserMysql = {
                        username: "'" + req.query.username + "'",
                        password: bcrypt.hashSync(req.query.password, null, null), // use the generateHash function in our user model
                        email: req.query.email,
                        number: req.query.number,
                        IMEI: req.query.IMEI
                    }; //mettere IMEIb
                }
            }
            // INSERT INTO users (username, password, email, number, IMEI, flagAuth) VALUES ('Pare','$2a$10$qT7MKdTZI8HJLrG4HCm7fueSrJFA4FfbA/LWLx1pdoFifYV280TRO',alex.pare301@gmail.com,3336991163,undefined,0);
            var cmdSql = "INSERT INTO users (username, password, email, number, IMEI, flagAuth) VALUES (" +

                "'" + newUserMysql.username + "','" + newUserMysql.password + "','" +
                newUserMysql.email + "','" +
                +newUserMysql.number + "','" + newUserMysql.IMEI + "',0);";

            console.log("cmdSql = " + cmdSql);
            mysqlDBconn.query(cmdSql, function(err, rows) { //Search for username
                if (err) {
                    var error = cmdSql + " error: " + err;
                    console.log(error);
                    res.send(error);
                }

            });

            var controlQuery = "SELECT id FROM users WHERE username = '" + newUserMysql.username +
                "';";
            console.log(controlQuery);

            mysqlDBconn.query(controlQuery, function(err, rows) {
                if (err) {
                    var error = controlQuery + " error: " + err;
                    console.log(error);
                    res.send(error);
                }
                else {
                    console.log("rows: " + JSON.stringify(rows));
                    var id = rows[0].id;
                    console.log('id = ' + id);

                    var email = newUserMysql.email;

                    if (email[0] == "'") { //caso in cui la mail è tra apici ''
                        email = email.substr(1, email.length - 2);
                    }

                    console.log("email " + email);
                    console.log("è entrato in app.post(/mailer");

                    var textMail = 'clicca sul link per autenticare l account: ' + global.thisServerURL + '/auth?id=' + id; // necessario inviare ID
                    console.log("textMail = " + textMail);


                    var transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: global.mailer_userMail,
                            pass: global.mailer_userMailPw
                        }
                    });
                    console.log("id2= " + id);
                    var mailOptions = {
                        from: '"Jiferay APP " mail@mail.com',

                        to: email,
                        subject: 'Mail Registrazione ',
                        text: textMail
                    };
                    mysqlDBconn.end();

                    var promisesendMail = new Promise(function(resolvesendMail, rejectsendMail) {
                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log(error);
                                //mysqlDBconn.end();
                                res.send(error);
                                rejectsendMail(error);
                            }
                            else {
                                console.log('Message sent: ' + JSON.stringify(info));
                                resolvesendMail(info);
                            }
                        });

                    }).then(function(rowsSESSIONS) { //qui arriva il rowsSESSIONS
                        // mysqlDBconn.end();
                        console.log("rows = " + JSON.stringify(rows));
                        res.send(rows[0]);
                    }).catch(function(err) {
                        var error = "Promise E-mail error: " + err;
                        console.log(error);
                    });

                } //else provvisorio
            });
        }
    });

});



// =====================================
// LOGOUT ==============================
// =====================================
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('./javascripts/module/homeModule/homeModule.html');
});




// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


module.exports = app;
