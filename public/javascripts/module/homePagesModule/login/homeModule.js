angular.module('loginModule', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('login', {
            //url: '/login',
            controller: 'loginController',
            templateUrl: '/javascripts/module/homePagesModule/login/homeModule.html',
            jp_app_name: 'accesso',
            Jp_app_version: 'v1.0.0',
            Jp_app_menu: 'login'
        });
    });

angular.module('loginModule')
    .controller('loginController', function($rootScope, $scope, $http, $state) {

        $scope.err = false;
        $scope.baseMenus;
        $rootScope.showDivLeftSubMenu = false;
        $rootScope.myDropdown = true;
        $rootScope.myDropdownLogged = false;
        $rootScope.myDropdownLoggedAdmin = false;
        $scope.w = false;
        $scope.divGroups = false;
        $scope.login_div_show = true;

        $rootScope.menu = '';



        $scope.ForgotPW = function() {
            console.log("entrato in ForgotPW");

            var cmdSql = "SELECT * FROM users WHERE email='" + $scope.email + "';"; //controllo se esistente
            $http.post('/ajax_mysql', {
                    param0: 'mysql',
                    param1: 'select',
                    param2: cmdSql,
                    param3: '.',
                    param4: '.',
                    param5: '.',
                })
                .then(function(response) {
                        console.log('ForgotPW', response.data);

                        //if("response.data.flagChangePW==1")//per evitare la continua richiesta di cambio / impedire cambi involontari
                        //questo disabilita il link nella mail dopo averlo cliccato
                        if (response.data.flagChangePW == 1) {
                            alert("email gia inviata, controlla nella casella di posta");
                        }
                        else { //invio la mail
                            $http.post('/ForgotPW', {
                                    email: $scope.email
                                })
                                .then(function(response) {
                                    console.log('ForgotPW mail inviata');

                                    var cmdSql = "UPDATE users SET flagChangePW = 1 WHERE email='" + $scope.email + "';";
                                    //setto il flag, procedura avviata
                                    $http.post('/ajax_mysql', {
                                            param0: 'mysql',
                                            param1: 'select',
                                            param2: cmdSql,
                                            param3: '.',
                                            param4: '.',
                                            param5: '.',
                                        })
                                        .then(function(response) {
                                            console.log("mail inviata correttamente");
                                        }, function(err) {
                                            console.log("errore ForgotPW UPDATE:  " + err);
                                        });
                                }, function(err) {
                                    console.log("errore /ForgotPW chiamata :  " + err);
                                });
                        }
                    },
                    function(err) {
                        console.log("errore ForgotPW SELECT:  " + err);
                    });
        };
        


        $scope.controlloLoginUser = function() {
            $scope.errUsername = false;
            if ($scope.username == null || $scope.username == "")
                $scope.errUsername = true;
        };



        $scope.controlloLoginPsw = function() {
            $scope.errPsw = false;
            if ($scope.password == null || $scope.password == "")
                $scope.errPsw = true;
        };



        $scope.postLogin = function() {
            console.log("entrato in postLogin");
            //Con una sola chiamata a server ottengo 
            //viene ritornato un response.data con 3 tabelle:       
            //   id, password : response.data[0]
            //   gruppi : response.data[1]       
            //   menu tradotti dei gruppi : response.data[2] 
            $http.post('/postloginV2', {
                username: $scope.username,
                password: $scope.password
            }).then(function(response) { //---------tutto OK, Login positivo
                if (response.data == "Login Fallito") { //KO login
                    $scope.err = true; //warning
                }
                else { //OK login
                
                    //Qua anrebbe controllo con QR Code!
                    
                    console.log("JSON ritornato da server-id, password : response.data[0] : " +
                        JSON.stringify(response.data[0]));
                    console.log("JSON ritornato da server-gruppi : response.data[1] : " +
                        JSON.stringify(response.data[1]));
                    console.log("JSON ritornato da server-menu tradotti dei gruppi : response.data[2] : " +
                        JSON.stringify(response.data[2]));
                    //viene ritornato un response.data con 3 tabelle:       
                    //   id, password : response.data[0]
                    //   gruppi : response.data[1]       
                    //   menu tradotti dei gruppi : response.data[2] 
                    $rootScope.username = $scope.username;
                    $rootScope.sign_in_button = $scope.username;

                    $scope.login_div_show = false;
                    $scope.w = false;
                    //(response.data[1].length == 0 = login failed, è già stato escluso

                    console.log("numero gruppi : " + response.data[1].length);

                    if (response.data[1].length <= 1) { //È presente un solo gruppo relativo a quell'utente
                        
                        console.log("presente solo 1 gruppo");
                        console.log(response.data[1][0].id_group);
                        $scope.gruppo = response.data[1][0].id_group;
                        
                        $rootScope.menus = response.data[2];
                        $scope.funcPOSTgetChosenGroupMenus(response.data[1][0]);


                    }
                    else { //PIU GRUPPI
                        //Sono presenti più gruppi relativi a quell'utente: 
                        // l'utente sceglie un gruppo e viene eseguita 
                        // la funzione funcPOSTgetMenusV2(gruppo)
                        console.log("presenti piu gruppi");


                        $rootScope.groupRows = response.data[1];
                        $rootScope.menus = response.data[2];

                        $scope.divLogin = false;
                        $scope.divGroups = true; // Con questa viene evidenziata la lista dei gruppi
                    }


                }

            }, function(err) {
                console.log("errore post:  " + err);
            });

        };



        $scope.funcPOSTgetChosenGroupMenus = function(group) {
            //leggo i menu del grupppo funcPOSTgetChosenGroupMenus scelto
            console.log("-----------------------------------------------")
            $rootScope.group = group;
            var gruppo = $rootScope.group.id_group;
            console.log("Group Selected: " + $rootScope.group.id_group);
            console.log("$rootScope.menus: " + JSON.stringify($rootScope.menus));

            if ($rootScope.group.id_group == 1) {
                //imposto menu user-admin
                $rootScope.myDropdown = false;
                $rootScope.myDropdownLogged = false;
                $rootScope.myDropdownLoggedAdmin = true;
            }
            else {
                //imposto menu user
                $rootScope.myDropdown = false;
                $rootScope.myDropdownLogged = true;
                $rootScope.myDropdownLoggedAdmin = false;
            }
            
            // $scope.funcPOSTgetMenusAtLogin($rootScope.group.id_group); // chiama la stored procedure
            //baseMenus
            var arrayMenu = [];
            $rootScope.baseMenus = [];
            $rootScope.submenus =  [];
            $rootScope.submenus2 = [];
            $rootScope.submenus3 = [];
            $rootScope.submenus4 = [];
            $rootScope.submenus5 = [];
            
            for (var i = 0; i < $rootScope.menus.length; i++) {
                //Salva in un array solamente le voci di menu corrispondenti al gruppo scelto
                if (($rootScope.menus[i].id_groups == gruppo ||
                    $rootScope.menus[i].id_groups == "BASE") &&
                    $rootScope.menus[i].branch == "0") {

                    $rootScope.baseMenus.push($rootScope.menus[i]);
                }


                if (($rootScope.menus[i].id_groups == gruppo ||
                    $rootScope.menus[i].id_groups == "BASE") &&
                    $rootScope.menus[i].branch == "1") {

                    $rootScope.submenus.push($rootScope.menus[i]);
                    
                }
                
                if (($rootScope.menus[i].id_groups == gruppo ||
                    $rootScope.menus[i].id_groups == "BASE") &&
                    $rootScope.menus[i].branch == "2") {

                    $rootScope.submenus2.push($rootScope.menus[i]);
                }
                
                if (($rootScope.menus[i].id_groups == gruppo ||
                    $rootScope.menus[i].id_groups == "BASE") &&
                    $rootScope.menus[i].branch == "3") {

                    $rootScope.submenus3.push($rootScope.menus[i]);
                }
                
                if (($rootScope.menus[i].id_groups == gruppo ||
                    $rootScope.menus[i].id_groups == "BASE") &&
                    $rootScope.menus[i].branch == "4") {

                    $rootScope.submenus4.push($rootScope.menus[i]);
                }
                
                if (($rootScope.menus[i].id_groups == gruppo ||
                    $rootScope.menus[i].id_groups == "BASE") &&
                    $rootScope.menus[i].branch == "5") {

                    $rootScope.submenus5.push($rootScope.menus[i]);
                }
            }
            
            console.log("baseMenus: " +JSON.stringify($rootScope.baseMenus));
            console.log("submenus: " +JSON.stringify($rootScope.submenus));
            console.log("submenus2: " +JSON.stringify($rootScope.submenus2));
            console.log("submenus3: " +JSON.stringify($rootScope.submenus3));
            console.log("submenus4: " +JSON.stringify($rootScope.submenus4));
            console.log("submenus5: " +JSON.stringify($rootScope.submenus5));
        
            
            $state.go('persPage');
            
        }; //funcNamePOST=function



        $scope.funcResolveMenu = function(arrayMenu) {
            //funzione che carica da menu la pagina centrale in divPage (o iframe)
            console.log("HM funcResolveMenu()");
            //console.log("arrayMenu : " + JSON.stringify(arrayMenu[0]));

            $rootScope.baseMenus = arrayMenu;

            //$rootScope.groupUser = $scope.arrayMenu;

            $rootScope.divShow_admin = false;
            $rootScope.divShow_webMaster = false;
            $rootScope.divShow_tecnici = false;
            $rootScope.divShow_tests = false;
            $rootScope.divShow_moderator = false;
            $rootScope.divShow_backOffice = false;
            $rootScope.divShow_registeredUsers = false;
            $rootScope.divShow_procurement = false;
            $rootScope.divShow_suppliersEComm = false;
            $rootScope.divShow_club = false;
            $rootScope.divShow_webMaster = false;

            if ($rootScope.group.name == "admin") $rootScope.divShow_admin = true;
            if ($rootScope.group.name == "webmaster") $rootScope.divShow_webMaster = true;
            if ($rootScope.group.name == "tecnici") $rootScope.divShow_tecnici = true;
            if ($rootScope.group.name == "tests") $rootScope.divShow_tests = true;
            if ($rootScope.group.name == "moderator") $rootScope.divShow_moderator = true;
            if ($rootScope.group.name == "backOffice") $rootScope.divShow_backOffice = true;
            if ($rootScope.group.name == "registeredUsers") $rootScope.divShow_registeredUsers = true;
            if ($rootScope.group.name == "procurement") $rootScope.divShow_procurement = true;
            if ($rootScope.group.name == "suppliersEComm") $rootScope.divShow_suppliersEComm = true;
            if ($rootScope.group.name == "club") $rootScope.divShow_club = true;
            if ($rootScope.group.name == "admin") $rootScope.divShow_webMaster = true;

            $state.go('persPage');

        };


    });
