angular.module('homeModule', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('home', {
            //url: '/home',
            controller: 'homeController',
            templateUrl: '/javascripts/module/homePagesModule/home/homeModule.html',
            jp_app_name: 'homePage',
            Jp_app_version: 'v1.0.0',
            Jp_app_menu: 'home'
        });
    });

angular.module('homeModule')
    .controller('homeController', function($rootScope, $scope, $http, $state, $window) {


    });
