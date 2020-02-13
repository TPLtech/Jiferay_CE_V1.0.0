angular.module('footerModule')
    .controller('footerController', function($scope, footerService) {

        $scope.year = Date.now();

    });
