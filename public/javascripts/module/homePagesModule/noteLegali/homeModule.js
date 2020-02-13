angular.module('noteLegaliModule', [])
    .config(function($stateProvider) {
        $stateProvider.state('noteLegali', {
            //url: '/noteLegali',
            controller: 'noteLegaliController',
            templateUrl: '/javascripts/module/homePagesModule/noteLegali/homeModule.html',
            jp_app_name: 'sponsor',
            Jp_app_version: 'v1.0.0',
            Jp_app_menu: 'noteLegali'
        });
    });
//homeController.js
angular.module('noteLegaliModule')
    .controller('noteLegaliController', function($scope, $http, fileReader, $sce, $state, $rootScope) {




    });
