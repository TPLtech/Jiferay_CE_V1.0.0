angular.module('headerModule', ['ui.router'])
    .controller('headerController', ['$rootScope', '$scope', '$http', '$window', '$state',
        function($rootScope, $scope, $http, $window, $state) {


            $scope.title = "";
            $scope.subTitle = "";
            $rootScope.showDivLeftSubMenu = false;
            $scope.submenus = ""; //Sotto livello 1
            $scope.submenus2 = ""; //Sotto livello 2
            $scope.myDropdown = true;
            $scope.myDropdownLogged = false;
            $scope.myDropdownLoggedAdmin = false;

            $rootScope.username = "";

            $rootScope.sign_in_button = "Sign in";

            $scope.url = window.location.protocol + "//" + window.location.host;

            var fromDropDown = 0;

            $scope.initAll = function() {


                var lang = $window.navigator.language;
                if (lang == "it" || lang == "it-IT") {
                    // lang = "en_EN";
                    lang = "it_IT";
                    //languag = "it-IT";
                }

                $scope.lang_default = lang;
                $rootScope.lang_current = lang;
                console.log("initAll-loadLanguages");
                $scope.loadLanguages_at_init();
                console.log("initAll-loadLangResources");
                $scope.loadLangResources(fromDropDown);
                console.log("initAll-funcPOSTgetMenusHome");

            };

            //-------LANG MANAGEMENT------------------------------------------------------------------------------------------------------------------

            //risoluzione del LOCALE 
            //caricamento da DB delle lr[] language resources del locale risolto
            // $window.navigator.language               language taken from computer
            // $window.navigator.userLanguage            language taken from browser

            $rootScope.lres = {}; //New object - Hashtable
            // lr['<standard_res>'] = ['<res>'']; 
            // $scope.lres['michele'] = 'mike'; // sarà caricata da DB qry= "select standard_res,res from lang_res where locale='"+$scope.locale+"'";
            // $scope.lres['Associazione'] = 'Association'; // sarà caricata da DB qry= "select standard_res,res from lang_res where locale='"+$scope.locale+"'";
            // alert($scope.lres['michele']); // Will alert with [1,10,5]

            //la chiamata sarà : lr("michele");
            //la chiamata sarà : lr(<std_lang_res,err>);

            $scope.standard_lr = [];
            $scope.lang_lr = [];
            $rootScope.id_group = 0;
            var init = true; //for lang management , not  to exec funcPostGetMenus() in setLangCurrent_and_load_res() when init.



            $scope.loadLangResources = function(fromDropDown) { //cerca tutte le risorse data una determinata lingua(current)

                console.log("loadLangResources()");
                var cmdSql = {
                    param0: 'mysql',
                    param1: 'select',
                    param2: "SELECT * FROM lang_resources WHERE language = '" + $scope.lang_current + "';",
                    param3: '.',
                    param4: '.',
                    param5: '.'
                };
                console.log("cmdSql" + cmdSql.param2);
                $http.post('/ajax_mysql', cmdSql)
                    .then(function(response) {
                        console.log('loadLangResources - /ajax_mysql- response.data');
                        console.log(response.data);
                        console.log(response.data.length);
                        for (var i = 0; i < response.data.length; i++) {
                            console.log('loadLangResources - dentro for');
                            //carica in 2 array tutte le risorse data una lingua, per il confronto
                            $scope.standard_lr[i] = response.data[i].standard_lang_resource;
                            $scope.lang_lr[i] = response.data[i].lang_resource;

                            //$scope.lr[response.data[i].standard_lang_resource] = response.data[i].lang_resource;
                        }
                        console.log("loadLangResources - dopo for - $scope.lang_lr = " + $scope.lang_lr);


                        //*********   traduzione menus submenus   **************************************************BUGFIX 21/11/17 cambio lingua da loggato
                        if (!$scope.username)
                            $scope.funcPOSTgetMenusHome(0); // attivata per visitatori non loggati
                        else
                            $scope.funShowGroupMenu($scope.group);

                    }, function(err) {
                        console.log("/errore http per inserimento testo lang:  " + JSON.stringify(err));
                        //gestire caso utente gia creato
                        $scope.error = true;
                    });
            };



            $rootScope.lr = function(std_lang_res) { // assign lang resource 
                var lang_res;
                for (var i = 0; i < $scope.standard_lr.length; i++) {
                    //$scope.lr['michele'] = 'mike'; 

                    //std_lang_res è la risorsa da tradurre, scritta in lingua STANDARD
                    //$scope.standard_lr[]  è l'Array in cui sono caricate le risorse in lingua STANDARD)
                    //$scope.lang_lr[]  è l'Array in cui sono caricate le risorse in lingua CORRENTE (quella richiesta dall'utente)

                    if ($scope.standard_lr[i] == std_lang_res) {
                        lang_res = $scope.lang_lr[i];
                        if ($scope.lang_lr[i] == "") { //se manca la traduzione, prondo lo standard
                            console.log("$rootScope.lr() - RICERCA DI  $scope.lang_lr[" + i + "] =" + $scope.lang_lr[i]);
                            lang_res = std_lang_res;
                        }
                        break;
                    }
		     else{
		      	  lang_res = std_lang_res;
                    }
                }
                return (lang_res);
            };



            $scope.loadLanguages_at_init = function() { //viene saltato se clicco il dropdown, perche deve essere eseguito solo all'init
                console.log("sono dentro a loadLanguages");
                var cmdSql = {
                    param0: 'mysql',
                    param1: 'select',
                    param2: "SELECT * FROM languages;",
                    param3: '',
                    param4: '',
                    param5: ''
                };
                $http.post('/ajax_mysql', cmdSql)
                    .then(function(response) {

                            for (var i = 0; i < response.data.length; i++) {
                                if ($scope.lang_current == response.data[i].lang) {
                                    console.log("response.data[i] =  " + JSON.stringify(response.data[i]));
                                    $scope.lang_selected = response.data[i].lang;
                                    $scope.label_selected = response.data[i].label;
                                    $scope.image_selected = response.data[i].image;
                                    console.log("$rootScope.image_lang_selected    " + $rootScope.image_lang_selected);
                                }
                            }
                            console.log('loadLangResources - response.data = ' + JSON.stringify(response.data));
                            $scope.lingue = response.data;
                            $scope.lingue.image = $scope.url + response.data.image;

                            $scope.setLangCurrent_and_load_res($rootScope.lang_selected, $rootScope.label_selected, $rootScope.image_selected, 0);

                        },
                        function(err) {
                            console.log("/errore http per inserimento testo lang:  " + JSON.stringify(err));
                            //gestire caso utente gia creato
                            $scope.error = true;
                        });
            };



            $scope.setLangCurrent_and_load_res = function(lang, label, image, fromDropDown) {
                $rootScope.lang_selected = label; //for upper partof dropdown
                $rootScope.image_lang_selected = $scope.url + image; //for upper partof dropdown
                $rootScope.lang_current = lang;

                console.log("setLangCurrent_and_load_res() - lang scelta=" + $rootScope.lang_selected + " fromDropDown=" + fromDropDown);
                $scope.loadLangResources(fromDropDown);

            };



            $scope.translateMenu = function(fromDropDown) {

                console.log("SONO NELLA translateMenu");

                if (fromDropDown) {
                    var baseMenusTranslated = [];

                    console.log("baseMenus = " + JSON.stringify($scope.baseMenus));

                    for (var i = 0; i < $scope.baseMenus.length; i++) {
                        var baseRow = $scope.baseMenus[i];
                        var menuName = baseRow.nome;
                        baseRow.nome = $scope.lr(menuName); // uses lang of this module 
                        baseMenusTranslated.push(baseRow);
                        console.log("baseRow = " + JSON.stringify(baseRow));
                    }
                    $scope.baseMenus = baseMenusTranslated;
                    console.log("$scope.baseMenus = " + JSON.stringify($scope.baseMenus));


                    if (!$scope.submenus == "") {
                        for (var i = 0; i < $scope.submenus.length; i++) {
                            var baseRow = $scope.submenus[i];
                            var menuName = baseRow.nome;
                            baseRow.nome = $scope.lr(menuName); // uses lang of this module 
                            baseMenusTranslated.push(baseRow);
                            console.log("baseRow = " + JSON.stringify(baseRow));
                        }
                        $scope.submenus = baseMenusTranslated;
                        console.log("$scope.submenus = " + JSON.stringify($scope.submenus));

                    }
                }
            }; //Fine translateMenu



            $scope.funcPOSTgetMenusHome = function(gruppo) {
                console.log("SONO NELLA funcPOSTgetMenusHome");
                var responseData;

                console.log("$rootScope.username : " + $scope.username);


                var cmdSql = "call sp_tpl_selectMenus(" + gruppo + ",'');";
                console.log("cmdSql = " + cmdSql);
                $http.post('/ajax_mysql', {
                    param0: 'mysql',
                    param1: 'call',
                    param2: cmdSql,
                    param3: '.',
                    param4: '.',
                    param5: '.',
                }). //2016
                then(function(response) {
                        responseData = JSON.stringify(response.data[0]);
                        console.log("response.data = " + responseData);

                        //document.getElementById("page_iframe").src = response.data[0].id_page; //caricamento pagina home
                        //PER TRADUZIONE

                        $scope.baseMenus = "";
                        var baseMenusTranslated = [];


                        for (var i = 0; i < response.data[0].length; i++) {
                            var baseRow = response.data[0][i];
                            var menuName = baseRow.nome;
                            var baseRow_nome = $scope.lr(menuName); // uses lang of this module
                            baseRow.nome = baseRow_nome;
                            baseMenusTranslated.push(baseRow);
                            console.log("baseRow = " + JSON.stringify(baseRow));
                        }

                        $scope.baseMenus = baseMenusTranslated;
                        console.log("$scope.baseMenus = " + JSON.stringify($scope.baseMenus));

                        //==========
                        //$scope.baseMenus = response.data[0];
                        //console.log("baseMenus = " + JSON.stringify($scope.baseMenus));
                        $scope.submenus = response.data[1];
                        console.log("submenus = " + JSON.stringify($scope.submenus));
                        $scope.submenus2 = response.data[2];
                        console.log("submenus2 = " + JSON.stringify($scope.submenus2));
                        $scope.submenus3 = response.data[3];
                        console.log("submenus3 = " + JSON.stringify($scope.submenus3));
                        $scope.submenus4 = response.data[4];
                        console.log("submenus4 = " + JSON.stringify($scope.submenus4));
                        $scope.submenus5 = response.data[5];
                        console.log("submenus5 = " + JSON.stringify($scope.submenus5));

                        // row prima baseMenus =                   {"id":20,"id_parent":null,"nome":"Eventi","id_users":null,"id_groups":"0","id_page":"eventi"}
                        // headerController.js:219 row baseMenus = {"id":20,"id_parent":null,"id_users":null,"id_groups":"0","id_page":"eventi"}
                        // $state.go('persPage');

                    },
                    function(response) {
                        console.log("errore post");
                    });
            }; //funcNamePOST=function



            $scope.loadGroup_s_Menu = function(groupRows) {

                console.log("loadGroup_s_Menu-groupRows:" + JSON.stringify(groupRows));
                $scope.btnsign = $scope.username;

                $scope.divLogin = false;
                $scope.divProfile = true;

                if (groupRows.length == 1) { //l'utente ha solo un gruppo
                    $scope.divProfile = false;
                    console.log("HC loadGroup_s_Menu- $scope.divProfile= " + $scope.divProfile);
                    $scope.funcPOSTgetMenus(groupRows[0]);

                    //carica pagina 1.menu

                } //$scope.loadGroup_s_Menu();
            };



            //Reindirizza alla pagina
            $scope.funShowPage = function(pageName) {
                console.log("funShowPage(" + pageName);
                $rootScope.showDivLeftSubMenu = false; //chiude il menu laterale in caso sia aperto
                $state.go(pageName); //equivalente di <a ui-sref={{x.id_page}}></a>
            };



            $scope.funHome = function() {
                $state.go('home'); //equivalente di <a ui-sref={{x.id_page}}></a>
            };



            $scope.funShowGroupMenu = function(group) {
                console.log("funShowGroupMenu()-funcPOSTgetMenus(" + JSON.stringify($scope.group));
                $scope.funcPOSTgetMenus($scope.group);
            };



            $scope.funcLogOut = function() {
                console.log("funcLogOut");
                $scope.username = "";
                $scope.myDropdown = true;
                $scope.myDropdownLogged = false;
                $scope.myDropdownLoggedAdmin = false;


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


                $rootScope.sign_in_button = "Sign in";


                $rootScope.menus = ''; //per renderlo visibile a tutti i controller
                $rootScope.baseMenus = [];
                $scope.funcPOSTgetMenusHome(0); //setta il valore giusto si basemenus


                $state.go('home'); //equivalente di <a ui-sref={{x.id_page}}></a>
            };



            // Chiude la navbar automaticamente quando si seleziona un elemento (caso collapse) diverso da dropdown
            $('.navbar-collapse').click(function($event) {

                console.log("$event.target.id: " + $event.target.id);

                if (($event.target.id == '') || ($event.target.id == undefined) || ($event.target.id == null)) {
                    console.log("Click on dropdown element");
                }
                else {
                    $(".navbar-collapse").collapse('hide');
                }
            });



            //Per assegnare classe corretta (multilivello)
            $scope.checkSub = function(x_idpage) {

                if (x_idpage == "") { //Se l'id page è vuota
                    var stile = "dropdown dropdown-submenu"; //Può avere submenu
                    return stile;
                }

            }; //Fine checkSub



            //Per assegnare classe ai Menu nella navbar (livello 0)
            $scope.checkFirstElement = function(x_idpage) {

                if (x_idpage == "") { //Se l'id page è vuota
                    var stile = "dropdown"; //Può avere submenu
                    return stile;
                }

            }; //Fine checkFirstElement



            //Click su un menu
            $scope.checkPage = function(x_id, x_idpage) {

                console.log("Pagina: " + x_idpage);

                if (x_idpage != "") { //Se non ha pagina
                    $scope.funShowPage(x_idpage); //Link alla pagina
                }
                else {
                    $scope.idlvl0 = x_id; //Assegna l'id per confronto con id_parent
                }

            }; //Fine checkPage



            //Con mouseover assegna id al livello appropriato
            $scope.checkParent = function(x_id, x_branch) {

                if (x_branch == 1) {
                    $scope.idlvl1 = x_id;
                }
                if (x_branch == 2) {
                    $scope.idlvl2 = x_id;
                }
                if (x_branch == 3) {
                    $scope.idlvl3 = x_id;
                }
                if (x_branch == 4) {
                    $scope.idlvl4 = x_id;
                }
                if (x_branch == 5) {
                    $scope.idlvl5 = x_id;
                }

            }; //Fine checkParent



        }
    ]);
