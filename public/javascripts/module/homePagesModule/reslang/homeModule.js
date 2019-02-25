angular.module('reslangModule', [])
    .config(function($stateProvider) {
        $stateProvider.state('reslang', {
            //url: '/reslang',
            controller: 'reslangController',
            templateUrl: '/javascripts/module/homePagesModule/reslang/homeModule.html',
            jp_app_name: 'resourceLanguage',
            Jp_app_version: 'v1.0.0',
            Jp_app_menu: 'reslang'
        });

    });



var row;
var col;

// var row_num;
// var col_num;


var QueryString = function() {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        }
        else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        }
        else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();





angular.module('reslangModule')
    .controller('reslangController', function($scope, $http, $state, $sce, $stateParams) {

        $scope.lang_setted = "< Scegli la Lingua >";
        $scope.checkUpdateRL = [];
        $scope.insertText = function() {
            console.log("entrato in $scope.insertText");
            $scope.divSiteText = $sce.trustAsHtml($scope.txt_001);
        };



        $scope.initAll = function() {
            $scope.pageSize = 10;
            $scope.pageSize1 = 10;
            $scope.currentPage = 1;
            $scope.currentPage1 = 1;
            console.log("entrato in $scope.initAll");
            //$scope.getResource();
            $scope.loadLanguages();
        };


        //aggiornamento risorse in lingua 
        //fase 1: parsing risorse in lingua ed estrazione nuove risorse
        //fase 2: inserimento in DB delle risorse X ogni lingua, inserendo  lang_resource == standard_lang_resource, new = 1
        //        la fase 2 va ripetuta per ciascuna lang




        $scope.lrExtraction = function() {

            $http.post('/lrExtraction', {

            }).then(function(response) {
                console.log("/listaPagine', response: ", JSON.stringify(response.data));
            }, function(err) {
                console.log("/listaPagine', err: " + JSON.stringify(err));
            });
        };



        $scope.AlignLR = function(lang) {

            if (lang == "it_IT") {
                console.log("lingua base, non serve fare l'allineamento");
            }
            else {

                $http.post('/AlignLR', {
                    lang: lang
                }).then(function(response) {
                    console.log("/listaPagine', response: ", JSON.stringify(response.data));
                }, function(err) {
                    console.log("/listaPagine', err: " + JSON.stringify(err));
                });
            }
        };







        $scope.loadLanguages = function() {
            console.log("sono dentro a loadLanguages");
            var cmdSql = {
                param0: 'mysql',
                param1: 'select',
                param2: "SELECT * FROM languages;",
                param3: '.',
                param4: '.',
                param5: '.'
            };
            $http.post('/ajax_mysql', cmdSql)
                .then(function(response) {

                        for (var i = 0; i < response.data.length; i++) {
                            if ($scope.lang_current == response.data[i].lang) {
                                console.log("response.data[i] =  " + JSON.stringify(response.data[i]));
                                $scope.lang_selected = response.data[i].lang;
                                $scope.label_selected = response.data[i].label;
                                $scope.image_selected = response.data[i].image;
                                console.log("$scope.image_lang_selected    " + $scope.image_lang_selected);
                            }
                        }
                        console.log('loadLangResources - response.data = ' + JSON.stringify(response.data));
                        $scope.lingue = response.data;
                        $scope.lingue.image = $scope.url + response.data.image;

                        $scope.setLangCurrent($scope.lang_selected, $scope.label_selected, $scope.image_selected);

                    },
                    function(err) {
                        console.log("/errore http per inserimento testo lang:  " + JSON.stringify(err));
                        //gestire caso utente gia creato
                        $scope.error = true;
                    });
        };



        $scope.newModal = function() {
            $scope.newlr = "";
        };



        $scope.setLangCurrent = function(lang, label, image) {
            $scope.Alang_selected = label;
            if (image != "")
                $scope.Aimage_lang_selected = $scope.url + image;
            $scope.Alang_lang = lang;

            console.log("lang scelta=" + lang);
            var cmdSql = {
                param0: 'mysql',
                param1: 'select',
                param2: 'SELECT * FROM lang_resources WHERE language="' + lang + '";',
                param3: '.',
                param4: '.',
                param5: '.',
            };
            $http.post('/ajax_mysql', cmdSql)
                .then(function(response) {
                    $scope.resource = response.data;

                    for (var i = 0; i < response.data.length; i++) {
                        $scope.checkUpdateRL[response.data[i].id] = response.data[i].lang_resource;
                    }

                    console.log("$scope.checkUpdateRL  " + $scope.checkUpdateRL[1]);
                    $scope.AlignLR($scope.Alang_lang);

                }, function(err) {
                    console.log("errore setLangCurrent:  " + err);
                });
        };





        $scope.SaveLR = function() {
            console.log("Salvataggio nuovo contenuto letterario" + $scope.lingue.length);
            //$scope.lr = $scope.slr;
            var exist = false;
            for (var n = 0; n < $scope.resource.length; n++) {
                if ($scope.newlr === $scope.resource[n].standard_lang_resource) {
                    var exist = true;
                }
            }

            if (!exist) {
                for (var i = 0; i < $scope.lingue.length; i++) {

                    var forlang = JSON.stringify($scope.lingue[i].lang);
                    console.log(forlang);
                    var cmdSql = {
                        param0: 'mysql',
                        param1: 'insert into',
                        param2: 'insert into lang_resources (standard_lang_resource,language,lang_resource,new)values ("' + $scope.newlr + '",' + forlang + ',"' + $scope.newlr + '",1);',
                        param3: '.',
                        param4: '.',
                        param5: '.',
                    };
                    $http.post('/ajax_mysql', cmdSql)
                        .then(function(response) {
                            console.log("Inserimento avvenuto N°: " + i);

                            console.log("$scope.Alang_lang,   $scope.Alang_selected,   $scope.Aimage_lang_selected   " + $scope.Alang_lang + "   " + $scope.Alang_selected + "   " + $scope.Aimage_lang_selected);
                            $scope.setLangCurrent($scope.Alang_lang, $scope.Alang_selected, "");
                            $scope.newlr = "";

                        }, function(err) {
                            console.log("errore SaveLR:  " + err);
                        });

                }
            }
            else {
                alert("Contenuto già esistente");
            }



        }; //function







        $scope.saveResource = function(lang_resource, id) {

            console.log("saveResource/rlang  " + lang_resource);
            console.log("saveResource/id  " + id);
            console.log("$scope.checkUpdateRL[id]  " + $scope.checkUpdateRL[id]);
            //controllo se risorsa aggiornata == originale, nel caso salto update
            if ($scope.checkUpdateRL[id].valueOf() != lang_resource.valueOf()) {


                var cmdSql = 'UPDATE lang_resources SET lang_resource = "' + lang_resource + '", new = 1 WHERE id = "' + id + '";';
                console.log("cmdSql" + cmdSql);
                $http.post('/ajax_mysql', {
                    param0: 'mysql',
                    param1: 'update',
                    param2: cmdSql,
                    param3: '.',
                    param4: '.',
                    param5: '.',
                }).then(function(response) {
                    console.log("UPDATE lang_resource:" + response.data);
                    $scope.checkUpdateRL[id] = lang_resource;
                    console.log("$scope.checkUpdateRL[id+1]  " + $scope.checkUpdateRL[id]);

                }, function(err) {
                    console.log("UPDATE lang_resource errore post:  " + JSON.stringify(err));
                    $scope.error = true;
                });
            }


            else {
                console.log("testo non modificato, evito UPDATE");
            }
        };



        $scope.delete = function(rigaID) {



            var cmdSql = {
                param0: 'mysql',
                param1: 'delete',
                param2: 'delete FROM lang_resources WHERE id=' + rigaID + ';',
                param3: '.',
                param4: '.',
                param5: '.',
            };
            $http.post('/ajax_mysql', cmdSql)
                .then(function(response) {
                    console.log("delete avvenuto ");
                    $scope.setLangCurrent($scope.Alang_lang, $scope.Alang_selected, "");
                }, function(err) {
                    console.log("errore delete:  " + err);
                });


        }; //function



        $scope.clearSearch = function() {
            $scope.filtro = "";
        };





    });
