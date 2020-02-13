angular.module('serviziModule', ['ui.router'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('servizi', {
      //url: '/servizi',
      controller: 'serviziController',
      templateUrl: '/javascripts/module/homePagesModule/servizi/homeModule.html',
      jp_app_name: 'registrazione',
      Jp_app_version: 'v1.0.0',
      Jp_app_menu: 'servizi'
    });
  });

angular.module('serviziModule')
  .controller('serviziController', function($rootScope, $scope, $state, $http) {
    $scope.text = "Io sono servizi";


  });
