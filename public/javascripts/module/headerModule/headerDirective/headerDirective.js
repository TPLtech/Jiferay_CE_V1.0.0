angular.module('headerModule')
    .directive('headerDirective', [function() {
        return {
            restrict: 'E',
            templateUrl: '/javascripts/module/headerModule/headerDirective/headerDirective.html',
            replace: true,
            controller: 'headerController'
        };
    }]);
