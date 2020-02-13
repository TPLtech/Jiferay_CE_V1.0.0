angular.module('forgotPWDModule', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('forgotPWD', {
            //url: '/forgotPWD',
            controller: 'forgotPWDController',
            templateUrl: '/javascripts/module/homePagesModule/forgotPWD/homeModule.html',
            jp_app_name: 'forgotPWD',
            Jp_app_version: 'v1.0.0',
            Jp_app_menu: 'forgotPWD'
        });
    });

angular.module('forgotPWDModule')
    .controller('forgotPWDController', function($rootScope, $scope, $http, $state, $window) {

        $scope.showfirstDiv = true;
        $scope.showQrCode = false;

        $scope.controlloUser = function() {
            $scope.errUsername = false;
            if ($scope.username_for == null || $scope.username_for == "")
                $scope.errUsername = true;
        };



        $scope.recuperaPassword = function() { //Funzione per recupero password

            console.log("entrato in recuperaPassword");

            var cmdSql = "SELECT id,email,tmp_pwd FROM users WHERE username ='" + $scope.username_for + "';"; //controlla se esiste username
            $http.post('/ajax_mysql', {
                    param0: 'mysql',
                    param1: 'select',
                    param2: cmdSql,
                    param3: '.',
                    param4: '.',
                    param5: '.',
                })
                .then(function(response) {

                        console.log('recuperaPassword', response.data[0]);

                        if (response.data[0].tmp_pwd != null) { //Se la password temporanea è gia stata impostata
                            alert("email già inviata, controlla nella casella di posta");
                        }
                        else { //invio la mail
                            $http.post('/recuperaPWD', { //Chiamata a server
                                    email: response.data[0].email,
                                    id: response.data[0].id
                                })
                                .then(function(response) {

                                    $scope.showfirstDiv = false; //Cambia scritta nell'HTML
                                    console.log('recuperaPWD mail inviata');

                                }, function(err) {
                                    console.log("errore /recuperaPWD chiamata :  " + err);
                                });
                        }
                    },
                    function(err) {
                        console.log("errore recuperaPWD SELECT:  " + err);
                    });
                    
        }; //Fine recuperaPassword




    });