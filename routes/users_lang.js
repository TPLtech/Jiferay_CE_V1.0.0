var express = require('express');
var app = express.Router();
var path = require('path');
var fs = require('fs');

var reader = require("buffered-reader");
var BinaryReader = reader.BinaryReader;
var DataReader = reader.DataReader;
var mysql = require('mysql');
var Promise = require("promise");

console.log('entrato in /routes/users_menuAdministartion');

var qs = require('querystring');
var https = require('https');






app.post('/lrExtraction', function(req, res) {
    console.log("app.post('/readState')" + __dirname + '/../public/javascripts/module/homePagesModule/');
    var p = [];
    var newLR = 0; //serve per controllare se necessario fare le insert
    var lrExtract = [];
    var cmdSql = "INSERT INTO lang_resources(standard_lang_resource,language,lang_resource,new) VALUES";
    var cmdsql1 = "";
    var numRow = 0;

    var walk = function(dir, done) {
        var results = [];
        fs.readdir(dir, function(err, list) {
            if (err) {
                return done(err);
            }
            var i = 0;
            (function next() {
                var file = list[i++];
                if (!file) {
                    return done(null, results);
                }
                file = dir + '/' + file;
                fs.stat(file, function(err, stat) {
                    if (err) {
                        return (err);
                    }
                    if (stat && stat.isDirectory()) {
                        walk(file, function(err, res) {
                            if (err) {
                                return (err);
                            }
                            results = results.concat(res);
                            next();
                        });
                    }
                    else {
                        results.push(file);
                        next();
                    }
                });
            })();
        });

    };

    walk(process.env.HOME, function(err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            if (results[i].indexOf('/home/ubuntu/workspace/public/javascripts/module/homePagesModule/') != -1) {
                if (results[i].indexOf('.html') != -1) {
                    //console.log(results[i]);
                    p.push(results[i]);
                }
            }
        }
        var pLength = p.length;

        for (var n = 0; n < pLength; n++) {
            var fileName = p[n];
            var readySend = 0;

            new DataReader(p[n], { encoding: "utf8" })
                .on("error", function(error) {
                    console.log("error: " + error);
                })
                .on("line", function(line) {
                    numRow++;

                    line = line.substring(line.indexOf('{{lr("'), line.indexOf('")}}'));

                    if ((line.indexOf('{{lr("') !== -1)) { //controllo necessario per assicurarsi che la stringa presa in esame sia corretta
                        // if ((line.indexOf('{{lr("') !== -1) ????? (line.indexOf("<!--") !== -1)) { //controllo necessario per assicurarsi che la stringa presa in esame sia corretta

                        line = line.substring(6);
                        //     line = line.substr(22);
                        //console.log("readState --- file: "+ fileName + ", riga:" + numRow + " ,stateproviderName: ", line);
                        lrExtract.push({ name: line }); //aggiungere la pagina da cui arriva
                        // this.interrupt(); // interrompe la ricerca in caso viene trovato stateproviderNames nella stringa
                    }
                    // else if (numRow == 20) {
                    //     this.interrupt();
                    //     //se $stateProvider.state non viene trovato nelle prime 50 righe allora il file non contiene stateprovider
                    // }

                })
                .on("end", function() {
                    numRow = 0;
                    readySend++;
                    if (readySend == pLength) {
                        console.log("LR found: ", JSON.stringify(lrExtract));



                        // res.json(lrExtract);

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


                                // console.log("select param2 =" + obj.param2);
                                var PromiseSelect = new Promise(function(resolveSelect, rejecteSelect) {
                                        mysqlDBconn.query("SELECT * FROM lang_resources WHERE language = 'it_IT'", function(err, rows, fields) {
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
                                    .then(function(rows) { //then Promise1  
                                        // mysqlDBconn.end();
                                        for (var i = 0; i < lrExtract.length; i++) {
                                            var nuovo = true;
                                            for (var j = 0; j < rows.length; j++) {

                                                if (lrExtract[i].name == rows[j].standard_lang_resource) {
                                                    nuovo = false;
                                                }


                                            }
                                            if (nuovo) {
                                                newLR++;
                                                console.log(lrExtract[i]);
                                                cmdsql1 += "('" + lrExtract[i].name + "','it_IT','" + lrExtract[i].name + "',1),";
                                            }
                                        }

                                        if (newLR != 0) {
                                            var promiseInsert = new Promise(function(resolveInsert, rejecteInsert) {

                                                    cmdsql1 = cmdsql1.substring(0, cmdsql1.length - 1);
                                                    var query = cmdSql + cmdsql1 + ";";
                                                    mysqlDBconn.query(query, function(err) {
                                                        if (err) {
                                                            var errDescr = "error in insert into: " + query + " . Error: " + err;
                                                            console.log(errDescr);
                                                            mysqlDBconn.end();

                                                            // rejecteInsert(err);
                                                            // res.send(errDescr);

                                                        }
                                                        else {
                                                            console.log("insert into: OK");
                                                            resolveInsert(query);
                                                        }
                                                    });

                                                })
                                                .then(function(response) { //then promiseInsert  
                                                    mysqlDBconn.end();
                                                    res.send("OK. insert into" + response + "eseguito correttamente");
                                                }); //then promiseInsert


                                        }
                                        else {
                                            console.log("nessun nuovo contenuto trovato");
                                            res.send("nessun nuovo contenuto trovato");
                                        }
                                        // res.send(JSON.stringify(rows));
                                    }); //then Promise2
                            });
                    }
                })
                .read(); //fine new DataReader
        } //for
    });
}); //app.post('/readState',



app.post('/AlignLR', function(req, res) {
    var newLR = 0; //serve per controllare se necessario fare le insert
    var lrExtract = [];
    var cmdSql = "INSERT INTO lang_resources(standard_lang_resource,language,lang_resource,new) VALUES";
    var cmdsql1 = "";
    var numRow = 0;
    // req.body.lang = "sr_SR";


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


            var PromiseSelect = new Promise(function(resolveSelect, rejecteSelect) {
                    mysqlDBconn.query("SELECT (SELECT COUNT(*) FROM lang_resources WHERE language = 'it_IT') it ,(SELECT COUNT(*) FROM lang_resources WHERE language = '" + req.body.lang + "') lang;", function(err, rows, fields) {
                        if (err) {
                            console.log("error in select = " + err);
                            mysqlDBconn.end();
                            rejecteSelect(err);
                            res.send(err);
                        }
                        else {
                            console.log(JSON.stringify(rows));
                            if (rows[0].it > rows[0].lang) {
                                resolveSelect(rows);
                            }
                            else {
                                res.send("Non sono presenti nuovi contenuti da allineare");
                            }
                        } //if else
                    }); //mysqlDBconn.query
                })
                .then(function(rows) { //then Promise1  



                    var PromiseSelect = new Promise(function(resolveSelect, rejecteSelect) {
                            // AND new = 1;


                            mysqlDBconn.query("SELECT * FROM lang_resources WHERE language = 'it_IT'", function(err, rows, fields) {
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
                        .then(function(rows) { //then Promise1  


                            var PromiseSelect = new Promise(function(resolveSelect, rejecteSelect) {
                                console.log("lang = " + req.body.lang);
                                mysqlDBconn.query("SELECT * FROM lang_resources WHERE language = '" + req.body.lang + "'", function(err, LRrows, fields) {
                                    if (err) {
                                        console.log("error in select = " + err);
                                        mysqlDBconn.end();
                                        rejecteSelect(err);
                                        res.send(err);
                                    }
                                    else {
                                        console.log(JSON.stringify(LRrows));
                                        resolveSelect(LRrows);
                                    } //if else
                                }); //mysqlDBconn.query

                            }).then(function(LRrows) {

                                for (var i = 0; i < rows.length; i++) {
                                    var nuovo = true;
                                    for (var j = 0; j < LRrows.length; j++) {

                                        if (rows[i].standard_lang_resource == LRrows[j].standard_lang_resource) {
                                            nuovo = false;
                                            console.log("prova");
                                        }

                                    }
                                    if (nuovo) {
                                        newLR++;
                                        console.log("newLR" + newLR);
                                        console.log(rows[i]);
                                        cmdsql1 += '("' + rows[i].standard_lang_resource + '","' + req.body.lang + '","' + rows[i].standard_lang_resource + '",1),';
                                        console.log("newLR" + newLR);
                                    }
                                }

                                if (newLR != 0) {
                                    console.log("newLR" + newLR);

                                    var promiseInsert = new Promise(function(resolveInsert, rejecteInsert) {

                                            cmdsql1 = cmdsql1.substring(0, cmdsql1.length - 1);
                                            var query = cmdSql + cmdsql1 + ";";
                                            mysqlDBconn.query(query, function(err) {
                                                if (err) {
                                                    var errDescr = "error in insert into: " + query + " . Error: " + err;
                                                    console.log(errDescr);
                                                    mysqlDBconn.end();

                                                    // rejecteInsert(err);
                                                    // res.send(errDescr);

                                                }
                                                else {
                                                    console.log("insert into: OK");
                                                    resolveInsert(query);
                                                }
                                            });

                                        })
                                        .then(function(response) { //then promiseInsert  
                                            mysqlDBconn.end();
                                            res.send("OK. insert into" + response + "eseguito correttamente");
                                        }); //then promiseInsert


                                }
                                else {
                                    console.log("nessun nuovo contenuto trovato");
                                    res.send("nessun nuovo contenuto trovato");
                                }
                                // res.send(JSON.stringify(rows));
                            }); //then Promise2
                        }); //then Promise2

                });
        });
});

module.exports = app;
