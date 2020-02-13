angular.module('progettiModule', ['ui.router'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('progetti', {
      //url: '/progetti',
      controller: 'progettiController',
      templateUrl: '/javascripts/module/homePagesModule/progetti/homeModule.html',
      jp_app_name: 'registrazione',
      Jp_app_version: 'v1.0.0',
      Jp_app_menu: 'progetti'
    });
  });

angular.module('progettiModule')
  .controller('progettiController', function($rootScope, $scope, $state, $http) {
    $scope.text = "Io sono progetti";


  });
