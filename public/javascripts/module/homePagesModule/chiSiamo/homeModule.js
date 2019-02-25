angular.module('chiSiamoModule', ['ui.router'])
    .config(function($stateProvider,$urlRouterProvider) {
        $stateProvider.state('chiSiamo', {
            //url: '/chiSiamo',
            controller: 'chiSiamoController',
            templateUrl: '/javascripts/module/homePagesModule/chiSiamo/homeModule.html',
            jp_app_name: 'chiSiamo',
            Jp_app_version: 'v1.0.0',
            Jp_app_menu: 'chiSiamo'
        });
    })



    .directive("readText", function() {
        //Questa directive serve a settare $scope.file, un oggetto necessario a $scope.loadFileAsText per caricare il file nella textarea 
        return {
            link: function($scope, el) {
                el.bind("change", function(e) {
                    $scope.file = (e.srcElement || e.target).files[0];
                    console.log('.directive("readText", $scope.file: ', $scope.file);
                });
            }
        };
    });

angular.module('chiSiamoModule')
    .controller('chiSiamoController', function($scope, $http, fileReader, $sce, $state, $rootScope) {



        $scope.getPartial = function(file) {
            return "/javascripts/module/homePagesModule/" + $state.current.name + "/include.html";
        };



        $scope.pageName = $state.current.name; //Nome della pagina, tassativamente uguale al nome dello $stateProvider.state della pagina
        var stat = $state;
        //console.log("$state: " +  JSON.stringify($state.get())); //  -------------------------------------
        console.log("$state: " + JSON.stringify($state.current)); //// ------------------------------------
        console.log("$state: " + JSON.stringify($state.current.name));

        $scope.number_txt = "001";
        $scope.numLettersName = 4;
        // $scope.numCifre = $scope.numLettersName + 3;
        $scope.sideMenu = false;
        $scope.divShow_webMast = false;

        if ($scope.divShow_webMaster) {
            $scope.divShow_webMast = true;
        }




        $scope.inState = function(state) {
            return $state.is(state);

        };



        $scope.fileNameNumber = function(fileName) {
            // var res = fileName.slice($scope.numLettersName, $scope.numCifre);
            // $scope.inputFileName_num = res
            $scope.inputFileName_num = fileName;
        };




        $scope.testPost = function() {
            console.log("testPost");
            $http.post('/testService', {

            }).then(function(response) {
                if (response.data == "OK") {
                    console.log("testService completato");
                }
                else {
                    console.log("Errore testService");
                }
            }, function(err) {
                console.log("/testService - errore post:  ", err);
            });

        };



        $scope.prova = function() {
            console.log("controlloNomeFile, value: ", $scope.value);
            if ($scope.value == undefined) {
                alert("Nessun file selezionato");
            }
            else
                alert("ok:", $scope.value);
        };



        $scope.leggiFileTxtPagine = function() {
            console.log("entrato in $scope.leggiFileTxtPagine");
            $http.post('/leggiFileTxtPagine', {
                pagina: $scope.pageName
            }).then(function(response) {
                console.log("leggiFileTxtPagine, response: ", response.data);
                $scope.fileNames = response.data;
                console.log("fileNames: ", $scope.fileNames);
            }, function(err) {
                console.log("/leggiFileTxtPagine - errore post:  ", err);
            });
        };



        $scope.fileuploadREPO = function(x) {
            console.log("entrato in $scope.fileuploadREPO " + x);
            $http.post('/fileuploadREPO', {
                nome: x //'"'+x+'"'
            }).then(function(response) {
                console.log("fileuploadREPO success");
                //$scope.inputFileName_num = x;
                $scope.fileNameNumber(x);
                $scope.txt_001 = response.data;
            }, function(err) {
                console.log("/fileuploadREPO - errore post:  ", err);
            });

        };



        $scope.leggiImgPagine = function() {
            console.log("entrato in $scope.leggiImgPagine");
            $http.post('/leggiImgPagine', {
                pagina: $scope.pageName
            }).then(function(response) {
                console.log("leggiImgPagine, response: ", response.data);
                $scope.imgNames = response.data;
                console.log("imgNames: ", $scope.imgNames);
            }, function(err) {
                console.log("/leggiImgPagine - errore post:  ", err);
            });
        };




        $scope.imguploadREPO = function(x) {
            console.log("entrato in $scope.imguploadREPO " + x);


            $http.post('/imguploadREPO', {
                nome: x, //'"'+x+'"'
                pagina: $scope.pageName
            }).then(function(response) {
                console.log("imguploadREPO success");
                //$scope.inputFileName_num = x;
                $scope.imgpath = response.data;


                var imgPathNameToSaveAs = $state.current.templateUrl;
                var n = imgPathNameToSaveAs.lastIndexOf("/");
                var url = window.location.protocol + "//" + window.location.host;
                console.log(" url = " + url);
                imgPathNameToSaveAs = url + imgPathNameToSaveAs.substr(0, n) + "/img/";
                console.log(" imgPathNameToSaveAs = ", imgPathNameToSaveAs);


                $scope.imgurl = imgPathNameToSaveAs + x;

                //$scope.fileNameNumber(x);
                $scope.img_001 = $scope.imgurl;

            }, function(err) {
                console.log("/imguploadREPO - errore post:  ", err);
            });

        };



        $scope.preview = function() {
            console.log("entrato in $scope.preview");
            $scope.divPreview = $sce.trustAsHtml($scope.txt_001);
        };





        $scope.loadFileAsText = function() {
            console.log("entrato in $scope.loadFileAsText: ");

            //fileReader viene definito nel controller e fa riferimento a una factory presente nel file fileReaderModule.js
            fileReader.readAsText($scope.file, $scope).then(function(result) {
                console.log(result);
                //$scope.inputFileName_num = $scope.file.name;
                $scope.fileNameNumber($scope.file.name);
                $scope.txt_001 = result;
            });
        };



        $scope.savePage = function() {

            var textToSave = $scope.txt_001; //contenuto html
            var fileNameToSaveAs = $state.current.name; //25/07/2017 15:24 Luca pagename è il nome di dove ci troviamo

            var filePathNameToSaveAs = $state.current.templateUrl;
            var n = filePathNameToSaveAs.lastIndexOf("/");
            filePathNameToSaveAs = filePathNameToSaveAs.substr(0, n) + "/include.html";

            console.log("savePage: \ntextToSave:" + textToSave + "\nfileNameToSaveAs:" + fileNameToSaveAs);


            $http.post('/textupload', {
                // nome , contenuto , path di salvataggio (include) , username 
                fileName: fileNameToSaveAs,
                htmlContent: textToSave,
                includeFilePathName: filePathNameToSaveAs,
                username: $scope.username
            }).then(function(response) {
                alert("The file was succesfully saved! File savato nella cartella uploads del progetto");
                 $state.go("persPage");
            }, function(err) {
                console.log("/textupload - errore post:  " + JSON.stringify(err));
            });
        };



        $scope.goForm = function() {

            document.getElementById("form1_hname").value = $scope.username;
            document.getElementById("form1_hpagename").value = $scope.pageName;

            var n = $state.current.templateUrl.lastIndexOf("/");
            // / templateUrl: '/javascripts/module/homePagesModule/chiSiamo/homeModule.html'
            var state_current_templateUrl = $state.current.templateUr.substr(0, n);
            //  '/javascripts/module/homePagesModule/chiSiamo'
            document.getElementById("form1_url_site").value = window.location.protocol + "//" + window.location.host + state_current_templateUrl + "/img/";
            //  '/javascripts/module/homePagesModule/chiSiamo/img/'


            console.log("form1_hname" + document.getElementById("form1_hname").value);
            console.log("form1_hpagename" + document.getElementById("form1_hpagename").value);
            console.log("form1_url_site" + document.getElementById("form1_url_site").value);

        };



    });
