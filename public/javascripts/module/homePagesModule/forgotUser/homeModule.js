angular.module('forgotUserModule', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('forgotUser', {
            //url: '/forgotUser',
            controller: 'forgotUserController',
            templateUrl: '/javascripts/module/homePagesModule/forgotUser/homeModule.html',
            jp_app_name: 'forgotUser',
            Jp_app_version: 'v1.0.0',
            Jp_app_menu: 'forgotUser'
        });
    });

angular.module('forgotUserModule')
    .controller('forgotUserController', function($rootScope, $scope, $http, $state, $window) {

        $scope.showfirstDiv = true;

        $scope.controlloMail = function() {
            $scope.errMail = false;
            if ($scope.email_for == null || $scope.email_for == "")
                $scope.errMail = true;
        };



        $scope.recuperaUsername = function() {

            console.log("entrato in recuperaUsername");

            $http.post('/recuperaUser', { //Chiama funzione per recupero username
                    email: $scope.email_for
                })
                .then(function(response) {

                    $scope.showfirstDiv = false; //Cambia Testo HTML
                    console.log('recuperaUser mail inviata');

                }, function(err) {
                    console.log("errore /recuperaUser chiamata :  " + JSON.stringify(err));
                });

        }; //Fine recuperaUsername

    });