var express = require('express');
var app = express.Router();
var mysql = require('mysql');
var Promise = require("promise");
var bcrypt = require('bcrypt-nodejs');

console.log('entrato in /routes/users_mysql');

global.mysqlHost = 'localhost';
global.mysqlPort = '3306';
global.mysqlUser = 'user';
global.mysqlPassword = 'password';
global.mysqlDatabase = 'jiferay';



//authorizzazione da mail dopo signup
app.get('/auth', function(req, response) {
    var id = req.query.id;
    console.log("sono nella GET / auth per l'autenticazione" + id);

    var mysqlDBconn = mysql.createConnection({
        host: global.mysqlHost,
        port: global.mysqlPort,
        user: global.mysqlUser,
        password: global.mysqlPassword,
        database: global.mysqlDatabase
    });

    var cmdSql = "SELECT * FROM users WHERE id =" + id + ";";
    console.log(cmdSql);

    //var promiseAuth = new Promise(function(resolveAuth, rejecteAuth) {
    mysqlDBconn.query(cmdSql, function(err, res) {
        if (err) {
            console.log(err);
            return ("errore :" + err);
        }
        else {
            console.log("res.body auth =" + JSON.stringify(res));


            if (res[0].flagAuth == 1) {
                response.send('profilo gia autenticato, , <a href="/#/">clicca qui</a> per tornare al sito');
            }

            cmdSql = "UPDATE users SET flagAuth = 1 WHERE id =" + id;
            console.log("cmdSql" + cmdSql);

            var promiseUpdateAuth = new Promise(function(resolveUpdateAuth, rejecteUpdateAuth) {
                    mysqlDBconn.query(cmdSql, function(err, res) {
                        if (err) {
                            console.log(err);
                            rejecteUpdateAuth(err);
                            return (err);
                        }
                        else {
                            console.log("account autenticato" + id);

                            //insert user to registedUser GROUP
                            var cmdSql = 'INSERT INTO usergroups (id_user,id_group) VALUES (' + id + ',8) ;'; //8 = 
                            mysqlDBconn.query(cmdSql, function(err, res) {
                                if (err) {
                                    console.log("errore addUserGroup:  " + err);
                                    return (err);
                                }
                                else {
                                    console.log('addUserGroup');
                                    resolveUpdateAuth("ciao");
                                }
                            });
                        }
                    });

                })
                .then(function(ciao) { //then promiseUpdateAuth  
                    mysqlDBconn.end();
                    console.log("rispondo con conferma");
                    response.send('Profilo autenticato, <a href="/#/">clicca qui</a> per tornare al sito');
                }); //then promiseUpdateAuth

        }
    });

});



//cambio pw da parte utente da loggato
app.post('/userUpdatePsw', function(req, res) {

    var cmdSql = "SELECT * FROM users WHERE username ='" + req.body.param0 + "';";

    var mysqlDBconn = mysql.createConnection({
        host: global.mysqlHost,
        port: global.mysqlPort,
        user: global.mysqlUser,
        password: global.mysqlPassword,
        database: global.mysqlDatabase
    });
    mysqlDBconn.query(cmdSql, function(err, rows) {
        if (err) {
            console.log(err);
            mysqlDBconn.end();
            return (err);
        }
        else {

            if (bcrypt.compareSync(req.body.param1, rows[0].password)) {

                console.log("OK cambio PW")
                var PWcrypt = bcrypt.hashSync(req.body.param2, null, null);
                var cmdSql = "UPDATE users SET password='" + PWcrypt + "' WHERE username='" + req.body.param0 + "';";

                var promiseUpdate = new Promise(function(resolveUpdate, rejecteUpdate) {

                        mysqlDBconn.query(cmdSql, function(err, rows) {
                            if (err) {
                                var errDescr = "error in update: " + req.body.param2 + " . Error: " + err;
                                console.log(errDescr);
                                rejecteUpdate(errDescr);
                                // res.send(errDescr);
                            }
                            else {
                                console.log("update:OK");
                                resolveUpdate(cmdSql);
                            }
                        });
                    })
                    .then(function(cmdSql) { //then promiseUpdate
                        mysqlDBconn.end();
                        res.send("OK." + cmdSql + "eseguito correttamente");
                    }); //then promiseUpdate
            }
            else {
                console.log("errore nela password");
                mysqlDBconn.end();
                res.send("errore nela password");
            }
        }
    });
});



//procedura forgot pw, ritorno da mail
app.get('/ResetPW', function(req, res) {
    var email = req.query.email;
    console.log("sono nella GET / ResetPW per password Persa");
    var cmdSql = "SELECT * FROM users WHERE email ='" + email + "';";

    var mysqlDBconn = mysql.createConnection({
        host: global.mysqlHost,
        port: global.mysqlPort,
        user: global.mysqlUser,
        password: global.mysqlPassword,
        database: global.mysqlDatabase
    });

    mysqlDBconn.query(cmdSql, function(err, res) {
        if (err) {
            console.log(err);
            return (err);
        }
        else {
            console.log("res.body auth =" + JSON.stringify(res));

            if (res.flagChangePW == 0) {
                mysqlDBconn.end();
                res.send('La richiesta è scaduta, <a href="/#/">clicca qui</a> per tornare al sito');
            }
            else {

                var pwCrypt = bcrypt.hashSync(1234, null, null);
                cmdSql = "UPDATE users SET password ='" + pwCrypt + "', flagChangePW = 0 WHERE email ='" + email + "';";
                console.log("cmdSql" + cmdSql);

                var promiseUpdateAuth = new Promise(function(resolveUpdateAuth, rejecteUpdateAuth) {
                        mysqlDBconn.query(cmdSql, function(err, res) {
                            if (err) {
                                console.log(err);
                                rejecteUpdateAuth(err);
                                return (err);
                            }
                            else {
                                console.log("pwd cambiata" + email);
                                resolveUpdateAuth(email);
                            }
                        });
                    })
                    .then(function() { //then promiseUpdateAuth  
                        mysqlDBconn.end();
                        res.send('PASSWORD CAMBIATA, <a href="/#/">clicca qui</a> per tornare al sito'); //perche non lo ritorna?
                    }); //then promiseUpdateAuth
            }

        }
    });

}); //app.get('/auth'



app.get('/ResetPWD', function(req, res) { //Funzione Chiamata da link

    var id = req.query.id;
    var emailCrypt = req.query.email;

    console.log("id = " + id + "email = " + emailCrypt);

    var mysqlDBconn = mysql.createConnection({
        host: global.mysqlHost,
        port: global.mysqlPort,
        user: global.mysqlUser,
        password: global.mysqlPassword,
        database: global.mysqlDatabase
    });

    //Seleziona email dell'utente a cui è stata inviata
    var cmdSql = "SELECT email FROM users WHERE id = " + id + " AND tmp_pwd is not null;";
    console.log('cmdSql = ' + cmdSql);

    mysqlDBconn.query(cmdSql, function(err, response) {
        if (err) {
            var errDescr = "error in select: " + cmdSql + " . Error: " + err;
            console.log(errDescr);
            mysqlDBconn.end();
            res.send(errDescr);
        }
        else {
            console.log('select:OK');
            console.log("JSON.stringify(response) : " + JSON.stringify(response));
            var notauth = true; //Flag per controllo autorizzazione
            if (response.length != 0) { //Se l'utente richiesto non esiste (id modificato)
                if (emailCrypt.length == 60) { //Se la lunghezza dell'email criptata viene modificata
                    if (bcrypt.compareSync(response[0].email, emailCrypt)) { //email corrisponde
                        notauth = false;
                        mysqlDBconn.end();



                        res.send('<!doctype html> <html>  <head>      <title>JIFERAY</title>     <link rel="shortcut icon" href="/images/Jiferay_icon.png" />     <meta http-equiv="X-UA-Compatible" content="IE=Edge">     <meta charset="utf-8">     <meta name="description" content="Bellatores è un’associazione/ente no profit che nasce per dare modo a più elementi di partecipare e organizzare : eventi, tornei, viaggi, attività sportive, corsi, training, Larp (giochi di ruolo su varie ambientazioni), team building, addii al celibato/nubilato di alto livello">     <meta name="viewport" content="width=device-width, initial-scale=1">     <meta name="keywords" content="Airsoft,Softair,Poligono,Difesa,Personale,MilSim,Simulazione,Militare,Armi,Benessere,Fisico">       <script src="/javascripts/content/angular-bootstrap/ui-bootstrap-tpls.js"></script>     <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">     <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>     <link rel="stylesheet" href="/stylesheets/style.css" />      <!--CSS/Less Include-->     <link rel="stylesheet" href="/javascripts/content/bootstrap/dist/css/bootstrap.css" />          <link rel="stylesheet" href="/javascripts/module/homePagesModule/content/contentModule.css" />     <!--<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">-->     </head>  <body>     <!--this is the central page of angular mono page application-->      <div class="col-sm-6 col-sm-offset-3">         <h1>Reimposta password</h1>         <form action="/POSTResetPWD" method="post" class="form-group">             <label>Password Temporanea</label>             <input type="password" name="tmp_pwd" class="form-control">             <br>             <label>Password</label>             <input type="password" name="psw1" class="form-control">             <br>             <label>Conferma Password</label>             <input type="password" name="psw2" class="form-control">             <br>             <input type="hidden" name="id" value="' + req.query.id + '">             <input type="hidden" name="emailCrypt" value="' + req.query.email + '">             <input type="submit" value="Imposta Password" class="btn btn-success btn-lg">         </form>     </div>     <div id="cookieConsent">         <div id="closeCookieConsent">x</div>         Questo sito web utilizza i cookies per offrirti una migliore esperienza di navigazione; <a ui-sref="noteLegali">Maggiori Informazioni</a>. <a class="cookieConsentOK">Accetto</a>     </div>     <!--script for cookieConsent-->     <script>         $(document).ready(function() {             setTimeout(function() {                 $("#cookieConsent").fadeIn(200);             }, 1000);             $("#closeCookieConsent, .cookieConsentOK").click(function() {                 $("#cookieConsent").fadeOut(200);             });         });     </script>     <!--style for cookieConsent-->     <style>         #cookieConsent {             background-color: rgba(20, 20, 20, 0.8);             min-height: 26px;             font-size: 14px;             color: #ccc;             line-height: 26px;             padding: 8px 0 8px 30px;             font-family: "Trebuchet MS", Helvetica, sans-serif;             position: fixed;             bottom: 0;             left: 0;             right: 0;             display: none;             z-index: 9999;         }          #cookieConsent a {             color: #4B8EE7;             text-decoration: none;             cursor: pointer;         }          #closeCookieConsent {             float: right;             display: inline-block;             cursor: pointer;             height: 20px;             width: 20px;             margin: -15px 0 0 0;             font-weight: bold;         }          #closeCookieConsent:hover {             color: #FFF;         }          #cookieConsent a.cookieConsentOK {             background-color: #F1D600;             color: #000;             display: inline-block;             border-radius: 5px;             padding: 0 20px;             cursor: pointer;             float: right;             margin: 0 60px 0 10px;         }          #cookieConsent a.cookieConsentOK:hover {             background-color: #E0C91F;         }     </style>   </body>  </html>');

                    }
                }
            }
            if (notauth) { //Se non è autorizzato
                mysqlDBconn.end();
                res.send('<h1>Non Autorizzato</h1>');
            }

        }
    }); //mysql



}); //Fine ResetPWD



app.post('/POSTResetPWD', function(req, res) { //Funzione chiamata da form

    console.log("Sono in /POSTResetPWD");

    var tmp_pwd = req.body.tmp_pwd;
    var psw1 = req.body.psw1;
    var psw2 = req.body.psw2;
    var id = req.body.id;
    var email = req.body.email;

    console.log("psw1 " + psw1);
    console.log("psw2 " + psw2);

    if (psw1.localeCompare(psw2) == 0) { //Controllo se le password sono uguali

        console.log("Password coincidono");

        var mysqlDBconn = mysql.createConnection({
            host: global.mysqlHost,
            port: global.mysqlPort,
            user: global.mysqlUser,
            password: global.mysqlPassword,
            database: global.mysqlDatabase
        });

        //Seleziona password temporanea dell'utente
        var cmdSql = "SELECT tmp_pwd FROM users WHERE id = " + id + " AND tmp_pwd is not null;";
        console.log('cmdSql = ' + cmdSql);

        var promiseSelect = new Promise(function(resolveSelect, rejecteSelect) {

                mysqlDBconn.query(cmdSql, function(err, response) {
                    if (err) {
                        var errDescr = "error in select: " + cmdSql + " . Error: " + err;
                        console.log(errDescr);
                        mysqlDBconn.end();
                        res.send(errDescr);
                    }
                    else {
                        if (response[0] == null || response[0] == undefined) { //Se la password è già stata modificata
                            mysqlDBconn.end();
                            res.send("<h1>Non Autorizzato</h1>");
                        }
                        else if (bcrypt.compareSync(tmp_pwd, response[0].tmp_pwd)) {

                            resolveSelect();

                        }
                        else {
                            mysqlDBconn.end();
                            res.send('<!doctype html> <html>  <head>      <title>JIFERAY</title>     <link rel="shortcut icon" href="/images/Jiferay_icon.png" />     <meta http-equiv="X-UA-Compatible" content="IE=Edge">     <meta charset="utf-8">     <meta name="description" content="Bellatores è un’associazione/ente no profit che nasce per dare modo a più elementi di partecipare e organizzare : eventi, tornei, viaggi, attività sportive, corsi, training, Larp (giochi di ruolo su varie ambientazioni), team building, addii al celibato/nubilato di alto livello">     <meta name="viewport" content="width=device-width, initial-scale=1">     <meta name="keywords" content="Airsoft,Softair,Poligono,Difesa,Personale,MilSim,Simulazione,Militare,Armi,Benessere,Fisico">       <script src="/javascripts/content/angular-bootstrap/ui-bootstrap-tpls.js"></script>     <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">     <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>     <link rel="stylesheet" href="/stylesheets/style.css" />      <!--CSS/Less Include-->     <link rel="stylesheet" href="/javascripts/content/bootstrap/dist/css/bootstrap.css" />          <link rel="stylesheet" href="/javascripts/module/homePagesModule/content/contentModule.css" />     <!--<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">-->     </head>  <body>     <!--this is the central page of angular mono page application-->      <div class="col-sm-6 col-sm-offset-3">         <h1>Reimposta password</h1>         <form action="/POSTResetPWD" method="post" class="form-group">             <label>Password Temporanea</label>             <input type="password" name="tmp_pwd" class="form-control">             <label>La password temporanea non è corretta</label>             <br>             <label>Password</label>             <input type="password" name="psw1" class="form-control">             <br>             <label>Conferma Password</label>             <input type="password" name="psw2" class="form-control">             <br>             <input type="hidden" name="id" value="' + id + '">             <input type="hidden" name="emailCrypt" value="' + email + '">             <input type="submit" value="Imposta Password" class="btn btn-success btn-lg">         </form>     </div>     <div id="cookieConsent">         <div id="closeCookieConsent">x</div>         Questo sito web utilizza i cookies per offrirti una migliore esperienza di navigazione; <a ui-sref="noteLegali">Maggiori Informazioni</a>. <a class="cookieConsentOK">Accetto</a>     </div>     <!--script for cookieConsent-->     <script>         $(document).ready(function() {             setTimeout(function() {                 $("#cookieConsent").fadeIn(200);             }, 1000);             $("#closeCookieConsent, .cookieConsentOK").click(function() {                 $("#cookieConsent").fadeOut(200);             });         });     </script>     <!--style for cookieConsent-->     <style>         #cookieConsent {             background-color: rgba(20, 20, 20, 0.8);             min-height: 26px;             font-size: 14px;             color: #ccc;             line-height: 26px;             padding: 8px 0 8px 30px;             font-family: "Trebuchet MS", Helvetica, sans-serif;             position: fixed;             bottom: 0;             left: 0;             right: 0;             display: none;             z-index: 9999;         }          #cookieConsent a {             color: #4B8EE7;             text-decoration: none;             cursor: pointer;         }          #closeCookieConsent {             float: right;             display: inline-block;             cursor: pointer;             height: 20px;             width: 20px;             margin: -15px 0 0 0;             font-weight: bold;         }          #closeCookieConsent:hover {             color: #FFF;         }          #cookieConsent a.cookieConsentOK {             background-color: #F1D600;             color: #000;             display: inline-block;             border-radius: 5px;             padding: 0 20px;             cursor: pointer;             float: right;             margin: 0 60px 0 10px;         }          #cookieConsent a.cookieConsentOK:hover {             background-color: #E0C91F;         }     </style>   </body>  </html>');
                        }
                    }

                });

            })
            .then(function() { //then promiseSelect

                var newpsw = bcrypt.hashSync(psw1, null, null);
                var cmdSql = "UPDATE users SET password = '" + newpsw + "', tmp_pwd = null WHERE id = " + id + ";";
                console.log('cmdSql = ' + cmdSql);

                mysqlDBconn.query(cmdSql, function(err) {
                    if (err) {
                        var errDescr = "error in update: " + cmdSql + " . Error: " + err;
                        console.log(errDescr);
                        mysqlDBconn.end();
                        res.send(errDescr);
                    }
                    else {
                        mysqlDBconn.end();
                        res.redirect('/#/');
                    }

                });

            });

    }
    else {
        console.log("Password Non Coincidono");
        res.send('<!doctype html> <html>  <head>      <title>JIFERAY</title>     <link rel="shortcut icon" href="/images/Jiferay_icon.png" />     <meta http-equiv="X-UA-Compatible" content="IE=Edge">     <meta charset="utf-8">     <meta name="description" content="Bellatores è un’associazione/ente no profit che nasce per dare modo a più elementi di partecipare e organizzare : eventi, tornei, viaggi, attività sportive, corsi, training, Larp (giochi di ruolo su varie ambientazioni), team building, addii al celibato/nubilato di alto livello">     <meta name="viewport" content="width=device-width, initial-scale=1">     <meta name="keywords" content="Airsoft,Softair,Poligono,Difesa,Personale,MilSim,Simulazione,Militare,Armi,Benessere,Fisico">       <script src="/javascripts/content/angular-bootstrap/ui-bootstrap-tpls.js"></script>     <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">     <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>     <link rel="stylesheet" href="/stylesheets/style.css" />      <!--CSS/Less Include-->     <link rel="stylesheet" href="/javascripts/content/bootstrap/dist/css/bootstrap.css" />          <link rel="stylesheet" href="/javascripts/module/homePagesModule/content/contentModule.css" />     <!--<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">-->     </head>  <body>     <!--this is the central page of angular mono page application-->      <div class="col-sm-6 col-sm-offset-3">         <h1>Reimposta password</h1>         <form action="/POSTResetPWD" method="post" class="form-group">             <label>Password Temporanea</label>             <input type="password" name="tmp_pwd" class="form-control">             <br>             <label>Password</label>             <input type="password" name="psw1" class="form-control">             <br>             <label>Conferma Password</label>             <input type="password" name="psw2" class="form-control">             <br>             <input type="hidden" name="id" value="' + id + '">             <input type="hidden" name="emailCrypt" value="' + email + '">             <label>Le due password non coincidono </label>       <br>      <input type="submit" value="Imposta Password" class="btn btn-success btn-lg">         </form>     </div>     <div id="cookieConsent">         <div id="closeCookieConsent">x</div>         Questo sito web utilizza i cookies per offrirti una migliore esperienza di navigazione; <a ui-sref="noteLegali">Maggiori Informazioni</a>. <a class="cookieConsentOK">Accetto</a>     </div>     <!--script for cookieConsent-->     <script>         $(document).ready(function() {             setTimeout(function() {                 $("#cookieConsent").fadeIn(200);             }, 1000);             $("#closeCookieConsent, .cookieConsentOK").click(function() {                 $("#cookieConsent").fadeOut(200);             });         });     </script>     <!--style for cookieConsent-->     <style>         #cookieConsent {             background-color: rgba(20, 20, 20, 0.8);             min-height: 26px;             font-size: 14px;             color: #ccc;             line-height: 26px;             padding: 8px 0 8px 30px;             font-family: "Trebuchet MS", Helvetica, sans-serif;             position: fixed;             bottom: 0;             left: 0;             right: 0;             display: none;             z-index: 9999;         }          #cookieConsent a {             color: #4B8EE7;             text-decoration: none;             cursor: pointer;         }          #closeCookieConsent {             float: right;             display: inline-block;             cursor: pointer;             height: 20px;             width: 20px;             margin: -15px 0 0 0;             font-weight: bold;         }          #closeCookieConsent:hover {             color: #FFF;         }          #cookieConsent a.cookieConsentOK {             background-color: #F1D600;             color: #000;             display: inline-block;             border-radius: 5px;             padding: 0 20px;             cursor: pointer;             float: right;             margin: 0 60px 0 10px;         }          #cookieConsent a.cookieConsentOK:hover {             background-color: #E0C91F;         }     </style>   </body>  </html>');
    }

});



app.post('/session', function(req, res) {});





//standard chiamate mysql basilari
app.post('/ajax_mysql', function(req, res) {

    console.log("è entrato in /ajax_mysql");
    var obj = req.body;
    if (req.query.param0 != null && req.body.param0 == null) {
        console.log("Valori presi da req.query anziché da req.body");
        obj = req.query;
    }

    if (obj.param0 == "mysql") {



        var mysqlDBconn = mysql.createConnection({
            host: global.mysqlHost,
            port: global.mysqlPort,
            user: global.mysqlUser,
            password: global.mysqlPassword,
            database: global.mysqlDatabase
        });

        var promiseConnect = new Promise(function(resolveConnect, rejecteConnect) {

                mysqlDBconn.connect(function(err) {
                    if (err) {
                        rejecteConnect(err);
                        return console.error('users_mysql - error Mysql database', err);
                    }
                    else {
                        console.log("Connesso a MySQL senza ORM");
                        resolveConnect();
                    }
                });

            })
            .then(function() {


                if (obj.param1 == "select") {

                    console.log("select param2 =" + obj.param2);
                    var promiseSelect = new Promise(function(resolveSelect, rejecteSelect) {
                            mysqlDBconn.query(obj.param2, function(err, rows, fields) {
                                if (err) {
                                    console.log("error in select = " + err);
                                    mysqlDBconn.end();
                                    rejecteSelect(err);
                                    res.send(err);
                                }
                                else {
                                    console.log(JSON.stringify(rows));
                                    resolveSelect(rows);
                                } //if else
                            }); //mysqlDBconn.query

                        })
                        .then(function(rows) { //then promise1  
                            mysqlDBconn.end();
                            res.send(JSON.stringify(rows));
                        }); //then promise2
                }


                else if (obj.param1 == "update") {
                    console.log("update param2 = " + obj.param2);

                    var promiseUpdate = new Promise(function(resolveUpdate, rejecteUpdate) {

                            mysqlDBconn.query(obj.param2, function(err, rows) {
                                if (err) {
                                    var errDescr = "error in update: " + obj.param2 + " . Error: " + err;
                                    console.log(errDescr);
                                    mysqlDBconn.end();

                                    rejecteUpdate(errDescr);
                                    res.send(errDescr);
                                }
                                else {
                                    console.log("update:OK");
                                    resolveUpdate(obj.param2);
                                }
                            });

                        })
                        .then(function(rows) { //then promiseUpdate
                            mysqlDBconn.end();
                            res.send("OK." + rows + "eseguito correttamente");
                        }); //then promiseUpdate

                }


                else if (obj.param1 == "insert into") {
                    console.log("insert into param2=" + obj.param2);
                    var promiseInsert = new Promise(function(resolveInsert, rejecteInsert) {
                            mysqlDBconn.query(obj.param2, function(err) {
                                if (err) {
                                    var errDescr = "error in insert into: " + obj.param2 + " . Error: " + err;
                                    console.log(errDescr);
                                    mysqlDBconn.end();

                                    rejecteInsert(err);
                                    res.send(errDescr);

                                }
                                else {
                                    console.log("insert into: OK");
                                    resolveInsert(obj.param2);
                                }
                            });

                        })
                        .then(function(response) { //then promiseInsert  
                            mysqlDBconn.end();
                            res.send("OK. insert into" + response + "eseguito correttamente");
                        }); //then promiseInsert

                } //ELSE IF


                else if (obj.param1 == "delete") {
                    console.log("delete param2=" + obj.param2);

                    var promiseDelete = new Promise(function(resolveDelete, rejecteDelete) {

                            mysqlDBconn.query(obj.param2, function(err) {
                                if (err) {
                                    var errDescr = "error in delete: " + obj.param2 + " . Error: " + err;
                                    console.log(errDescr);
                                    mysqlDBconn.end();

                                    rejecteDelete(errDescr);
                                    res.send(errDescr);
                                }
                                else {
                                    console.log("delete: OK");
                                    resolveDelete(obj.param2);
                                }
                            });

                        })
                        .then(function(response) { //then promiseDelete  
                            mysqlDBconn.end();
                            res.send("OK. " + response + "eseguito correttamente");
                        }); //then promiseDelete

                } //ELSE IF


                else if (obj.param1 == "insert-cript") {
                    console.log("insert-cript ");

                    var pwCrypt = bcrypt.hashSync(obj.param3, null, null);

                    var promiseInsertCript = new Promise(function(resolveInsertC, rejecteInsertC) {
                            var cmdSql = obj.param2 + pwCrypt + obj.param4;
                            mysqlDBconn.query(cmdSql, function(err) {
                                if (err) {
                                    var errDescr = "error in insert-cript: " + obj.param2 + " . Error: " + err;
                                    console.log(errDescr);
                                    mysqlDBconn.end();

                                    rejecteInsertC(errDescr);
                                    res.send(errDescr);
                                }
                                else {
                                    console.log("insert-cript:OK");
                                    resolveInsertC();
                                }
                            });
                        })
                        .then(function() { //then promiseInsertCript
                            mysqlDBconn.end();
                            res.send("insert-cript:OK");
                        }); //then promiseInsertCript

                } //ELSE IF


                else if (obj.param1 == "update-crypt") {
                    console.log("update param2 = " + obj.param2);
                    var pwCrypt = bcrypt.hashSync(obj.param3, null, null);

                    var promiseUpdate = new Promise(function(resolveUpdate, rejecteUpdate) {
                            var cmdSql = obj.param2 + pwCrypt + obj.param4;
                            mysqlDBconn.query(cmdSql, function(err, rows) {
                                if (err) {
                                    var errDescr = "error in update: " + cmdSql + " . Error: " + err;
                                    console.log(errDescr);
                                    mysqlDBconn.end();

                                    rejecteUpdate(errDescr);
                                    res.send(errDescr);
                                }
                                else {
                                    console.log("update:OK");
                                    resolveUpdate(cmdSql);
                                }
                            });

                        })
                        .then(function(rows) { //then promiseUpdate
                            mysqlDBconn.end();
                            res.send("OK." + rows + "eseguito correttamente");
                        }); //then promiseUpdate

                }


                else if (obj.param1 == "call") {

                    var cmdSql = obj.param2;
                    console.log(" call param2= " + obj.param2);

                    var promiseCall = new Promise(function(resolveCall, rejecteCall) {

                            mysqlDBconn.query(cmdSql, function(err, queryOK) {
                                if (err) {
                                    var errDescr = "error in call: " + obj.param2 + " . Error: " + err;
                                    console.log(errDescr);
                                    mysqlDBconn.end();

                                    rejecteCall(errDescr);
                                    res.send(errDescr);
                                }
                                else {
                                    console.log('Call:OK');
                                    // resolveCall();
                                    resolveCall(queryOK);
                                }
                            }); //mysql
                        })
                        .then(function(queryOK) { //then promiseCall
                            mysqlDBconn.end();
                            console.log("JSON.stringify(queryOK): " + JSON.stringify(queryOK));
                            res.send(JSON.stringify(queryOK));
                        }); //then promiseCall
                }


            }); //then promise2   
    }
    if (req.body.param0 == "postgres") {

    }

}); //app.post('/ajax_mysql'





module.exports = app;
