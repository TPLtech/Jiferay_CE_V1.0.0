// angular.module('contentModule', ['ngSanitize'])
angular.module('contentModule', [])
    .config(function($stateProvider) {
        $stateProvider.state('content', {
            //url: '/content',
            controller: 'contentController',
            templateUrl: 'javascripts/module/homePagesModule/content/homeModule.html',
            jp_app_name: 'cmdHyperText',
            Jp_app_version: 'v1.0.0',
            Jp_app_menu: 'content'
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

angular.module('contentModule')
    .controller('contentController', function($scope, $http, fileReader, $sce, $state) {


        $scope.pageName = $state.current.name; //Nome della pagina, tassativamente uguale al nome dello $stateProvider.state della pagina
        var stat = $state;
        console.log("$state: " + JSON.stringify($state.current.name));
        $scope.number_txt = "001";
        $scope.numLettersName = 4;
        $scope.sideMenu = false;

        $scope.inState = function(state) {
            return $state.is(state);

        };



        $scope.fileNameNumber = function(fileName) {
            var res = fileName.slice($scope.numLettersName, $scope.numCifre);
            $scope.inputFileName_num = res;
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



        $scope.insertText = function() {
            console.log("entrato in $scope.insertText");
            $scope.divSiteText = $sce.trustAsHtml($scope.txt_001);
        };



        $scope.loadFileAsText = function() {
            console.log("entrato in $scope.loadFileAsText: ");

            //fileReader viene definito nel controller e fa riferimento a una factory presente nel file fileReaderModule.js
            fileReader.readAsText($scope.file, $scope).then(function(result) {
                console.log(result);
                $scope.fileNameNumber($scope.file.name);
                $scope.txt_001 = result;
            });
        };



        $scope.saveTextInTextarea = function() {
            console.log("entrato in $scope.uploadTextInTextarea: ");

            var textToSave = $scope.txt_001;
            var fileNameToSaveAs = $scope.pageName + $scope.inputFileName_num + ".txt";

            $http.post('/textupload', {
                testo: textToSave,
                nome: fileNameToSaveAs
            }).then(function(response) {
                alert("The file was succesfully saved! File savato nella cartella uploads del progetto (ALERT PROVVISORIO).");
            }, function(err) {
                console.log("/textupload - errore post:  " + JSON.stringify(err));
            });
        };

    });
