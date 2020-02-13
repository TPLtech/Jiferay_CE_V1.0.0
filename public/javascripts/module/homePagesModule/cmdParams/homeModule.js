angular.module('cmdParamsModule', [])
    .config(function($stateProvider) {
        $stateProvider.state('cmdParams', {
            //url: '/cmdParams',
            controller: 'cmdParamsController',
            templateUrl: '/javascripts/module/homePagesModule/cmdParams/homeModule.html',
            jp_app_name: 'resourceLanguage',
            Jp_app_version: 'v1.0.0',
            Jp_app_menu: 'cmdParams'
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




angular.module('cmdParamsModule')
    .controller('cmdParamsController', function($scope, $http, $state, $sce, $stateParams) {



        $scope.initAll = function() {
            $scope.pageSize = 5;
            $scope.pageSize1 = 5;
            $scope.currentPage = 1;
            $scope.currentPage1 = 1;
            console.log("entrato in $scope.initAll");
            //$scope.getResource();
            $scope.loadParams();
        };


        //aggiornamento risorse in lingua 
        //fase 1: parsing risorse in lingua ed estrazione nuove risorse
        //fase 2: inserimento in DB delle risorse X ogni lingua, inserendo  lang_resource == standard_lang_resource, new = 1
        //        la fase 2 va ripetuta per ciascuna lang



        $scope.loadParams = function() {
            console.log("sono dentro a loadParams" + cmdSql);
            var cmdSql = "SELECT * FROM params;";
            $http.post('/ajax_mysql', {
                    param0: 'mysql',
                    param1: 'select',
                    param2: cmdSql,
                    param3: '.',
                    param4: '.',
                    param5: '.'
                })
                .then(function(response) {

                        console.log('**************************************************loadParams - response.data = ' + JSON.stringify(response.data));

                        $scope.params = response.data;

                    },
                    function(err) {
                        console.log("**********************************************error loadParams:  " + JSON.stringify(err));
                        //gestire caso utente gia creato
                        $scope.error = true;
                    });
        };



        $scope.newParam = function() {

            console.log("newParam" + $scope.name + $scope.value + $scope.descr + $scope.category);

            var cmdSql = " * FROM params;";
            $http.post('/ajax_mysql', {
                    param0: 'mysql',
                    param1: 'select',
                    param2: cmdSql,
                    param3: '.',
                    param4: '.',
                    param5: '.'
                })
                .then(function(response) {

                        console.log('**************************************************loadParams - response.data = ' + JSON.stringify(response.data));

                        $scope.params = response.data;

                    },
                    function(err) {
                        console.log("**********************************************error loadParams:  " + JSON.stringify(err));
                        //gestire caso utente gia creato
                        $scope.error = true;
                    });

        }


        $scope.saveResource = function(paramRow) {


            var cmdSql = 'UPDATE params SET name = "' + paramRow.name + '" , value = "' + paramRow.value +
                '" , descr = "' + paramRow.descr + '" , category = "' + paramRow.category + '" WHERE id = ' + paramRow.id + ';';
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

            }, function(err) {
                console.log("UPDATE lang_resource errore post:  " + JSON.stringify(err));
                $scope.error = true;
            });
            // }

        };



    });
