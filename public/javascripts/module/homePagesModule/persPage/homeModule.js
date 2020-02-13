angular.module('persPageModule', [])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('persPage', {
      //url: '/persPage',
      controller: 'persPageController',
      templateUrl: '/javascripts/module/homePagesModule/persPage/homeModule.html',
      jp_app_name: 'paginaPersonale',
      Jp_app_version: 'v1.0.0',
      Jp_app_menu: 'persPage'
    });

  });

angular.module('persPageModule')
  .controller('persPageController', function($rootScope, $scope, $http, $state) {


    $scope.divModifica = false;
    $scope.divModificaPassword = false;

    console.log("sono dentro al perspage.js***************************");


    $scope.initAll = function() {
      // $scope.initTechs();
      // $scope.initLevels();
      console.log("$rootScope.username = " + $scope.username);

      if ($scope.username == undefined) {
        $state.go('login');
      }
      
    }; //Fine initAll


  }); //Controller
