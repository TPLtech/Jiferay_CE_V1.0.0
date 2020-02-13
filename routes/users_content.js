var multiparty = require('multiparty');
var express = require('express');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

var dateFormat = require('dateformat');
var http = require('http');
var reader = require("buffered-reader");
var DataReader = reader.DataReader;
var async = require('async');
var mysql = require('mysql');
var Promise = require("promise");
var fs = require("fs-extra");

var AdmZip = require('adm-zip');


var app = express.Router();
console.log('entrato in /routes/users_content');




app.post("/imgUploadPCtemplate", function(req, res) {
  var form = new formidable.IncomingForm();


  form.parse(req, function(err, fields, files) {
    if (err) return (err);
    var oldpath = files.imageToUpload.path;

    console.log("fields" + JSON.stringify(fields));
    console.log("files" + JSON.stringify(files));

    var pagename = fields.form1_hpagename;

    var newName = files.imageToUpload.name; //file img

    console.log("newName = " + newName);

    var newpath = __dirname + "/../public/javascripts/module/homePagesModule/" + pagename + "/img/" + newName;

    fs.rename(oldpath, newpath, function(err) {

      if (err) {
        console.log("Errore in /imgUploadPCtemplate: ", err);
        res.send(err);
      }
      else {
        res.send(fields.form1_url_site + newName); //--------------------------------
      }
      res.end();
    });
  });

});



app.post("/imgUploadPC", function(req, res) {

  console.log("sono entrato nella /imgUploadPC: " + JSON.stringify(req.query.username));
  var form = new formidable.IncomingForm();
  var now = new Date();
  var dt = dateFormat(now, "yyyy-mm-dd_HH-MM-ss");

  form.parse(req, function(err, fields, files) {
    if (err) return (err);
    var oldpath = files.imageToUpload.path;
    console.log("path--------- ", files.imageToUpload.path);

    var newName = files.imageToUpload.name;
    var username = req.query.username;
    var extPos = newName.indexOf(".");
    var ext = newName.substr(extPos);
    newName = files.imageToUpload.name + '____';
    newName = username + "_" + newName.substr(0, 4) + "_" + dt;
    var newpath = __dirname + "/../public/images/" + newName + ext;

    fs.rename(oldpath, newpath, function(err) {
      if (err) {
        console.log("Errore in /imgUploadPC: ", err);
        res.send(err);
      }
      else {
        res.send(newName + ext);
      }
      res.end();
    });
  });

});



app.post("/newUploadImg", function(req, res) {


  console.log("sono entrato nella /imgUploadPC: " + JSON.stringify(req.query.username));
  var form = new formidable.IncomingForm();
  var now = new Date();
  var dt = dateFormat(now, "yyyy-mm-dd_HH-MM-ss");

  form.parse(req, function(err, fields, files) {
    if (err) return (err);
    var oldpath = files.imageToUpload.path;

    var newName = files.imageToUpload.name;
    var username = req.query.username;
    var extPos = newName.indexOf(".");
    var ext = newName.substr(extPos);
    newName = files.imageToUpload.name + '____';
    newName = username + "_" + newName.substr(0, 4) + "_" + dt;
    var newpath = __dirname + "/../public/images/" + newName + ext;

    fs.rename(oldpath, newpath, function(err) {
      if (err) {
        console.log("Errore in /imgUploadPC: ", err);
        res.send(err);
      }
      else {
        res.send(newName + ext);
      }
      res.end();
    });
  });

});



app.post("/leggiFileTxtPagine", function(req, res) {
  console.log("sono entrato nella /leggiFileTxtPagine, req.body.id_user: " + req.body.id_user);

  var cmdSql = "select * from documents WHERE id_stage ='" + req.body.id_user + "';";


});



app.post("/leggiImgPagine", function(req, res) {
  console.log("sono entrato nella /leggiImgPagine, req.body.pagina: " + req.body.pagina);
  var uploadsPath = path.join(__dirname, '../public/javascripts/module/homePagesModule/' + req.body.pagina + "/img/"); //dir del REPO di memorizzazione dei files
  var imgPage = [];
  fs.readdir(uploadsPath, (err, files) => { //ricerca files in REPO
    if (err) return (err);
    for (var i = 0; i < files.length; i++) {
      imgPage.push(files[i]);
    }
    console.log("/leggiImgPagine, imgPage: " + imgPage);
    res.send(imgPage);
  });
});



app.post("/fileuploadREPO", function(req, res) {
  console.log("req: " + JSON.stringify(req.body));
  var uploadsPath = path.join(__dirname, '../uploads', req.body.nome);
  console.log("sono entrato nella /fileuploadREPO: ", uploadsPath);
  res.sendFile(uploadsPath);
});



app.post("/imguploadREPO", function(req, res) {
  console.log("req: " + JSON.stringify(req.body));
  var imgpath = path.join(__dirname, '../public/javascripts/module/homePagesModule/' + req.body.pagina + '/img/' + req.body.nome);
  console.log("sono entrato nella /fileuploadREPO:imgurl ", imgpath);
  res.sendFile(imgpath);
});




app.post("/textupload", function(req, res) {

  console.log("sono entrato nella ./textupload: ");

  var fileContent = req.body.htmlContent;
  console.log("fileContent " + fileContent);

  var fileName = req.body.fileName;
  console.log("fileName " + fileName);
  var username = req.body.username;
  console.log("fileName " + username);

  var now = new Date();
  var dt = dateFormat(now, "yyyy-mm-dd_HH-MM-ss");
  // file HTML salvato come include.html

  var newName = fileName + "_" + username + "_" + dt + ".html";

  var includeFilePathName = __dirname + "/../public" + req.body.includeFilePathName;
  console.log("includeFilePathName " + includeFilePathName);

  var upload_filepath = __dirname + '/../uploads/' + newName; //--------------------------------
  console.log("upload_filepath: ", upload_filepath);
  // /home/ubuntu/workspace/routes../uploads/chiSiamo_admin_2017-07-27_14-17-46.html
  var msg = '';
  fs.writeFile(upload_filepath, fileContent, (err) => {
    if (err) {
      console.log("err " + err);
    }
    else {
      fs.writeFile(includeFilePathName, fileContent, (err) => {
        if (err) {
          console.log("err in fs.writeFile(" + includeFilePathName + " + err)");
        }
        else {
          console.log("The file was succesfully saved!");
        }
      });
      res.send(msg);
    }
  });
});



app.post("/filedownload", function(req, res) {
  console.log("sono entrato nella /filedownload");

  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) return (err);
    var oldpath = files.filetoupload.path;
    var newpath = __dirname + '../uploads/' + files.filetoupload.name; //--------------------------------

    fs.rename(oldpath, newpath, function(err) {
      if (err) throw err;
      res.write('File uploaded and moved! path: ' + newpath);
      res.end();
    });
  });


});



app.post("/imgUploadPP", function(req, res) {
  console.log(" sono in imgUploadPP");
  var form = new formidable.IncomingForm();


  form.parse(req, function(err, fields, files) {
    if (err) return (err);
    var oldpath = files.imageToUpload.path;

    console.log("fields" + JSON.stringify(fields));
    console.log("files" + JSON.stringify(files));

    var pagename = fields.form1_hpagename;

    var newName = files.imageToUpload.name; //file img

    console.log("newName = " + newName);

    var newpath = __dirname + "/../public/images/imagesForPP/" + newName;
    console.log("newpath = " + newpath);
    fs.rename(oldpath, newpath, function(err) {

      if (err) {
        console.log("Errore in /imgUploadPP: ", err);
        res.send(err);
      }
      else {
        res.send(fields.form1_url_site + newName); //--------------------------------
      }
      res.end();
    });
  });

});





app.post("/imgUploadHR", function(req, res) {
  console.log(" sono in imgUploadHR");
  var form = new formidable.IncomingForm();


  form.parse(req, function(err, fields, files) {
    if (err) return (err);

    if (files.imageToUploadTest.path == "") {
      res.send("SELEZIONARE UN IMMAGINE");
      res.end();
    }
    var oldpath = files.imageToUploadTest.path;
    console.log("path-------" + files.imageToUploadTest.path);
    console.log("fields" + JSON.stringify(fields));
    console.log("files" + JSON.stringify(files));


    var newpath = __dirname + "/../public/images/imageStage/" + files.imageToUploadTest.name;
    console.log("newpath = " + newpath);
    fs.rename(oldpath, newpath, function(err) {

      if (err) {
        console.log("Errore in /imgUploadPP: ", err);
        res.send(err);
      }
      else {
        res.send("/images/imageStage/" + files.imageToUploadTest.name); //--------------------------------
      }
      res.end();
    });
  });

});


//products----------------------------------------------------------------------
app.post("/imgUploadProd", function(req, res) {
  console.log(" sono in imgUploadProd");
  var form = new formidable.IncomingForm();


  form.parse(req, function(err, fields, files) {
    if (err) return (err);

    if (files.imageToUploadTest.path == "") {
      res.send("SELEZIONARE UN IMMAGINE");
      res.end();
    }
    var oldpath = files.imageToUploadTest.path;
    console.log("path-------" + files.imageToUploadTest.path);
    console.log("fields" + JSON.stringify(fields));
    console.log("files" + JSON.stringify(files));


    var newpath = __dirname + "/../public/images/imgProd/" + files.imageToUploadTest.name;
    console.log("newpath = " + newpath);
    fs.rename(oldpath, newpath, function(err) {

      if (err) {
        console.log("Errore in /imgUploadProd: ", err);
        res.send(err);
      }
      else {
        res.send("/images/imgProd/" + files.imageToUploadTest.name); //--------------------------------
      }
      res.end();
    });
  });

});



app.post("/fileUploadProd", function(req, res) {
  console.log("sono entrato nella /fileUploadProd");

  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) return (err);

    var now = new Date();
    var oldpath = files.filetoupload.path;
    var newpath = __dirname + '/../public/documents/' + files.filetoupload.name; //-rinominare file-------------------------------
    var localpath = '/documents/' + files.filetoupload.name;
    fs.rename(oldpath, newpath, function(err) {
      if (err) {
        console.log("Errore in /fileUploadPC: ", err);
      }
      else {

        var mysqlDBconn = mysql.createConnection({
          host: global.mysqlHost,
          port: global.mysqlPort,
          user: global.mysqlUser,
          password: global.mysqlPassword,
          database: global.mysqlDatabase
        });


        var cmdSql = "INSERT INTO prod_doc(id_product,doc,description)values(" + fields.id_product + ",'" + localpath + "','" + fields.descrizione + "');";
        console.log("cmdSql = " + cmdSql);
        var promiseInsert = new Promise(function(resolveInsert, rejecteInsert) {

            mysqlDBconn.query(cmdSql, function(err) {
              if (err) {
                var errDescr = "error in insert into: " + cmdSql + " . Error: " + err;
                console.log(errDescr);
                rejecteInsert(err);
                res.send(errDescr);

              }
              else {
                console.log("insert into: OK");
                resolveInsert(cmdSql);
              }
            });

          })
          .then(function(response) { //then promiseInsert  
            mysqlDBconn.end();
            console.log("OK  Upload e salvataggio file eseguito correttamente");

            res.send('<p>OK  Upload e salvataggio file eseguito correttamente</p>');
            res.end();

          }); //then promiseInsert




      }
    });
  });
});

//fine products-----------------------------------------------------------------


//prototipes----------------------------------------------------------------------
app.post("/imgUploadProto", function(req, res) {
  console.log(" sono in imgUploadProto");
  var form = new formidable.IncomingForm();


  form.parse(req, function(err, fields, files) {
    if (err) return (err);

    if (files.imageToUploadTest.path == "") {
      res.send("SELEZIONARE UN IMMAGINE");
      res.end();
    }
    var oldpath = files.imageToUploadTest.path;
    console.log("path-------" + files.imageToUploadTest.path);
    console.log("fields" + JSON.stringify(fields));
    console.log("files" + JSON.stringify(files));


    var newpath = __dirname + "/../public/images/imgProto/" + files.imageToUploadTest.name;
    console.log("newpath = " + newpath);
    fs.rename(oldpath, newpath, function(err) {

      if (err) {
        console.log("Errore in /imgUploadProto: ", err);
        res.send(err);
      }
      else {
        res.send("/images/imgProto/" + files.imageToUploadTest.name); //--------------------------------
      }
      res.end();
    });
  });

});



app.post("/fileUploadProto", function(req, res) {
  console.log("sono entrato nella /fileUploadProto");

  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) return (err);

    var now = new Date();
    var oldpath = files.filetoupload.path;
    var newpath = __dirname + '/../public/documents/' + files.filetoupload.name; //-rinominare file-------------------------------
    var localpath = '/documents/' + files.filetoupload.name;
    fs.rename(oldpath, newpath, function(err) {
      if (err) {
        console.log("Errore in /fileUploadProto: ", err);
      }
      else {

        var mysqlDBconn = mysql.createConnection({
          host: global.mysqlHost,
          port: global.mysqlPort,
          user: global.mysqlUser,
          password: global.mysqlPassword,
          database: global.mysqlDatabase
        });


        var cmdSql = "INSERT INTO prototipes_doc(id_prototipes,doc,description)values(" + fields.id_prototipe + ",'" + localpath + "','" + fields.descrizione + "');";
        console.log("cmdSql = " + cmdSql);
        var promiseInsert = new Promise(function(resolveInsert, rejecteInsert) {

            mysqlDBconn.query(cmdSql, function(err) {
              if (err) {
                var errDescr = "error in insert into: " + cmdSql + " . Error: " + err;
                console.log(errDescr);
                rejecteInsert(err);
                res.send(errDescr);

              }
              else {
                console.log("insert into: OK");
                resolveInsert(cmdSql);
              }
            });

          })
          .then(function(response) { //then promiseInsert  
            mysqlDBconn.end();
            console.log("OK  Upload e salvataggio file eseguito correttamente");

            res.send('<p>OK  Upload e salvataggio file eseguito correttamente</p>');
            res.end();

          }); //then promiseInsert



      }
    });
  });
});
//fine prototipes-----------------------------------------------------------------



app.post("/imgUploadPC", function(req, res) {

  console.log("sono entrato nella /imgUploadPC: " + JSON.stringify(req.query.username));
  var form = new formidable.IncomingForm();
  var now = new Date();
  var dt = dateFormat(now, "yyyy-mm-dd_HH-MM-ss");

  form.parse(req, function(err, fields, files) {
    if (err) return (err);
    var oldpath = files.imageToUpload.path;
    console.log("path--------- ", files.imageToUpload.path);

    var newName = files.imageToUpload.name;
    var username = req.query.username;
    var extPos = newName.indexOf(".");
    var ext = newName.substr(extPos);
    newName = files.imageToUpload.name + '____';
    newName = username + "_" + newName.substr(0, 4) + "_" + dt;
    var newpath = __dirname + "/../public/images/" + newName + ext;

    fs.rename(oldpath, newpath, function(err) {
      if (err) {
        console.log("Errore in /imgUploadPC: ", err);
        res.send(err);
      }
      else {
        res.send(newName + ext);
      }
      res.end();
    });
  });

});



app.post("/imgUploadPCM", function(req, res) {

  var form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    if (err) return (err);
    var imgArray = files.imageToUploadM;

    var arrayFoto = [];

    for (var i = 0; i < imgArray.length; i++) {
      var newPath = __dirname + "/../public/images/imageProdotti/";
      newPath += imgArray[i].originalFilename;
      var nome = "/images/imageProdotti/" + imgArray[i].originalFilename;
      arrayFoto.push(nome);
      readAndWriteFile(imgArray[i], newPath);
    }
    console.log("array-----" + arrayFoto.length);
    res.send(arrayFoto);

  });

  function readAndWriteFile(singleImg, newPath) {

    fs.readFile(singleImg.path, function(err, data) {
      fs.writeFile(newPath, data, function(err) {
        if (err) console.log('ERRRRRR!! :' + err);
        console.log('Fitxer: ' + singleImg.originalFilename + ' - ' + newPath);
      });
    });
  }
});



app.post("/imgUploadImgHome", function(req, res) {

  var form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    if (err) return (err);
    var imgArray = files.imageToUploadM;

    var arrayFoto = [];

    for (var i = 0; i < imgArray.length; i++) {
      var newPath = __dirname + "/../public/images/imgHome/";
      newPath += imgArray[i].originalFilename;
      var nome = "/images/imageProdotti/" + imgArray[i].originalFilename;
      arrayFoto.push(nome);
      readAndWriteFile(imgArray[i], newPath);
    }
    console.log("array-----" + arrayFoto.length);
    res.send(arrayFoto);

  });

  function readAndWriteFile(singleImg, newPath) {

    fs.readFile(singleImg.path, function(err, data) {
      fs.writeFile(newPath, data, function(err) {
        if (err) console.log('ERRRRRR!! :' + err);
        console.log('Fitxer: ' + singleImg.originalFilename + ' - ' + newPath);
      });
    });
  }
});



app.post("/fileUploadPC", function(req, res) {
  console.log("sono entrato nella /fileUploadPC");

  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) return (err);

    var now = new Date();
    var oldpath = files.filetoupload.path;
    var newpath = __dirname + '/../public/documents/' + files.filetoupload.name; //-rinominare file-------------------------------
    var localpath = '/documents/' + files.filetoupload.name;
    fs.rename(oldpath, newpath, function(err) {
      if (err) {
        console.log("Errore in /fileUploadPC: ", err);
      }
      else {

        var mysqlDBconn = mysql.createConnection({
          host: global.mysqlHost,
          port: global.mysqlPort,
          user: global.mysqlUser,
          password: global.mysqlPassword,
          database: global.mysqlDatabase
        });


        var cmdSql = "INSERT INTO documents(id_ticket,doc,description)values(" + fields.id_ticket + ",'" + localpath + "','" + fields.descrizione + "');";
        var promiseInsert = new Promise(function(resolveInsert, rejecteInsert) {

            mysqlDBconn.query(cmdSql, function(err) {
              if (err) {
                var errDescr = "error in insert into: " + cmdSql + " . Error: " + err;
                console.log(errDescr);
                rejecteInsert(err);
                res.send(errDescr);

              }
              else {
                console.log("insert into: OK");
                resolveInsert(cmdSql);
              }
            });

          })
          .then(function(response) { //then promiseInsert  
            mysqlDBconn.end();
            console.log("OK  Upload e salvataggio file eseguito correttamente");

            res.send('<p>OK  Upload e salvataggio file eseguito correttamente</p>');
            res.end();

          }); //then promiseInsert



      }
    });
  });
});




app.post("/imgUploadMr", function(req, res) {
  console.log(" sono in imgUploadMI");
  var form = new formidable.IncomingForm();


  form.parse(req, function(err, fields, files) {
    if (err) return (err);

    if (files.imageToUploadTest.path == "") {
      res.send("SELEZIONARE UN IMMAGINE");
      res.end();
    }


    var oldpath = files.imageToUploadTest.path;

    console.log("fields" + JSON.stringify(fields));
    console.log("files" + JSON.stringify(files));


    var newpath = __dirname + "/../public/images/imageStage/" + files.imageToUploadTest.name;
    console.log("newpath = " + newpath);
    fs.rename(oldpath, newpath, function(err) {

      if (err) {
        console.log("Errore in /imgUploadPP: ", err);
        res.send(err);
      }
      else {
        res.send("/images/imgProd" + files.imageToUploadTest.name); //--------------------------------
      }
      res.end();
    });

  });

});


module.exports = app;
